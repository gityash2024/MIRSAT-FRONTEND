import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  TemplateSelectionOverlay as Overlay,
  TemplateSelectionDialog as Dialog,
  TemplateSelectionButton as Button
} from './TemplateExportSelectionModal';

export default function TemplateImportSelectionModal({ bundle, busy = false, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;
  const templates = bundle.templates;
  // File positions remain distinct even if names or source IDs are repeated.
  const visible = useMemo(() => templates.map((template, index) => ({ template, index }))
    .filter(({ template }) => template.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [templates, query]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    searchRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') {
        if (!busyRef.current) closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled)');
      if (!controls?.length) { event.preventDefault(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, []);

  const toggle = index => setSelected(previous => {
    const next = new Set(previous);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });

  return createPortal(
    <Overlay onClick={event => !busy && event.target === event.currentTarget && onClose()}>
      <Dialog ref={dialogRef} role="dialog" aria-modal="true" aria-busy={busy} aria-labelledby="template-import-selection-title">
        <header>
          <h2 id="template-import-selection-title">{t('templateTransfer.selectImportTemplates')}</h2>
          <Button type="button" disabled={busy} onClick={onClose} aria-label={t('common.close')}><X size={16} /></Button>
        </header>
        <p>{t('templateTransfer.importSelectionHelp')}</p>
        <input ref={searchRef} type="search" value={query} disabled={busy} onChange={event => setQuery(event.target.value)}
          placeholder={t('inspections.searchTemplates')} aria-label={t('inspections.searchTemplates')} />
        <label>
          <input type="checkbox" disabled={busy || !templates.length}
            checked={templates.length > 0 && selected.size === templates.length}
            ref={input => { if (input) input.indeterminate = selected.size > 0 && selected.size < templates.length; }}
            onChange={() => setSelected(selected.size === templates.length ? new Set() : new Set(templates.map((_, index) => index)))} />
          {t('templateTransfer.selectAll')}
        </label>
        <div className="choices">
          {visible.length ? visible.map(({ template, index }) => (
            <label key={index}>
              <input type="checkbox" disabled={busy} checked={selected.has(index)} onChange={() => toggle(index)} />
              <span>{template.name}<span className="template-type">{[typeof template.type === 'string' && template.type,
                typeof template.status === 'string' && template.status &&
                t(template.status === 'archived' ? 'tasks.archived' : `common.${template.status}`, { defaultValue: template.status })]
                .filter(Boolean).join(' · ')}</span></span>
            </label>
          )) : <p>{t('templateTransfer.noTemplates')}</p>}
        </div>
        <p aria-live="polite">{t('templateTransfer.selectedCount', { count: selected.size })}</p>
        <footer>
          <Button type="button" disabled={busy} onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="button" $primary disabled={busy || !selected.size} onClick={() => {
            if (!busy && selected.size) onConfirm({ ...bundle, templates: templates.filter((_, index) => selected.has(index)) });
          }}>{t(busy ? 'templateTransfer.importing' : 'templateTransfer.importSelected')}</Button>
        </footer>
      </Dialog>
    </Overlay>, document.body
  );
}
