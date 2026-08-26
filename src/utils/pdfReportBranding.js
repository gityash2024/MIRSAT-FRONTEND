import { formatPdfText, isArabicExport } from './exportLocalization';

const REPORT_MARGIN = 14;

// jsPDF accepts coordinates in the unit selected by each report. Keep the
// branding geometry in millimetres so portrait, landscape, and assistant
// reports use the same visual proportions.
const reportUnit = (doc) => (72 / 25.4) / (doc.internal.scaleFactor || 1);

const toDataUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const loadReportBranding = async () => ({
  mirsat: await toDataUrl(`${window.location.origin}/report-assets/mirsat.png`),
  srsa: await toDataUrl(`${window.location.origin}/report-assets/srsa-logo.png`),
});

const setReportFont = (doc, language, fontLoaded, style = 'normal') => {
  if (isArabicExport(language) && fontLoaded) {
    doc.setFont('NotoNaskhArabic', 'normal');
  } else {
    doc.setFont('helvetica', style);
  }
};

export const drawReportHeader = (doc, { title, language = 'en', fontLoaded = false, branding = {} }) => {
  const pageWidth = doc.internal.pageSize.width;
  const rtl = isArabicExport(language);
  const unit = reportUnit(doc);
  const margin = REPORT_MARGIN * unit;

  if (branding.mirsat) doc.addImage(branding.mirsat, 'PNG', margin, 7 * unit, 18 * unit, 18 * unit);
  if (branding.srsa) doc.addImage(branding.srsa, 'PNG', pageWidth - margin - (43 * unit), 8 * unit, 43 * unit, 15 * unit);

  doc.setDrawColor(226, 232, 237);
  doc.setLineWidth(0.35);
  doc.line(margin, 28 * unit, pageWidth - margin, 28 * unit);
  setReportFont(doc, language, fontLoaded, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 72);
  doc.text(formatPdfText(title, language), rtl ? pageWidth - margin : margin, 37 * unit, {
    align: rtl ? 'right' : 'left'
  });
};

export const decorateReportPages = (doc, { language = 'en', fontLoaded = false, branding = {}, generatedOn = '' }) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rtl = isArabicExport(language);
  const unit = reportUnit(doc);
  const margin = REPORT_MARGIN * unit;

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    if (page > 1) {
      if (branding.mirsat) doc.addImage(branding.mirsat, 'PNG', margin, 7 * unit, 18 * unit, 18 * unit);
      if (branding.srsa) doc.addImage(branding.srsa, 'PNG', pageWidth - margin - (43 * unit), 8 * unit, 43 * unit, 15 * unit);
      doc.setDrawColor(226, 232, 237);
      doc.setLineWidth(0.35);
      doc.line(margin, 28 * unit, pageWidth - margin, 28 * unit);
    }

    setReportFont(doc, language, fontLoaded);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(formatPdfText(generatedOn, language), rtl ? pageWidth - margin : margin, pageHeight - (7 * unit), {
      align: rtl ? 'right' : 'left'
    });
    doc.text(`${page}/${totalPages}`, rtl ? margin : pageWidth - margin, pageHeight - (7 * unit), {
      align: rtl ? 'left' : 'right'
    });
  }
};

export const drawLegacyReportNote = (doc, { note, language = 'en', fontLoaded = false }) => {
  if (!note) return;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rtl = isArabicExport(language);
  const unit = reportUnit(doc);
  const margin = REPORT_MARGIN * unit;
  let y = (doc.lastAutoTable?.finalY || (42 * unit)) + (7 * unit);

  if (y > pageHeight - (22 * unit)) {
    doc.addPage();
    y = 42 * unit;
  }

  setReportFont(doc, language, fontLoaded, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(formatPdfText(note, language), rtl ? pageWidth - margin : margin, y, {
    align: rtl ? 'right' : 'left',
    maxWidth: pageWidth - (margin * 2),
  });
};

export const reportTableTheme = (fontLoaded, language, doc) => {
  const unit = doc ? reportUnit(doc) : 1;
  const margin = REPORT_MARGIN * unit;
  return {
  theme: 'grid',
  margin: { left: margin, right: margin, top: 42 * unit, bottom: 14 * unit },
  headStyles: { fillColor: [0, 0, 72], textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
  bodyStyles: { fontSize: 8.5, textColor: '#111827' },
  styles: { lineColor: [203, 213, 225], lineWidth: 0.2, cellPadding: 2.2 },
  didParseCell: (data) => {
    if (isArabicExport(language) && fontLoaded) {
      data.cell.styles.font = 'NotoNaskhArabic';
      data.cell.styles.fontStyle = 'normal';
      data.cell.styles.halign = 'right';
    }
  }
};
};
