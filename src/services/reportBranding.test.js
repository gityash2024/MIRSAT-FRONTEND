import fs from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { generateTaskPDF } from './pdfGenerator';

vi.mock('../utils/pdfImageOptimization', async importOriginal => ({
  ...await importOriginal(),
  optimizePdfImage: vi.fn(async (data, options) => ({ data, format: 'PNG', alias: options.alias })),
}));
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('still generates the inspection report with real tables and the same two header logo assets', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const fetcher = vi.fn(async url => {
    const filename = String(url).split('/').pop();
    if (!['mirsat.png', 'srsa-logo.png'].includes(filename)) return { ok: false };
    return { ok: true, blob: async () => new Blob([fs.readFileSync(`public/report-assets/${filename}`)], { type: 'image/png' }) };
  });
  vi.stubGlobal('fetch', fetcher);
  const pdf = await generateTaskPDF({
    title: 'Local branding regression', status: 'completed',
    asset: { displayName: 'Local Vessel' }, inspectionLevel: { name: 'Local template', pages: [] },
    questionnaireResponses: {}, assignedTo: [{ name: 'Local Inspector' }],
  });
  expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  expect(pdf.lastAutoTable.body.length).toBeGreaterThan(0);
  expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/report-assets/mirsat.png'));
  expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/report-assets/srsa-logo.png'));
  for (const content of pdf.internal.pages.slice(1)) {
    const commands = content.join('\n');
    expect(commands).toContain('/I0 Do');
    expect(commands).toContain('/I1 Do');
  }
});
