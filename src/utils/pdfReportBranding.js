import { formatPdfText, isArabicExport } from './exportLocalization';

const REPORT_MARGIN = 14;

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

  if (branding.mirsat) doc.addImage(branding.mirsat, 'PNG', REPORT_MARGIN, 7, 18, 18);
  if (branding.srsa) doc.addImage(branding.srsa, 'PNG', pageWidth - REPORT_MARGIN - 43, 8, 43, 15);

  doc.setDrawColor(226, 232, 237);
  doc.setLineWidth(0.35);
  doc.line(REPORT_MARGIN, 28, pageWidth - REPORT_MARGIN, 28);
  setReportFont(doc, language, fontLoaded, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 72);
  doc.text(formatPdfText(title, language), rtl ? pageWidth - REPORT_MARGIN : REPORT_MARGIN, 37, {
    align: rtl ? 'right' : 'left'
  });
};

export const decorateReportPages = (doc, { language = 'en', fontLoaded = false, branding = {}, generatedOn = '' }) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rtl = isArabicExport(language);

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    if (page > 1) {
      if (branding.mirsat) doc.addImage(branding.mirsat, 'PNG', REPORT_MARGIN, 7, 18, 18);
      if (branding.srsa) doc.addImage(branding.srsa, 'PNG', pageWidth - REPORT_MARGIN - 43, 8, 43, 15);
      doc.setDrawColor(226, 232, 237);
      doc.setLineWidth(0.35);
      doc.line(REPORT_MARGIN, 28, pageWidth - REPORT_MARGIN, 28);
    }

    setReportFont(doc, language, fontLoaded);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(formatPdfText(generatedOn, language), rtl ? pageWidth - REPORT_MARGIN : REPORT_MARGIN, pageHeight - 7, {
      align: rtl ? 'right' : 'left'
    });
    doc.text(`${page}/${totalPages}`, rtl ? REPORT_MARGIN : pageWidth - REPORT_MARGIN, pageHeight - 7, {
      align: rtl ? 'left' : 'right'
    });
  }
};

export const drawLegacyReportNote = (doc, { note, language = 'en', fontLoaded = false }) => {
  if (!note) return;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rtl = isArabicExport(language);
  let y = (doc.lastAutoTable?.finalY || 42) + 7;

  if (y > pageHeight - 22) {
    doc.addPage();
    y = 42;
  }

  setReportFont(doc, language, fontLoaded, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(formatPdfText(note, language), rtl ? pageWidth - REPORT_MARGIN : REPORT_MARGIN, y, {
    align: rtl ? 'right' : 'left',
    maxWidth: pageWidth - (REPORT_MARGIN * 2),
  });
};

export const reportTableTheme = (fontLoaded, language) => ({
  theme: 'grid',
  margin: { left: REPORT_MARGIN, right: REPORT_MARGIN, top: 42, bottom: 14 },
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
});
