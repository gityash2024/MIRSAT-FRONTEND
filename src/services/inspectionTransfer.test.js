import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { inspectionService } from './inspection.service';
vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

describe('template transfer requests', () => {
  it('loads export choices across every page instead of only the visible page', async () => {
    api.get.mockResolvedValueOnce({ data: { results: [{ _id: 'a' }], totalPages: 2, totalResults: 2 } })
      .mockResolvedValueOnce({ data: { results: [{ _id: 'b' }], totalPages: 2, totalResults: 2 } });
    expect(await inspectionService.getTemplateExportChoices({ status: ['active'] })).toEqual([{ _id: 'a' }, { _id: 'b' }]);
    expect(api.get.mock.calls.map(([, config]) => config.params.page)).toEqual([1, 2]);
    expect(api.get.mock.calls[0][1].params).toMatchObject({ status: ['active'], summary: 'true' });
  });
  it('fails instead of offering incomplete choices if the list changes between pages', async () => {
    api.get.mockResolvedValueOnce({ data: { results: [{ _id: 'a' }], totalPages: 2, totalResults: 2 } })
      .mockResolvedValueOnce({ data: { results: [], totalPages: 1, totalResults: 1 } });
    await expect(inspectionService.getTemplateExportChoices()).rejects.toThrow('list changed');
  });
  it('sends the exact selected IDs and rejects an empty selection before requesting an export', async () => {
    api.post.mockResolvedValue({ data: { templates: [] } });
    await inspectionService.getTemplateTransfer(['a', 'b']);
    expect(api.post).toHaveBeenCalledWith('/inspection/export/json', { ids: ['a', 'b'] });
    api.post.mockClear();
    await expect(inspectionService.getTemplateTransfer([])).rejects.toThrow('Select at least one');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('uses the existing no-retry flag for imports so a saved batch is not automatically replayed', async () => {
    api.post.mockResolvedValue({ data: { importedCount: 1 } });
    const bundle = { templates: [{ name: 'Checklist' }] };
    expect(await inspectionService.importTemplates(bundle)).toEqual({ importedCount: 1 });
    expect(api.post).toHaveBeenCalledWith('/inspection/import', bundle, { timeout: 120000, _skipRetry: true });
  });
});
