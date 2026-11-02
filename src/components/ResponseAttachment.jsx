import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Eye, FileText } from 'lucide-react';
import { isImageResponse } from '../utils/imageResponse';

const DATA_URI = /^data:([^;,]+)(?:;[^,]*)?,/i;
const SUPPORTED_DATA = /^data:(?:image\/(?:jpeg|png|webp|gif|heic|heif)|application\/pdf)(?:;[^,]*)?,/i;
const safeUrl = (value) => /^https?:\/\//i.test(value) || SUPPORTED_DATA.test(value);
const mimeOf = (value) => DATA_URI.exec(value)?.[1]?.toLowerCase() || '';
const isPdf = (value) => mimeOf(value) === 'application/pdf' || /\.pdf(?:[?#]|$)/i.test(value);
const fileNameOf = (value, label) => {
  if (value.startsWith('data:')) {
    const mime = mimeOf(value);
    const extension = mime === 'application/pdf' ? 'pdf' : (mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1]);
    return `${label.replace(/\s+/g, '-').toLowerCase()}.${extension}`;
  }
  try {
    const name = decodeURIComponent(new URL(value).pathname.split('/').pop() || '');
    return name && /^[^/\\]+$/.test(name) ? name : 'attachment';
  } catch {
    return 'attachment';
  }
};

const actionStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px',
  background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6,
  color: '#000048', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};

/** Shared, read-only presentation for saved file and media answers. */
export default function ResponseAttachment({ value, label = 'Attachment' }) {
  const source = typeof value === 'string' ? value.trim() : '';
  const valid = safeUrl(source);
  const image = valid && isImageResponse(source);
  const pdf = valid && isPdf(source);
  const [viewerUrl, setViewerUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!viewerUrl) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setViewerUrl(''); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewerUrl]);

  useEffect(() => () => {
    if (viewerUrl.startsWith('blob:')) URL.revokeObjectURL(viewerUrl);
  }, [viewerUrl]);

  if (!source) return null;

  const openViewer = async () => {
    if (!valid) return;
    if (!image && !pdf) {
      window.open(source, '_blank', 'noopener,noreferrer');
      return;
    }
    if (source.startsWith('data:') && pdf) {
      try {
        const blob = await fetch(source).then((response) => response.blob());
        setViewerUrl(URL.createObjectURL(blob));
      } catch {
        window.open(source, '_blank', 'noopener,noreferrer');
      }
    } else {
      setViewerUrl(source);
    }
  };

  const download = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error('Could not download attachment');
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileNameOf(source, label);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // A remote host can deny cross-origin fetch while still allowing the
      // original file URL to be opened or downloaded by the browser.
      window.open(source, '_blank', 'noopener,noreferrer');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start', maxWidth: '100%' }}>
      {image ? (
        <img src={source} alt={`${label} preview`} style={{ maxWidth: 200, maxHeight: 150, objectFit: 'contain', borderRadius: 6, border: '1px solid #e2e8f0' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', fontSize: 13 }}>
          <FileText size={18} aria-hidden="true" /> {pdf ? 'PDF document' : label}
        </div>
      )}
      {valid ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={openViewer} style={actionStyle} aria-label={`View ${label}`}><Eye size={14} /> View</button>
          <button type="button" onClick={download} disabled={busy} style={actionStyle} aria-label={`Download ${label}`}><Download size={14} /> {busy ? 'Downloading…' : 'Download'}</button>
        </div>
      ) : <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Attachment unavailable</span>}
      {viewerUrl && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`${label} preview`} onClick={() => setViewerUrl('')}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.8)', display: 'grid', placeItems: 'center', padding: 24 }}>
          <button type="button" onClick={() => setViewerUrl('')} aria-label="Close preview"
            style={{ position: 'absolute', top: 16, right: 16, ...actionStyle }}>Close</button>
          {image ? <img src={viewerUrl} alt={label} onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '88vh', objectFit: 'contain' }} />
            : <iframe title={`${label} PDF`} src={viewerUrl} onClick={(event) => event.stopPropagation()}
              style={{ width: 'min(1000px, 95vw)', height: '88vh', border: 0, background: '#fff' }} />}
        </div>, document.body
      )}
    </div>
  );
}
