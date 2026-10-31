import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../utils/zIndex';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${Z_INDEX.MODAL_OVERLAY};
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
const Dialog = styled.div`
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
  color: var(--color-navy);
  h2 { font-size: 20px; margin: 0; }
  p { color: #64748b; font-size: 14px; margin: 12px 0; }
  header, footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  footer { margin-top: 20px; justify-content: flex-end; flex-wrap: wrap; }
  input[type='search'] { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px; }
  label { display: flex; align-items: center; gap: 10px; padding: 12px 0; cursor: pointer; overflow-wrap: anywhere; }
  input[type='checkbox'] { flex-shrink: 0; accent-color: var(--color-navy); }
  .choices { max-height: 42vh; overflow-y: auto; border-block: 1px solid #e2e8f0; }
  .choices label + label { border-top: 1px solid #f1f5f9; }
  .template-type { display: block; color: #64748b; font-size: 12px; margin-top: 4px; }
  @media (max-width: 480px) { padding: 16px; }
`;
const Button = styled.button`
  border: 1px solid var(--color-navy);
  border-radius: 6px;
  padding: 9px 14px;
  background: ${props => props.$primary ? 'var(--color-navy)' : 'white'};
  color: ${props => props.$primary ? 'white' : 'var(--color-navy)'};
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export { Overlay as TemplateSelectionOverlay, Dialog as TemplateSelectionDialog, Button as TemplateSelectionButton };

export default function TemplateExportSelectionModal({ service, filters, search, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const searchRef = useRef(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    service.getTemplateExportChoices({ ...filters, search }).then(rows => {
      if (active) setChoices(rows);
    }).catch(() => { if (active) setError(t('templateTransfer.loadFailed')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [service, filters, search, attempt, t]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    searchRef.current?.focus();
    const onKey = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previousFocus?.focus?.(); };
  }, [onClose]);
  const visible = useMemo(() => choices.filter(choice => String(choice.name || '').toLocaleLowerCase()
    .includes(query.toLocaleLowerCase())), [choices, query]);
  const toggle = id => setSelected(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return createPortal(
    <Overlay onClick={event => event.target === event.currentTarget && onClose()}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="template-export-selection-title">
        <header>
          <h2 id="template-export-selection-title">{t('templateTransfer.selectTemplates')}</h2>
          <Button type="button" onClick={onClose} aria-label={t('common.close')}><X size={16} /></Button>
        </header>
        <p>{t('templateTransfer.selectionHelp')}</p>
        <input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder={t('inspections.searchTemplates')} aria-label={t('inspections.searchTemplates')} />
        {loading ? <p role="status">{t('common.loading')}</p> : error ? (
          <div role="alert"><p>{error}</p><Button type="button" onClick={() => setAttempt(value => value + 1)}>{t('templateTransfer.retry')}</Button></div>
        ) : (
          <>
            <label>
              <input type="checkbox" checked={choices.length > 0 && selected.size === choices.length}
                ref={input => { if (input) input.indeterminate = selected.size > 0 && selected.size < choices.length; }}
                disabled={!choices.length} onChange={() => setSelected(selected.size === choices.length ? new Set()
                  : new Set(choices.map(choice => String(choice._id || choice.id))))} />
              {t('templateTransfer.selectAll')}
            </label>
            <div className="choices">
              {visible.length ? visible.map(choice => {
                const id = String(choice._id || choice.id);
                return <label key={id}>
                  <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} />
                  <span>{choice.name}<span className="template-type">{[choice.type,
                    t(choice.status === 'archived' ? 'tasks.archived' : `common.${choice.status}`, { defaultValue: choice.status })]
                    .filter(Boolean).join(' · ')}</span></span>
                </label>;
              }) : <p>{t('templateTransfer.noTemplates')}</p>}
            </div>
          </>
        )}
        <p aria-live="polite">{t('templateTransfer.selectedCount', { count: selected.size })}</p>
        <footer>
          <Button type="button" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="button" $primary disabled={loading || !!error || selected.size === 0}
            onClick={() => selected.size > 0 && onConfirm([...selected])}>{t('templateTransfer.continueExport')}</Button>
        </footer>
      </Dialog>
    </Overlay>, document.body
  );
}
