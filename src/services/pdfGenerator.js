import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ArabicReshaper from 'arabic-reshaper';
import {
  exportText,
  formatExportDate,
  formatPdfText as formatLocalizedPdfText,
  formatStatusForExport,
  isArabicExport,
  normalizeExportLanguage,
  orderForLanguage,
  orderRowsForLanguage
} from '../utils/exportLocalization';

const HEADER_HEIGHT = 28;
const TOP_MARGIN = 14;
const BOTTOM_MARGIN = 14;
const SIDE_MARGIN = 14;
const CONTENT_START_Y = TOP_MARGIN + HEADER_HEIGHT;

const NON_COMPLIANT_VALUES = new Set([
  'non_compliance',
  'non compliance',
  'non-compliance',
  'noncompliance',
  'non compliant',
  'no',
  'غير سليم',
  'غير مطابق',
  'غير متوفر'
]);

const containsArabic = (text) => {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(String(text));
};

const processArabicText = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!containsArabic(text)) return text;
  try {
    return ArabicReshaper.convertArabic(text);
  } catch (error) {
    return text;
  }
};

const safeText = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return processArabicText(String(value));
};

const normalizeTaskDataInput = (rawTaskData) => {
  if (!rawTaskData || typeof rawTaskData !== 'object') return {};

  if (rawTaskData.data && typeof rawTaskData.data === 'object') {
    // Handle Axios API response shapes: { status, data: task } or { data: { status, data: task } }
    if (rawTaskData.data.data && typeof rawTaskData.data.data === 'object') {
      return rawTaskData.data.data;
    }
    return rawTaskData.data;
  }

  return rawTaskData;
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return safeText(value);
  return date.toLocaleString();
};

const formatDuration = (secondsValue, language = 'en') => {
  const seconds = Number(secondsValue || 0);
  const rtl = isArabicExport(language);
  if (!Number.isFinite(seconds) || seconds <= 0) return rtl ? '0 دقيقة' : '0 mins';
  const minutes = Math.round(seconds / 60);
  if (minutes <= 0) return rtl ? '0 دقيقة' : '0 mins';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (rtl) {
    if (hours <= 0) return `${remaining} دقيقة`;
    if (remaining <= 0) return `${hours} ساعة`;
    return `${hours} ساعة ${remaining} دقيقة`;
  }
  if (hours <= 0) return `${remaining} min${remaining === 1 ? '' : 's'}`;
  if (remaining <= 0) return `${hours} hr${hours === 1 ? '' : 's'}`;
  return `${hours} hr${hours === 1 ? '' : 's'} ${remaining} min${remaining === 1 ? '' : 's'}`;
};

const isScorableQuestion = (question) => {
  const qType = (question?.type || question?.answerType || '').toLowerCase();
  if (!['yesno', 'compliance'].includes(qType)) return false;
  if (question?.requirementType === 'recommended') return false;
  if (question?.mandatory === false || question?.required === false) return false;
  return true;
};

const getMaxScore = (question) => {
  const fromScoring = Number(question?.scoring?.max || 0);
  if (Number.isFinite(fromScoring) && fromScoring > 0) return fromScoring;

  if (question?.scores && typeof question.scores === 'object') {
    const values = Object.values(question.scores)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (values.length > 0) {
      const max = Math.max(...values);
      if (Number.isFinite(max) && max > 0) return max;
    }
  }

  return 2;
};

const findResponseEntry = (responses, questionId) => {
  if (!responses || !questionId) return { key: null, value: null };

  const id = String(questionId);
  const directKeys = [id, `q-${id}`, `question-${id}`];

  for (const key of directKeys) {
    if (Object.prototype.hasOwnProperty.call(responses, key)) {
      return { key, value: responses[key] };
    }
  }

  const fuzzyKey = Object.keys(responses).find((key) => (
    !key.startsWith('c-') && (key === id || key.endsWith(id) || key.includes(id))
  ));

  if (!fuzzyKey) return { key: null, value: null };
  return { key: fuzzyKey, value: responses[fuzzyKey] };
};

