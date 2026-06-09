import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { KeyRound, X, ShieldCheck, AlertTriangle, Trash2, Loader, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import agentService from '../../../services/agent.service';

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini', hint: 'Starts with "AIza…" — from Google AI Studio.' },
  { id: 'openai', label: 'OpenAI', hint: 'Starts with "sk-…" — from platform.openai.com.' },
  { id: 'anthropic', label: 'Anthropic (Claude)', hint: 'Starts with "sk-ant-…" — from console.anthropic.com.' },
];

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  animation: apiKeyFade 160ms ease both;
  @keyframes apiKeyFade { from { opacity: 0; } to { opacity: 1; } }
`;

const Modal = styled.div`
  width: min(560px, 100%);
  max-height: min(88vh, 760px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.35);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-navy), #1e40af);
  h3 { margin: 0; font-size: 16px; flex: 1; }
  button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: rgba(255,255,255,.16); color: #fff; cursor: pointer; display: grid; place-items: center; }
`;

const Body = styled.div`
  padding: 18px;
  display: grid;
  gap: 16px;
  overflow-y: auto;
  font-size: 13px;
  color: #1e293b;
`;

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 12px;
  background: #fff7ed;
  color: #b54708;
  border: 1px solid #fed7aa;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 11px;
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .title { font-weight: 700; color: #344054; flex: 1; }
  .status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; }
  .ok { color: #067647; }
  .none { color: #b54708; }
`;

const PrefButton = styled.button`
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; cursor: pointer;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-teal)' : '#cbd5e1')};
  background: ${(p) => (p.$active ? 'var(--color-teal)' : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : '#475467')};
`;

const Row = styled.div`display: flex; gap: 8px;`;
const Input = styled.input`
  flex: 1; padding: 9px 11px; border: 1px solid #cbd5e1; border-radius: 9px; font: inherit; font-size: 13px; outline-color: var(--color-navy);
`;
const SaveBtn = styled.button`
  display: inline-flex; align-items: center; gap: 5px; padding: 9px 13px; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer;
  border: 1px solid var(--color-navy); background: var(--color-navy); color: #fff;
  &:disabled { opacity: .6; cursor: not-allowed; }
`;
const RemoveBtn = styled.button`
  display: inline-flex; align-items: center; gap: 5px; padding: 9px 11px; border-radius: 9px; font-size: 12px; cursor: pointer;
  border: 1px solid #fda29b; background: #fff; color: #b42318;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;
const Hint = styled.small`color: #667085;`;

const ProviderCard = ({ provider, status, isPreferred, encryptionReady, onSaved, onPreferred }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const configured = Boolean(status?.configured);

  const save = async () => {
    const trimmed = value.trim();
    if (trimmed.length < 20) { toast.error('That does not look like a valid API key.'); return; }
    setBusy(true);
    try {
      await agentService.setProviderKey(provider.id, trimmed);
      setValue('');
      toast.success(`${provider.label} key saved`);
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not save the key.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await agentService.clearProviderKey(provider.id);
      toast.success(`${provider.label} key removed`);
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not remove the key.');
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHead>
        <span className="title">{provider.label}</span>
        {configured
          ? <span className="status ok"><ShieldCheck size={13} /> Saved ••{status.last4}</span>
          : <span className="status none"><AlertTriangle size={13} /> Not set</span>}
        {configured && (
          <PrefButton type="button" $active={isPreferred} disabled={!configured} onClick={() => onPreferred(provider.id)} title="Use as preferred provider">
            <Star size={12} /> {isPreferred ? 'Preferred' : 'Set preferred'}
          </PrefButton>
        )}
      </CardHead>
      <Row>
        <Input type="password" autoComplete="off" spellCheck={false} placeholder={configured ? 'Replace key…' : 'Paste API key…'} value={value} disabled={!encryptionReady || busy} onChange={(e) => setValue(e.target.value)} />
        <SaveBtn type="button" disabled={!encryptionReady || busy || value.trim().length < 20} onClick={save}>
          {busy ? <Loader size={14} className="spin" /> : <KeyRound size={14} />} Save
        </SaveBtn>
        {configured && <RemoveBtn type="button" disabled={busy} onClick={remove}><Trash2 size={14} /></RemoveBtn>}
      </Row>
      <Hint>{provider.hint}</Hint>
    </Card>
  );
};

const ApiKeyModal = ({ isOpen, onClose, multiProvider = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    agentService.getKeyStatuses()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (isOpen) refresh(); }, [isOpen]);

  if (!isOpen) return null;

  const encryptionReady = data?.encryptionConfigured !== false;
  const visibleProviders = multiProvider ? PROVIDERS : PROVIDERS.filter((p) => p.id === 'gemini');

  const setPreferred = async (providerId) => {
    try {
      await agentService.setPreferredProvider(providerId);
      toast.success('Preferred provider updated');
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not update preferred provider.');
    }
  };

  const modal = (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Modal role="dialog" aria-modal="true" aria-label="AI provider keys">
        <ModalHeader>
          <KeyRound size={20} />
          <h3>{multiProvider ? 'AI Provider Keys' : 'Gemini API Key'}</h3>
          <button type="button" title="Close" onClick={onClose}><X size={18} /></button>
        </ModalHeader>
        <Body>
          {!encryptionReady && (
            <Banner><AlertTriangle size={16} /> Secure key storage is not configured on the server yet. Contact your administrator.</Banner>
          )}
          {loading && !data ? (
            <Banner style={{ background: '#eef4f6', color: '#1a3a5f', borderColor: '#bcd' }}><Loader size={16} className="spin" /> Loading…</Banner>
          ) : (
            visibleProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                status={data?.providers?.[provider.id]}
                isPreferred={data?.preferredProvider === provider.id}
                encryptionReady={encryptionReady}
                onSaved={refresh}
                onPreferred={setPreferred}
              />
            ))
          )}
          <Hint>Keys are encrypted on the server and never shown again.{multiProvider ? ' If your preferred provider fails, the assistant automatically falls back to the next available one.' : ''}</Hint>
        </Body>
      </Modal>
    </Overlay>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default ApiKeyModal;
