import React, { useState } from 'react';
import styled from 'styled-components';
import { FileBarChart, Eye } from 'lucide-react';
import ArtifactModal from './ArtifactModal';

const Card = styled.div`
  margin: -4px 0 12px;
  padding: 12px;
  border: 1px solid var(--color-seafoam, #bfe3e3);
  border-radius: 10px;
  background: linear-gradient(180deg, #f4fbfb, #ffffff);
  box-shadow: 0 8px 18px rgba(25, 46, 65, 0.06);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-navy);
  font-weight: 700;
  font-size: 13px;
  svg { color: var(--color-teal); flex-shrink: 0; }
`;

const Summary = styled.div`
  margin: 6px 0 8px;
  color: #475467;
  font-size: 12px;
  line-height: 1.45;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  span {
    padding: 3px 8px;
    border-radius: 999px;
    background: #eef4f6;
    color: var(--color-navy);
    font-size: 11px;
    b { font-weight: 800; }
  }
`;

const OpenButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--color-teal);
  border-radius: 8px;
  background: var(--color-teal);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover { filter: brightness(1.05); }
`;

const ArtifactCard = ({ artifact, rtl = false }) => {
  const [open, setOpen] = useState(false);
  if (!artifact) return null;
  const metrics = Array.isArray(artifact.metrics) ? artifact.metrics.slice(0, 4) : [];
  const rowCount = Array.isArray(artifact.rows) ? artifact.rows.length : 0;
  const asOf = artifact.generatedAt ? new Date(artifact.generatedAt).toLocaleString() : null;
  return (
    <Card>
      <Head><FileBarChart size={16} />{artifact.title || 'Report'}</Head>
      {artifact.summary && <Summary>{artifact.summary}</Summary>}
      {asOf && <Summary style={{ fontSize: 11, color: '#98a2b3' }}>Based on {rowCount} record{rowCount === 1 ? '' : 's'} · as of {asOf}</Summary>}
      {metrics.length > 0 && (
        <Chips>
          {metrics.map((metric, index) => (
            <span key={`${metric.label}-${index}`}>{metric.label}: <b>{String(metric.value)}</b></span>
          ))}
        </Chips>
      )}
      <OpenButton type="button" onClick={() => setOpen(true)}>
        <Eye size={14} /> Preview &amp; Export
      </OpenButton>
      <ArtifactModal artifact={artifact} isOpen={open} onClose={() => setOpen(false)} rtl={rtl} />
    </Card>
  );
};

export default ArtifactCard;