const findResponseMetadata = (metadataMap, questionId, responseKey = null) => {
  if (!metadataMap || !questionId) return null;

  const id = String(questionId);
  const lookupKeys = [id, `q-${id}`, `question-${id}`];
  if (responseKey) lookupKeys.unshift(responseKey);

  for (const key of lookupKeys) {
    if (key && metadataMap[key]) return metadataMap[key];
  }

  const fuzzyKey = Object.keys(metadataMap).find((key) => (
    key === id || key.endsWith(id) || key.includes(id)
  ));

  return fuzzyKey ? metadataMap[fuzzyKey] : null;
};

const formatCaptureMetadata = (metadata, language = 'en') => {
  if (!metadata || typeof metadata !== 'object') return '';

  const captured = metadata.capturedAt
    ? (isArabicExport(language) ? formatExportDate(metadata.capturedAt, language, { includeTime: true }) : formatDateTime(metadata.capturedAt))
    : exportText(language, 'na');
  const latitude = metadata.location?.latitude;
  const longitude = metadata.location?.longitude;
  const hasCoords = latitude !== undefined && longitude !== undefined;
  const coords = hasCoords
    ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
    : exportText(language, 'unavailable');

  return `${exportText(language, 'captured')}: ${captured}\n${exportText(language, 'coordinates')}: ${coords}`;
};

const extractQuestionRows = (taskData) => {
  const inspectionLevel = taskData?.inspectionLevel || {};
  const pages = Array.isArray(inspectionLevel.pages) ? inspectionLevel.pages : [];

  const rows = [];
  pages.forEach((page, pageIndex) => {
    const pageNo = String(pageIndex + 1);
    const sections = Array.isArray(page?.sections) ? page.sections : [];

    sections.forEach((section, sectionIndex) => {
      const sectionNo = `${pageNo}.${sectionIndex + 1}`;
      const questions = Array.isArray(section?.questions) ? section.questions : [];

      questions.forEach((question, questionIndex) => {
        const questionId = question?._id?.toString() || question?.id?.toString();
        if (!questionId) return;

        rows.push({
          id: questionId,
          number: `${sectionNo}.${questionIndex + 1}`,
          pageNo,
          sectionNo,
          pageName: page?.name || `Page ${pageNo}`,
          sectionName: section?.name || `Section ${sectionNo}`,
          question
        });
      });
    });
  });

  if (rows.length > 0) return rows;

  const fallbackQuestions = Array.isArray(taskData?.questions) ? taskData.questions : [];
  return fallbackQuestions
    .map((question, index) => {
      const questionId = question?._id?.toString() || question?.id?.toString();
      if (!questionId) return null;
      return {
        id: questionId,
        number: `1.1.${index + 1}`,
        pageNo: '1',
        sectionNo: '1.1',
        pageName: 'Page 1',
        sectionName: 'Section 1.1',
        question
      };
    })
    .filter(Boolean);
};

const extractPreInspectionQuestions = (taskData) => {
  if (Array.isArray(taskData?.preInspectionQuestions) && taskData.preInspectionQuestions.length > 0) {
    return taskData.preInspectionQuestions;
  }

  const inspectionLevelPre = taskData?.inspectionLevel?.preInspectionQuestions;
  return Array.isArray(inspectionLevelPre) ? inspectionLevelPre : [];
};

const calculateScoreSummary = (questionRows, responses) => {
  let achieved = 0;
  let total = 0;

  questionRows.forEach(({ id, question }) => {
    if (!isScorableQuestion(question)) return;

    const { value } = findResponseEntry(responses, id);
    if (value === null || value === undefined || value === '') return;

    const normalized = String(value).toLowerCase();
    if (['na', 'n/a', 'not_applicable', 'not applicable'].includes(normalized)) {
      return;
    }

    const weight = Number(question?.weight || 1);
    const max = getMaxScore(question);
    const weightedMax = max * weight;

    total += weightedMax;

    if (question?.scores && typeof question.scores === 'object') {
      const configured = Number(question.scores[value] ?? question.scores[String(value)] ?? 0);
      if (Number.isFinite(configured)) achieved += configured * weight;
      return;
    }

    if (['full_compliance', 'full compliance', 'yes'].includes(normalized)) {
      achieved += weightedMax;
    } else if (['partial_compliance', 'partial compliance'].includes(normalized)) {
      achieved += weightedMax / 2;
    }
  });

  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;
  return { achieved, total, percentage };
};

