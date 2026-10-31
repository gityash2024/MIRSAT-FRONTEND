import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TemplateExportSelectionModal from './TemplateExportSelectionModal';

const { t } = vi.hoisted(() => ({ t: (key, options = {}) => ({
  'templateTransfer.selectTemplates': 'Select templates to export',
  'templateTransfer.selectAll': 'Select All', 'templateTransfer.continueExport': 'Continue to export',
  'templateTransfer.retry': 'Retry', 'inspections.searchTemplates': 'Search Templates',
  'templateTransfer.selectedCount': `${options.count} selected`,
  'templateTransfer.loadFailed': 'Could not load templates', 'common.cancel': 'Cancel', 'common.close': 'Close'
}[key] || key) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t }) }));
const rows = [{ _id: 'a', name: 'Checklist A', status: 'active' }, { _id: 'b', name: 'Checklist B', status: 'draft' }];

describe('template export selection', () => {
  it('requires a selection and exports only the checked templates', async () => {
    const onConfirm = vi.fn();
    const service = { getTemplateExportChoices: vi.fn().mockResolvedValue(rows) };
    render(<TemplateExportSelectionModal service={service} filters={{ status: ['active'] }} search="check"
      onClose={vi.fn()} onConfirm={onConfirm} />);
    const confirm = screen.getByRole('button', { name: 'Continue to export' });
    expect(confirm).toBeDisabled();
    const checkbox = await screen.findByRole('checkbox', { name: /^Checklist A/ });
    fireEvent.click(checkbox);
    expect(confirm).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Select All' }).indeterminate).toBe(true);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(['a']);
    expect(service.getTemplateExportChoices).toHaveBeenCalledWith({ status: ['active'], search: 'check' });
    fireEvent.click(checkbox);
    expect(confirm).toBeDisabled();
  });

  it('Select All includes all loaded pages even when the local search hides a row', async () => {
    const onConfirm = vi.fn();
    render(<TemplateExportSelectionModal service={{ getTemplateExportChoices: vi.fn().mockResolvedValue(rows) }}
      onClose={vi.fn()} onConfirm={onConfirm} />);
    await screen.findByRole('checkbox', { name: /^Checklist A/ });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Checklist A' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue to export' }));
    expect(onConfirm).toHaveBeenCalledWith(['a', 'b']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    expect(screen.getByRole('button', { name: 'Continue to export' })).toBeDisabled();
  });

  it('keeps confirmation disabled after a load failure and permits retry', async () => {
    const service = { getTemplateExportChoices: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(rows) };
    render(<TemplateExportSelectionModal service={service} onClose={vi.fn()} onConfirm={vi.fn()} />);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Continue to export' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('checkbox', { name: /^Checklist A/ });
    expect(service.getTemplateExportChoices).toHaveBeenCalledTimes(2);
  });

  it('supports closing with Escape', async () => {
    const onClose = vi.fn();
    render(<TemplateExportSelectionModal service={{ getTemplateExportChoices: vi.fn().mockResolvedValue([]) }}
      onClose={onClose} onConfirm={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue to export' })).toBeDisabled());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
