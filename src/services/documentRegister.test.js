import fs from 'node:fs';
import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateDocumentRegisterPDF, downloadDocumentRegister } from './documentRegister';
import { maintenanceService } from './maintenance.service';
import { drawPageDecorations, loadArabicFont, loadReportLogos } from './pdfGenerator';

vi.mock('./maintenance.service', () => ({ maintenanceService: { get: vi.fn() } }));
vi.mock('./pdfGenerator', async importOriginal => {
  const original = await importOriginal();
  const logo = filename => ({ data: `data:image/png;base64,${fs.readFileSync(`public/report-assets/${filename}`).toString('base64')}`, format: 'PNG', alias: filename });
  return { ...original,
    loadArabicFont: vi.fn(async () => false),
    loadReportLogos: vi.fn(async () => ({ leftLogo: logo('mirsat.png'), rightLogo: logo('srsa-logo.png') })),
    drawPageDecorations: vi.fn(original.drawPageDecorations),
  };
});
const document = {
  _id: '123456789012345678901234', code: 'DOC-1001', title: 'Engine manual', category: 'Manuals',
  asset: { displayName: 'Local Vessel' }, equipment: { name: 'Main Engine' }, owner: { name: 'Local Manager' },
  controlled: true, accessLevel: 'restricted', reviewDate: '2027-01-01',
  versions: [{ number: 1, label: 'v1.0', file: { filename: 'manual-old.pdf', key: 'private-old-key' } },
    { number: 2, label: 'v2.0', file: { filename: 'manual-current.pdf', key: 'private-new-key' } }],
};
const options = { now: new Date('2026-11-01T00:00:00Z') };
beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('branded document register', () => {
  it('uses the inspection header renderer on every page and preserves both logos', async () => {
    const records = Array.from({ length: 50 }, (_, i) => ({ ...document, code: `DOC-${1001 + i}`, title: `${document.title} ${i + 1} - detailed maintenance and operating instructions` }));
    const pdf = await generateDocumentRegisterPDF(records, options);
    if (process.env.MIRSAT_PDF_PROOF_DIR) {
      fs.mkdirSync(process.env.MIRSAT_PDF_PROOF_DIR, { recursive: true });
      fs.writeFileSync(`${process.env.MIRSAT_PDF_PROOF_DIR}/documents-register-multipage.pdf`, new Uint8Array(pdf.output('arraybuffer')));
    }
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(loadReportLogos).toHaveBeenCalledTimes(1);
    expect(drawPageDecorations).toHaveBeenCalledTimes(pdf.getNumberOfPages());
    for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
      expect(drawPageDecorations).toHaveBeenCalledWith(expect.objectContaining({
        doc: pdf, pageNumber: page, totalPages: pdf.getNumberOfPages(),
        leftLogo: expect.objectContaining({ alias: 'mirsat.png' }), rightLogo: expect.objectContaining({ alias: 'srsa-logo.png' }),
      }));
    }
    const cells = pdf.lastAutoTable.body.flatMap(row => Object.values(row.cells).map(cell => String(cell.raw)));
    expect(cells.join('\n')).toContain('manual-current.pdf');
    expect(cells.join('\n')).toContain('v2.0');
    expect(cells.join('\n')).toContain('Restricted');
    expect(cells.join('\n')).not.toContain('manual-old.pdf');
    expect(cells.join('\n')).not.toContain('private-new-key');
  });

  it('fails instead of silently producing a register without a header logo', async () => {
    loadReportLogos.mockResolvedValueOnce({ leftLogo: null, rightLogo: {} });
    await expect(generateDocumentRegisterPDF([document], options)).rejects.toThrow('report logos');
  });

  it('requires the local Arabic font for Arabic or mixed-language content', async () => {
    await expect(generateDocumentRegisterPDF([document], { language: 'ar-SA' })).rejects.toThrow('report font');
    await expect(generateDocumentRegisterPDF([{ ...document, title: 'دليل المحرك' }])).rejects.toThrow('report font');
    expect(loadArabicFont).toHaveBeenCalledWith(expect.anything(), { allowRemoteFallback: false });
  });

  it('aborts the whole export on a fresh permission denial', async () => {
    maintenanceService.get.mockRejectedValueOnce(new Error('Document not found'));
    await expect(downloadDocumentRegister([document._id])).rejects.toThrow('Document not found');
    expect(maintenanceService.get).toHaveBeenCalledWith(`/documents/${document._id}`);
    expect(loadReportLogos).not.toHaveBeenCalled();
    expect(drawPageDecorations).not.toHaveBeenCalled();
  });

  it('rejects stale records and empty/oversized selections', async () => {
    maintenanceService.get.mockResolvedValueOnce({ data: [] });
    await expect(downloadDocumentRegister([document._id])).rejects.toThrow('no longer available');
    await expect(downloadDocumentRegister([])).rejects.toThrow('1 and 50');
    await expect(downloadDocumentRegister(Array.from({ length: 51 }, (_, i) => String(i)))).rejects.toThrow('1 and 50');
    expect(loadReportLogos).not.toHaveBeenCalled();
  });
});