const getQuestionScoreLabel = (question, response) => {
  if (!isScorableQuestion(question)) return 'N/A';
  if (response === null || response === undefined || response === '') return 'N/A';

  const normalized = String(response).toLowerCase();
  if (['na', 'n/a', 'not_applicable', 'not applicable'].includes(normalized)) {
    return 'N/A';
  }

  const max = getMaxScore(question);
  const weight = Number(question?.weight || 1);
  const weightedMax = max * weight;

  let earned = 0;
  if (question?.scores && typeof question.scores === 'object') {
    const configured = Number(question.scores[response] ?? question.scores[String(response)] ?? 0);
    if (Number.isFinite(configured)) earned = configured * weight;
  } else if (['full_compliance', 'full compliance', 'yes'].includes(normalized)) {
    earned = weightedMax;
  } else if (['partial_compliance', 'partial compliance'].includes(normalized)) {
    earned = weightedMax / 2;
  }

  return `${Number(earned.toFixed(2))}/${Number(weightedMax.toFixed(2))}`;
};

const deriveFlaggedItems = (taskData, questionRows, responses) => {
  if (Array.isArray(taskData?.flaggedItems) && taskData.flaggedItems.length > 0) {
    return taskData.flaggedItems.map((item, index) => ({
      itemNo: index + 1,
      checkpoint: item?.path || item?.title || 'N/A',
      status: safeText(item?.status)
    }));
  }

  const flagged = [];
  questionRows.forEach((row) => {
    const { value } = findResponseEntry(responses, row.id);
    if (!isNonCompliant(value)) return;

    flagged.push({
      itemNo: flagged.length + 1,
      checkpoint: `${row.number} ${row.question?.text || row.question?.question || 'N/A'}`,
      status: safeText(value)
    });
  });

  return flagged;
};

const isNonCompliant = (value) => {
  if (value === null || value === undefined) return false;
  return NON_COMPLIANT_VALUES.has(String(value).trim().toLowerCase());
};

const loadArabicFont = async (doc) => {
  const sources = [
    `${window.location.origin}/fonts/Amiri-Regular.ttf`,
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf'
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      const base64 = btoa(binary);
      doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', base64);
      doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      return true;
    } catch (error) {
      // try next source
    }
  }

  console.warn('Could not load Arabic font from local or CDN sources.');
  return false;
};

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
  } catch (error) {
    return null;
  }
};

const fetchImageSource = async (imageSource) => {
  if (!imageSource || typeof imageSource !== 'string') return null;
  if (imageSource.startsWith('data:image/')) return imageSource;
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return toDataUrl(imageSource);
  }
  return null;
};

const responseToDisplay = async (response, language = 'en') => {
  if (response === null || response === undefined || response === '') {
    return { text: exportText(language, 'noResponse'), image: null };
  }

  if (Array.isArray(response)) {
    return { text: response.map((item) => safeText(item)).join(', '), image: null };
  }

  const value = String(response);
  if (value.startsWith('data:image/')) {
    return { text: exportText(language, 'imageUploaded'), image: value };
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const fetched = await fetchImageSource(value);
    return fetched ? { text: exportText(language, 'imageUploaded'), image: fetched } : { text: value, image: null };
  }
  if (value.startsWith('data:')) {
    return { text: exportText(language, 'fileUploaded'), image: null };
  }

  return { text: safeText(value), image: null };
};

const buildResponseCellText = (display, metadata, language = 'en') => {
  const lines = [safeText(display?.text || exportText(language, 'noResponse'))];
  if (metadata) {
    const metaText = formatCaptureMetadata(metadata, language);
    if (metaText) lines.push(metaText);
  }
  return lines.join('\n');
};

