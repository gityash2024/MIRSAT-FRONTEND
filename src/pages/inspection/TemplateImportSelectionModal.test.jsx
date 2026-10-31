import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TemplateImportSelectionModal from './TemplateImportSelectionModal';

const { t } = vi.hoisted(() => ({ t: (key, options = {}) => ({
  'templateTransfer.selectImportTemplates': 'Select templates to import',
  'templateTransfer.selectAll': 'Select All', 'templateTransfer.importSelected': 'Import selected templates',
  'templateTransfer.importing': 'Importing…', 'inspections.searchTemplates': 'Search Templates',
  'templateTransfer.selectedCount': `${options.count} selected`, 'common.cancel': 'Cancel', 'common.close': 'Close'
}[key] || key) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t }) }));
const fixture = () => ({ format: 'mirsat-template-transfer', version: 1, templates: [
  { _id: 'same-source-id', name: 'Checklist A', pages: [{ name: 'Page', sections: [{ name: 'Section', questions: [{ text: 'Question', weight: 20, weightUnit: 'percentage', isScored: false, required: true, flaggedOptions: {}, options: ['نعم', 'لا'] }] }] }] },
  { _id: 'same-source-id', name: 'Checklist B', sets: [{ name: 'Legacy set' }] },
  { name: 'قائمة السلامة', questions: [{ text: 'هل يوجد تصريح؟' }] }
] });

describe('template import selection', () => {
  it('lists file templates without importing, and confirms only one selected definition unchanged', () => {
    const bundle = fixture(); const before = JSON.stringify(bundle); const onConfirm = vi.fn();
    render(<TemplateImportSelectionModal bundle={bundle} onClose={vi.fn()} onConfirm={onConfirm} />);
    const confirm = screen.getByRole('button', { name: 'Import selected templates' });
    expect(confirm).toBeDisabled(); expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Checklist A' }));
    expect(confirm).toBeEnabled(); expect(screen.getByRole('checkbox', { name: 'Select All' }).indeterminate).toBe(true);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith({ ...bundle, templates: [bundle.templates[0]] });
    expect(onConfirm.mock.calls[0][0].templates[0]).toBe(bundle.templates[0]);
    expect(JSON.stringify(bundle)).toBe(before);
  });

  it('selects multiple templates independently even when their source IDs are identical or absent', () => {
    const bundle = fixture(); const onConfirm = vi.fn();
    render(<TemplateImportSelectionModal bundle={bundle} onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Checklist B' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'قائمة السلامة' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected templates' }));
    expect(onConfirm).toHaveBeenCalledWith({ ...bundle, templates: bundle.templates.slice(1) });
  });

  it('Select All includes the full file while searching, and clearing it disables confirmation', () => {
    const bundle = fixture(); const onConfirm = vi.fn();
    render(<TemplateImportSelectionModal bundle={bundle} onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Checklist A' } });
    expect(screen.queryByRole('checkbox', { name: 'Checklist B' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected templates' }));
    expect(onConfirm).toHaveBeenCalledWith(bundle);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    expect(screen.getByRole('button', { name: 'Import selected templates' })).toBeDisabled();
  });

  it('cancel and Escape close without confirming an import', () => {
    const onClose = vi.fn(); const onConfirm = vi.fn();
    render(<TemplateImportSelectionModal bundle={fixture()} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2); expect(onConfirm).not.toHaveBeenCalled();
  });

  it('locks selection and close actions while an import is in progress', () => {
    const bundle = fixture(); const onClose = vi.fn(); const onConfirm = vi.fn();
    const { rerender } = render(<TemplateImportSelectionModal bundle={bundle} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    rerender(<TemplateImportSelectionModal bundle={bundle} busy onClose={onClose} onConfirm={onConfirm} />);
    screen.getAllByRole('checkbox').forEach(input => expect(input).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Importing…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled(); expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps malformed optional metadata from crashing the preview, leaving validation to the import API', () => {
    const bundle = { ...fixture(), templates: [{ name: 'Checklist', type: {}, status: {} }] };
    const onConfirm = vi.fn();
    render(<TemplateImportSelectionModal bundle={bundle} onClose={vi.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Checklist' }));
    fireEvent.click(screen.getByRole('button', { name: 'Import selected templates' }));
    expect(onConfirm).toHaveBeenCalledWith(bundle);
  });
});
