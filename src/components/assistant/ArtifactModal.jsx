import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Copy, Check, X, FileText, FileSpreadsheet, FileType, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  exportArtifactPdf,
  exportArtifactExcel,
  exportArtifactCsv,
  exportArtifactDocx,
  copyArtifactMarkdown,
} from '../../utils/artifactExport';

// Pick the first numeric column (after the label column) so we can chart label → value.
const numericColumnKey = (artifact) => {
  const cols = artifact?.columns || [];
  const rows = artifact?.rows || [];
  if (!rows.length) return null;
  for (const col of cols.slice(1)) {
    const numeric = rows.every((row) => {
      const cleaned = String(row[col.key] ?? '').replace(/[^0-9.\-]/g, '');
      return cleaned !== '' && !Number.isNaN(parseFloat(cleaned));
    });
    if (numeric) return col;
  }
  return null;
};

const buildChartData = (artifact, labelKey, valueKey) => (artifact.rows || []).slice(0, 25).map((row) => ({
  name: String(row[labelKey] ?? '').slice(0, 18),
  value: parseFloat(String(row[valueKey] ?? '').replace(/[^0-9.\-]/g, '')) || 0,
}));

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
  animation: artifactFade 160ms ease both;
  @keyframes artifactFade { from { opacity: 0; } to { opacity: 1; } }
`;

const Modal = styled.div`
  width: min(880px, 100%);
  max-height: min(88vh, 900px);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.35);
  direction: ${(props) => (props.$rtl ? 'rtl' : 'ltr')};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-navy), #255d78 60%, var(--color-teal));
  h3 { margin: 0; font-size: 16px; flex: 1; }
  button { width: 32px; height: 32px; border: 0; border-radius: 8px; background: rgba(255,255,255,.16); color: #fff; cursor: pointer; display: grid; place-items: center; }
`;

const Metrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px 0;
  span {
    display: inline-flex;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: #eef4f6;
    color: var(--color-navy);
    font-size: 12px;
    b { font-weight: 800; }
  }
`;

const Preview = styled.div`
  overflow: auto;
  padding: 14px 18px;
  font-size: 13px;
  color: #1e293b;
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 7px 9px; text-align: ${(props) => (props.$rtl ? 'right' : 'left')}; }
  th { background: #f1f5f9; font-weight: 700; }
  h1, h2, h3 { color: var(--color-navy); margin: 6px 0; }
  p { margin: 6px 0; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; }
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-teal);
  border-radius: 8px;
  background: #fff;
  color: var(--color-navy);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: #ecf7f7; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ArtifactModal = ({ artifact, isOpen, onClose, rtl = false }) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState('');

  if (!isOpen || !artifact) return null;

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn(artifact);
    } catch (_error) {
      // Export errors are non-fatal; surface nothing destructive.
    } finally {
      setBusy('');
    }
  };

  const handleCopy = async () => {
    await copyArtifactMarkdown(artifact);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const valueCol = numericColumnKey(artifact);
  const labelCol = (artifact.columns || [])[0];
  const chartData = valueCol && labelCol ? buildChartData(artifact, labelCol.key, valueCol.key) : [];

  const modal = (
    <Overlay onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <Modal $rtl={rtl} role="dialog" aria-modal="true" aria-label={artifact.title}>
        <ModalHeader>
          <FileText size={20} />
          <h3>{artifact.title || 'Report'}</h3>
          <button type="button" title="Close" onClick={onClose}><X size={18} /></button>
        </ModalHeader>
        {Array.isArray(artifact.metrics) && artifact.metrics.length > 0 && (
          <Metrics>
            {artifact.metrics.map((metric, index) => (
              <span key={`${metric.label}-${index}`}>{metric.label}: <b>{String(metric.value)}</b></span>
            ))}
          </Metrics>
        )}
        {chartData.length > 1 && (
          <div style={{ height: 200, padding: '12px 18px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2c9799" radius={[4, 4, 0, 0]} name={valueCol.label} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <Preview $rtl={rtl}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {artifact.markdown || artifact.summary || ''}
          </ReactMarkdown>
        </Preview>
        <Footer>
          <ExportButton type="button" disabled={busy === 'pdf'} onClick={() => run('pdf', exportArtifactPdf)}><FileText size={14} /> PDF</ExportButton>
          <ExportButton type="button" disabled={busy === 'excel'} onClick={() => run('excel', exportArtifactExcel)}><FileSpreadsheet size={14} /> Excel</ExportButton>
          <ExportButton type="button" disabled={busy === 'csv'} onClick={() => run('csv', exportArtifactCsv)}><Download size={14} /> CSV</ExportButton>
          <ExportButton type="button" disabled={busy === 'docx'} onClick={() => run('docx', exportArtifactDocx)}><FileType size={14} /> Word</ExportButton>
          <ExportButton type="button" onClick={handleCopy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</ExportButton>
        </Footer>
      </Modal>
    </Overlay>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default ArtifactModal;
