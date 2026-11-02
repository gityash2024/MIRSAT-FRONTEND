import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { maintenanceService } from './maintenance.service';
import { drawPageDecorations, loadArabicFont, loadReportLogos } from './pdfGenerator';
import { containsArabic, formatExportDate, formatPdfText, localizePdfTable, orderForLanguage } from '../utils/exportLocalization';
import { supportedLanguage } from '../utils/supportedLanguage';
import { documentStatus } from '../utils/documentStatus';

const MARGIN = 14;
const CONTENT_TOP = 42;
const COLORS = { navy: '#102a63', text: '#111827', muted: '#6b7280', border: '#d1d5db' };

export async function generateDocumentRegisterPDF(documents, { language = 'en', translate = text => text, now = new Date() } = {}) {
  const lang = supportedLanguage(language), rtl = lang === 'ar';
  const m = translate;
  if (!Array.isArray(documents) || !documents.length || documents.length > 50) throw new Error(m('Select between 1 and 50 documents for the register.'));
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const needsArabic = rtl || containsArabic(JSON.stringify(documents));
  const fontLoaded = needsArabic && await loadArabicFont(doc, { allowRemoteFallback: false });
  if (needsArabic && !fontLoaded) throw new Error(m('The report font could not be loaded. Please try again.'));
  const { leftLogo, rightLogo } = await loadReportLogos();
  if (!leftLogo || !rightLogo) throw new Error(m('The report logos could not be loaded. Please try again.'));
  const pdfText = value => formatPdfText(value === undefined || value === null || value === '' ? '-' : String(value), lang);
  const date = value => value ? formatExportDate(value, lang) : '-';
  const width = doc.internal.pageSize.width;
  const title = m('Documents Register');
  doc.setProperties({ title, subject: m('Selected document records'), creator: 'MIRSAT' });
  doc.setFont(rtl ? 'NotoNaskhArabic' : 'helvetica', rtl ? 'normal' : 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLORS.navy);
  doc.text(pdfText(title), rtl ? width - MARGIN : MARGIN, CONTENT_TOP, { align: rtl ? 'right' : 'left' });
  doc.setFont(rtl ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted);
  doc.text(pdfText(`${m('Selected document records')}: ${documents.length}`), rtl ? width - MARGIN : MARGIN, CONTENT_TOP + 7, { align: rtl ? 'right' : 'left' });
  const columns = [
    ['Document', 63], ['Category', 26], ['Linked To', 42], ['Version', 18],
    ['Owner', 31], ['Review / Expiry', 39], ['Status', 25], ['Access', 25],
  ];
  const rows = documents.map(document => {
    const version = document.versions?.[document.versions.length - 1];
    const linked = [document.asset?.displayName || document.asset?.uniqueId, document.equipment?.name, document.part?.name].filter(Boolean).join('\n')
      || (document.task ? m('Work Order') : m('Fleet-wide'));
    const status = documentStatus(document, now.getTime());
    return [
      [document.code || String(document._id).slice(-8).toUpperCase(), document.title, version?.file?.filename].filter(Boolean).join('\n'),
      m(document.category || 'Other Records'), linked, version?.label || (version ? `v${version.number}.0` : '-'),
      document.owner?.name || document.createdBy?.name,
      `${m('Review Date')}: ${date(document.reviewDate)}\n${m('Expiry Date')}: ${date(document.expiryDate)}`,
      m(({ overdue: 'Overdue', expiring: 'Expiring', controlled: 'Controlled', current: 'Current' })[status]),
      m(document.accessLevel === 'restricted' ? 'Restricted' : 'All Authorized Users'),
    ].map(pdfText);
  });
  const orderedColumns = orderForLanguage(columns, lang);
  autoTable(doc, {
    startY: CONTENT_TOP + 13,
    head: [orderForLanguage(columns.map(([label]) => pdfText(m(label))), lang)],
    body: rows.map(row => orderForLanguage(row, lang)),
    theme: 'grid',
    margin: { left: MARGIN, right: MARGIN, top: CONTENT_TOP, bottom: 14 },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, overflow: 'linebreak', lineColor: COLORS.border, lineWidth: 0.2, textColor: COLORS.text, halign: rtl ? 'right' : 'left' },
    headStyles: { fillColor: COLORS.navy, textColor: '#ffffff', fontStyle: 'bold', fontSize: 8.5 },
    columnStyles: Object.fromEntries(orderedColumns.map(([, cellWidth], index) => [index, { cellWidth }])),
    rowPageBreak: 'avoid',
    didParseCell: data => localizePdfTable(data, lang, fontLoaded),
  });
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPageDecorations({ doc, pageNumber: page, totalPages, leftLogo, rightLogo, colors: COLORS,
      generatedAt: formatExportDate(now, lang, { includeTime: true }), language: lang, fontLoaded });
  }
  return doc;
}

export async function downloadDocumentRegister(ids, options = {}) {
  const m = options.translate || (text => text);
  const selected = Array.isArray(ids) ? [...new Set(ids)] : [];
  if (!selected.length || selected.length > 50) throw new Error(m('Select between 1 and 50 documents for the register.'));
  // Re-read every selected record through the existing authenticated detail API.
  // A denial/deletion aborts the whole export; never produce a partial register.
  const documents = [];
  for (let index = 0; index < selected.length; index += 5) {
    const batch = await Promise.all(selected.slice(index, index + 5).map(async id => {
      const response = await maintenanceService.get(`/documents/${encodeURIComponent(id)}`);
      if (!response.data || response.data._id !== id) throw new Error(m('A selected document is no longer available.'));
      return response.data;
    }));
    documents.push(...batch);
  }
  const doc = await generateDocumentRegisterPDF(documents, options);
  doc.save('mirsat-documents-register.pdf');
}