const applyArabicCellFont = (data, fontLoaded) => {
  if (!fontLoaded) return;
  if (!data?.cell?.raw) return;
  if (!containsArabic(String(data.cell.raw))) return;
  data.cell.styles.font = 'NotoNaskhArabic';
  data.cell.styles.fontStyle = 'normal';
  data.cell.styles.halign = 'right';
};

const drawPageDecorations = ({
  doc,
  pageNumber,
  totalPages,
  leftLogo,
  rightLogo,
  colors,
  generatedAt,
  language = 'en',
  fontLoaded = false
}) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const logoW = 22;
  const logoH = 14;
  const logoY = TOP_MARGIN - 10;

  if (leftLogo) {
    doc.addImage(leftLogo, 'PNG', SIDE_MARGIN, logoY, logoW, logoH);
  }

  if (rightLogo) {
    doc.addImage(rightLogo, 'PNG', pageWidth - SIDE_MARGIN - logoW, logoY, logoW, logoH);
  }

  doc.setDrawColor(colors.border);
  doc.line(SIDE_MARGIN, TOP_MARGIN + 6, pageWidth - SIDE_MARGIN, TOP_MARGIN + 6);

  if (isArabicExport(language) && fontLoaded) {
    doc.setFont('NotoNaskhArabic', 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  doc.setFontSize(7.5);
  doc.setTextColor(colors.muted);
  const generatedText = formatLocalizedPdfText(`${exportText(language, 'generatedOn')} ${generatedAt}`, language);
  const pageText = formatLocalizedPdfText(`${exportText(language, 'page')} ${pageNumber}/${totalPages}`, language);
  doc.text(
    generatedText,
    isArabicExport(language) ? pageWidth - SIDE_MARGIN : SIDE_MARGIN,
    pageHeight - 6,
    { align: isArabicExport(language) ? 'right' : 'left' }
  );
  doc.text(
    pageText,
    isArabicExport(language) ? SIDE_MARGIN : pageWidth - SIDE_MARGIN,
    pageHeight - 6,
    { align: isArabicExport(language) ? 'left' : 'right' }
  );
};

export const generateTaskPDF = async (taskData, language = 'en') => {
  const exportLanguage = normalizeExportLanguage(language);
  const L = (key) => exportText(exportLanguage, key);
  const pdfText = (value) => formatLocalizedPdfText(value, exportLanguage);
  const blank = (value) => (
    value === null || value === undefined || value === '' ? L('na') : String(value)
  );
  const normalizedTaskData = normalizeTaskDataInput(taskData);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const fontLoaded = await loadArabicFont(doc);

  const colors = {
    navy: '#102a63',
    text: '#111827',
    muted: '#6b7280',
    border: '#d1d5db',
    soft: '#f3f4f6',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626'
  };

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - (SIDE_MARGIN * 2);
  const rtl = isArabicExport(exportLanguage);

  const responses = normalizedTaskData?.questionnaireResponses || {};
  const responseMetadata = normalizedTaskData?.responseMetadata || {};
  const questionRows = extractQuestionRows(normalizedTaskData);
  const preInspectionQuestions = extractPreInspectionQuestions(normalizedTaskData);
  const scoreSummary = calculateScoreSummary(questionRows, responses);
  const flaggedItems = deriveFlaggedItems(normalizedTaskData, questionRows, responses);

  const inspector = Array.isArray(normalizedTaskData?.assignedTo) && normalizedTaskData.assignedTo.length > 0
    ? (normalizedTaskData.assignedTo[0]?.name || normalizedTaskData.assignedTo[0]?.username || 'N/A')
    : 'N/A';
  const department = Array.isArray(normalizedTaskData?.assignedTo) && normalizedTaskData.assignedTo.length > 0
    ? (normalizedTaskData.assignedTo[0]?.department || 'N/A')
    : 'N/A';

  const templateName = normalizedTaskData?.inspectionLevel?.name || normalizedTaskData?.inspectionLevel?.title || 'N/A';
  const assetName =
    (typeof normalizedTaskData?.asset === 'string' && normalizedTaskData.asset)
    || normalizedTaskData?.asset?.displayName
    || normalizedTaskData?.asset?.name
    || normalizedTaskData?.asset?.assetName
    || 'N/A';

  let y = CONTENT_START_Y;

  const ensureSpace = (needed = 20) => {
    if (y + needed > pageHeight - BOTTOM_MARGIN - 8) {
      doc.addPage();
      y = CONTENT_START_Y;
    }
  };

  const text = (value, x, yPos, opts = {}) => {
    const {
      size = 10,
      style = 'normal',
      color = colors.text,
      align = 'left',
      maxWidth
    } = opts;

    const content = isArabicExport(exportLanguage) ? pdfText(blank(value)) : safeText(value);
    doc.setFontSize(size);
    doc.setTextColor(color);

    if (fontLoaded && containsArabic(content)) {
      doc.setFont('NotoNaskhArabic', 'normal');
    } else {
      doc.setFont('helvetica', style);
    }

    if (maxWidth) {
      const lines = doc.splitTextToSize(content, maxWidth);
      doc.text(lines, x, yPos, { align });
      return lines.length * (size * 0.45);
    }

    doc.text(content, x, yPos, { align: isArabicExport(exportLanguage) && align === 'left' ? 'right' : align });
    return size * 0.45;
  };

  // Title and labels
  text(L('inspectionReport'), pageWidth / 2, y, { size: 14, style: 'bold', align: 'center', color: colors.navy });
  y += 8;
  text(`${L('template')}: ${templateName}`, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 10, style: 'bold' });
  y += 5;
  text(`${L('asset')}: ${assetName}`, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 10, style: 'bold' });
  y += 8;

  // Inspection details table
  ensureSpace(40);
  text(L('inspectionReport'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 12, style: 'bold', color: colors.navy });
  y += 4;

  const detailsRows = [
    [L('title'), blank(normalizedTaskData?.title)],
    [L('template'), blank(templateName)],
    [L('asset'), blank(assetName)],
    [L('assetType'), blank(normalizedTaskData?.asset?.type)],
    [L('city'), blank(normalizedTaskData?.asset?.city)],
    [L('location'), blank(normalizedTaskData?.asset?.location || normalizedTaskData?.location)],
    [L('description'), blank(normalizedTaskData?.description)],
    [L('createdAt'), formatExportDate(normalizedTaskData?.createdAt, exportLanguage, { includeTime: true })],
    [L('closedAt'), formatExportDate(normalizedTaskData?.signedAt || normalizedTaskData?.updatedAt, exportLanguage, { includeTime: true })],
    [L('inspector'), blank(inspector)],
    [L('department'), blank(department)],
    [L('status'), formatStatusForExport(normalizedTaskData?.status, exportLanguage)]
  ].map((row) => row.map((cell) => pdfText(cell)));

  doc.autoTable({
    startY: y,
    head: [orderForLanguage([L('property'), L('value')].map((cell) => pdfText(cell)), exportLanguage)],
    body: orderRowsForLanguage(detailsRows, exportLanguage),
    theme: 'grid',
    margin: { left: SIDE_MARGIN, right: SIDE_MARGIN, top: CONTENT_START_Y, bottom: BOTTOM_MARGIN },
    headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: colors.text },
    styles: { lineColor: colors.border, lineWidth: 0.2, cellPadding: 2.2 },
    columnStyles: rtl
      ? { 0: { cellWidth: contentWidth - 40, halign: 'right' }, 1: { cellWidth: 40, halign: 'right' } }
      : { 0: { cellWidth: 40 }, 1: { cellWidth: contentWidth - 40 } },
    didParseCell: (data) => applyArabicCellFont(data, fontLoaded)
  });

  y = (doc.lastAutoTable?.finalY || y) + 6;

  // KPI cards
  ensureSpace(34);
  const cardGap = 4;
  const cardW = (contentWidth - (cardGap * 2)) / 3;
  const cardH = 24;
  const durationText = formatDuration(normalizedTaskData?.taskMetrics?.timeSpent, exportLanguage);

  const cards = [
    { title: L('score'), value: `${scoreSummary.percentage}%`, subtitle: `${Number(scoreSummary.achieved.toFixed(2))}/${Number(scoreSummary.total.toFixed(2))}`, color: colors.navy },
    { title: L('flaggedItems'), value: String(flaggedItems.length), subtitle: L('task'), color: colors.danger },
    { title: L('duration'), value: durationText, subtitle: L('total'), color: colors.warning }
  ];

  cards.forEach((card, index) => {
    const x = SIDE_MARGIN + (index * (cardW + cardGap));
    doc.setFillColor(colors.soft);
    doc.setDrawColor(colors.border);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

    text(card.title, rtl ? x + cardW - 2 : x + 2, y + 6, { size: 8, style: 'bold', align: rtl ? 'right' : 'left', color: colors.muted });
    text(card.value, x + (cardW / 2), y + 14, { size: 14, style: 'bold', align: 'center', color: card.color });
    text(card.subtitle, x + (cardW / 2), y + 20, { size: 7.5, align: 'center', color: colors.muted });
  });

  y += cardH + 8;

  // Pre-inspection questionnaire
  if (preInspectionQuestions.length > 0) {
    ensureSpace(24);
    text(L('preInspectionQuestionnaire'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 12, style: 'bold', color: colors.navy });
    y += 4;

    const preImageMap = new Map();
    const preRows = await Promise.all(preInspectionQuestions.map(async (question, index) => {
      const questionId = question?._id?.toString() || question?.id?.toString();
      const { key, value } = findResponseEntry(responses, questionId);
      const display = await responseToDisplay(value, exportLanguage);
      const metadata = findResponseMetadata(responseMetadata, questionId, key);

      if (display.image) preImageMap.set(index, display.image);

      const responseCell = buildResponseCellText(display, metadata, exportLanguage);

      return [String(index + 1), blank(question?.text || question?.question), responseCell || L('noResponse')].map((cell) => pdfText(cell));
    }));

    const preResponseColumn = rtl ? 0 : 2;

    doc.autoTable({
      startY: y,
      head: [orderForLanguage(['#', L('question'), L('answer')].map((cell) => pdfText(cell)), exportLanguage)],
      body: orderRowsForLanguage(preRows, exportLanguage),
      theme: 'grid',
      margin: { left: SIDE_MARGIN, right: SIDE_MARGIN, top: CONTENT_START_Y, bottom: BOTTOM_MARGIN },
      headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.2, textColor: colors.text, minCellHeight: 10 },
      styles: { lineColor: colors.border, lineWidth: 0.2, cellPadding: 2 },
      rowPageBreak: 'avoid',
      columnStyles: rtl
        ? {
          0: { cellWidth: contentWidth - 82, halign: 'right' },
          1: { cellWidth: 72, halign: 'right' },
          2: { cellWidth: 10, halign: 'center' }
        }
        : {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 72 },
          2: { cellWidth: contentWidth - 82 }
        },
      didParseCell: (data) => {
        applyArabicCellFont(data, fontLoaded);
        if (data.section === 'body' && data.column.index === preResponseColumn && preImageMap.has(data.row.index)) {
          data.cell.styles.minCellHeight = 14;
          data.cell.styles.valign = 'top';
        }
      },
      didDrawCell: (data) => {
        if (data.column.index === preResponseColumn && preImageMap.has(data.row.index)) {
          try {
            const image = preImageMap.get(data.row.index);
            const targetH = Math.max(8, Math.min(10, data.cell.height - 2));
            const targetW = targetH * 1.6;
            const imageX = rtl ? data.cell.x + 1 : data.cell.x + data.cell.width - targetW - 1;
            doc.addImage(image, 'PNG', imageX, data.cell.y + 1, targetW, targetH);
          } catch (error) {
            // keep text fallback only
          }
        }
      }
    });

    y = (doc.lastAutoTable?.finalY || y) + 6;
  }

  // Flagged items summary
  ensureSpace(24);
  text(L('flaggedItemsSummary'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 12, style: 'bold', color: colors.navy });
  y += 4;

  const flaggedRows = flaggedItems.length > 0
    ? flaggedItems.map((item) => [String(item.itemNo), blank(item.checkpoint), blank(item.status)].map((cell) => pdfText(cell)))
    : [['-', L('noFlaggedItems'), '-'].map((cell) => pdfText(cell))];

  doc.autoTable({
    startY: y,
    head: [orderForLanguage([L('itemNo'), L('checkpoint'), L('status')].map((cell) => pdfText(cell)), exportLanguage)],
    body: orderRowsForLanguage(flaggedRows, exportLanguage),
    theme: 'grid',
    margin: { left: SIDE_MARGIN, right: SIDE_MARGIN, top: CONTENT_START_Y, bottom: BOTTOM_MARGIN },
    headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.2, textColor: colors.text },
    styles: { lineColor: colors.border, lineWidth: 0.2, cellPadding: 2 },
    columnStyles: rtl
      ? {
        0: { cellWidth: 32, halign: 'right' },
        1: { cellWidth: contentWidth - 50, halign: 'right' },
        2: { cellWidth: 18, halign: 'center' }
      }
      : {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: contentWidth - 50 },
        2: { cellWidth: 32 }
      },
    didParseCell: (data) => applyArabicCellFont(data, fontLoaded)
  });

  y = (doc.lastAutoTable?.finalY || y) + 6;

  // Inspection questionnaire by page and section
  if (questionRows.length > 0) {
    const groupedByPage = new Map();
    questionRows.forEach((row) => {
      const key = row.pageNo;
      if (!groupedByPage.has(key)) {
        groupedByPage.set(key, {
          pageName: row.pageName,
          sections: new Map()
        });
      }

      const page = groupedByPage.get(key);
      if (!page.sections.has(row.sectionNo)) {
        page.sections.set(row.sectionNo, {
          sectionName: row.sectionName,
          rows: []
        });
      }

      page.sections.get(row.sectionNo).rows.push(row);
    });

    for (const [pageNo, pageData] of groupedByPage.entries()) {
      ensureSpace(14);
      text(`${L('pageLabel')} ${pageNo}: ${blank(pageData.pageName)}`, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 11, style: 'bold', color: colors.navy });
      y += 5;

      for (const [sectionNo, sectionData] of pageData.sections.entries()) {
        ensureSpace(12);
        text(`${L('section')} ${sectionNo}: ${blank(sectionData.sectionName)}`, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 10, style: 'bold', color: colors.text });
        y += 4;

        const imageMap = new Map();
        const rows = await Promise.all(sectionData.rows.map(async (row, index) => {
          const { key, value } = findResponseEntry(responses, row.id);
          const display = await responseToDisplay(value, exportLanguage);
          const metadata = findResponseMetadata(responseMetadata, row.id, key);

          if (display.image) imageMap.set(index, display.image);

          const responseCell = buildResponseCellText(display, metadata, exportLanguage);

          const scoreLabel = getQuestionScoreLabel(row.question, value);
          const checkpoint = safeText(row.question?.text || row.question?.question);

          return [row.number, checkpoint, responseCell || L('noResponse'), scoreLabel].map((cell) => pdfText(cell));
        }));

        const responseColumn = rtl ? 1 : 2;

        doc.autoTable({
          startY: y,
          head: [orderForLanguage(['#', L('checkpoint'), L('response'), L('score')].map((cell) => pdfText(cell)), exportLanguage)],
          body: orderRowsForLanguage(rows, exportLanguage),
          theme: 'grid',
          margin: { left: SIDE_MARGIN, right: SIDE_MARGIN, top: CONTENT_START_Y, bottom: BOTTOM_MARGIN },
          headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold', fontSize: 8.5 },
          bodyStyles: { fontSize: 8, textColor: colors.text, minCellHeight: 10 },
          styles: { lineColor: colors.border, lineWidth: 0.2, cellPadding: 2 },
          rowPageBreak: 'avoid',
          columnStyles: rtl
            ? {
              0: { cellWidth: 20, halign: 'center' },
              1: { cellWidth: contentWidth - 112, halign: 'right' },
              2: { cellWidth: 72, halign: 'right' },
              3: { cellWidth: 20, halign: 'center' }
            }
            : {
              0: { cellWidth: 20, halign: 'center' },
              1: { cellWidth: 72 },
              2: { cellWidth: contentWidth - 112 },
              3: { cellWidth: 20, halign: 'center' }
            },
          didParseCell: (data) => {
            applyArabicCellFont(data, fontLoaded);
            if (data.section === 'body' && data.column.index === responseColumn && imageMap.has(data.row.index)) {
              data.cell.styles.minCellHeight = 14;
              data.cell.styles.valign = 'top';
            }
          },
          didDrawCell: (data) => {
            if (data.column.index === responseColumn && imageMap.has(data.row.index)) {
              try {
                const image = imageMap.get(data.row.index);
                const targetH = Math.max(7, Math.min(9, data.cell.height - 2));
                const targetW = targetH * 1.6;
                const imageX = rtl ? data.cell.x + 1 : data.cell.x + data.cell.width - targetW - 1;
                doc.addImage(image, 'PNG', imageX, data.cell.y + 1, targetW, targetH);
              } catch (error) {
                // keep text fallback only
              }
            }
          }
        });

        y = (doc.lastAutoTable?.finalY || y) + 5;
      }
    }
  }

  // Signature
  if (normalizedTaskData?.signature || normalizedTaskData?.signedAt) {
    ensureSpace(34);
    text(L('signature'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y, { size: 12, style: 'bold', color: colors.navy });
    y += 4;

    if (normalizedTaskData?.signature && typeof normalizedTaskData.signature === 'string') {
      const signatureImage = await fetchImageSource(normalizedTaskData.signature) || normalizedTaskData.signature;
      if (signatureImage && typeof signatureImage === 'string' && signatureImage.startsWith('data:image/')) {
        try {
          doc.addImage(signatureImage, 'PNG', rtl ? pageWidth - SIDE_MARGIN - 62 : SIDE_MARGIN, y, 62, 24);
        } catch (error) {
          text(L('digitallySigned'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y + 8, { size: 10, color: colors.success });
        }
      } else {
        text(L('digitallySigned'), rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y + 8, { size: 10, color: colors.success });
      }
    }

    const signatureMetadataText = formatCaptureMetadata(normalizedTaskData?.signatureMetadata, exportLanguage);
    text(`${L('signedAt')}: ${formatExportDate(normalizedTaskData?.signedAt, exportLanguage, { includeTime: true })}`, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y + 28, { size: 9, color: colors.text });
    if (signatureMetadataText) {
      text(signatureMetadataText, rtl ? pageWidth - SIDE_MARGIN : SIDE_MARGIN, y + 33, { size: 8.5, color: colors.muted, align: rtl ? 'right' : 'left', maxWidth: contentWidth });
      y += 42;
    } else {
      y += 34;
    }
  }

  const leftLogo = await toDataUrl(`${window.location.origin}/logo.png`);
  const rightLogo = await toDataUrl(`${window.location.origin}/logo.png`);
  const generatedAt = formatExportDate(new Date(), exportLanguage, { includeTime: true });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPageDecorations({
      doc,
      pageNumber: page,
      totalPages,
      leftLogo,
      rightLogo,
      colors,
      generatedAt,
      language: exportLanguage,
      fontLoaded
    });
  }

  return doc;
};

export const downloadTaskPDF = async (taskData, filename = 'inspection_report', language = 'en') => {
  const doc = await generateTaskPDF(taskData, language);
  doc.save(`${filename}.pdf`);
};
