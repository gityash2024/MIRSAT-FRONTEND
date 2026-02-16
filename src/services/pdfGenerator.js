import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to detect if text contains Arabic characters
const containsArabic = (text) => {
  if (!text) return false;
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Process task data to match backend structure
function processTaskDataForPDF(taskData) {
  if (!taskData) return taskData;

  console.log('Raw task data received:', taskData);

  // Extract questions from inspection level
  let questions = [];
  const questionIds = new Set();

  if (taskData.inspectionLevel) {
    // Extract questions from pages structure (prioritize this)
    if (taskData.inspectionLevel.pages) {
      taskData.inspectionLevel.pages.forEach((page) => {
        if (page.sections && Array.isArray(page.sections)) {
          page.sections.forEach((section) => {
            if (section.questions && Array.isArray(section.questions)) {
              section.questions.forEach((question) => {
                const questionId = question._id?.toString() || question.id?.toString();
                if (questionId && !questionIds.has(questionId)) {
                  questionIds.add(questionId);
                  questions.push(question);
                }
              });
            }
          });
        }
      });
    }

    // Extract questions from subLevels structure (fallback)
    if (questions.length === 0 && taskData.inspectionLevel.subLevels) {
      const extractQuestions = (subLevels) => {
        if (!subLevels || !Array.isArray(subLevels)) return;

        for (const subLevel of subLevels) {
          if (!subLevel) continue;

          if (subLevel.questions && Array.isArray(subLevel.questions)) {
            subLevel.questions.forEach((question) => {
              const questionId = question._id?.toString() || question.id?.toString();
              if (questionId && !questionIds.has(questionId)) {
                questionIds.add(questionId);
                questions.push(question);
              }
            });
          }

          if (subLevel.subLevels && Array.isArray(subLevel.subLevels)) {
            extractQuestions(subLevel.subLevels);
          }
        }
      };

      extractQuestions(taskData.inspectionLevel.subLevels);
    }

    // Fallback: if no questions found in pages or subLevels, use direct questions
    if (questions.length === 0 && taskData.inspectionLevel.questions && taskData.inspectionLevel.questions.length) {
      taskData.inspectionLevel.questions.forEach((question) => {
        const questionId = question._id?.toString() || question.id?.toString();
        if (questionId && !questionIds.has(questionId)) {
          questionIds.add(questionId);
          questions.push(question);
        }
      });
    }
  }

  // Get pre-inspection questions
  let preInspectionQuestions = [];
  const preInspectionQuestionIds = new Set();

  if (taskData.inspectionLevel && taskData.inspectionLevel.preInspectionQuestions) {
    taskData.inspectionLevel.preInspectionQuestions.forEach((question) => {
      const questionId = question._id?.toString() || question.id?.toString();
      if (questionId && !preInspectionQuestionIds.has(questionId)) {
        preInspectionQuestionIds.add(questionId);
        preInspectionQuestions.push(question);
      }
    });
  }

  // Filter out pre-inspection questions from the questions array
  const filteredQuestions = questions.filter((q) => {
    if (taskData.inspectionLevel) {
      // Check pages structure first (prioritize this)
      if (taskData.inspectionLevel.pages) {
        const isInPagesStructure = taskData.inspectionLevel.pages.some((page) =>
          page.sections && page.sections.some((section) =>
            section.questions && section.questions.some((question) =>
              question._id && question._id.toString() === (q._id || q.id)?.toString()
            )
          )
        );
        if (isInPagesStructure) return true;
      }

      // Check subLevels structure (fallback)
      if (taskData.inspectionLevel.subLevels) {
        const isInSubLevelsStructure = taskData.inspectionLevel.subLevels.some((page) =>
          page.subLevels && page.subLevels.some((section) =>
            section.questions && section.questions.some((question) =>
              question._id && question._id.toString() === (q._id || q.id)?.toString()
            )
          )
        );
        if (isInSubLevelsStructure) return true;
      }

      // If not found in either structure, exclude it (it's likely a pre-inspection question)
      return false;
    }
    return true;
  });

  // Calculate scores
  let scores = { totalAchieved: 0, totalMax: 0, percentage: 0 };

  if (filteredQuestions.length > 0) {
    let totalAchieved = 0;
    let totalMax = 0;

    filteredQuestions.forEach((question) => {
      if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
        return;
      }

      const questionType = question.type || question.answerType;
      const scorableTypes = ['yesno', 'compliance'];
      if (!scorableTypes.includes(questionType)) {
        return;
      }

      const questionId = question._id?.toString() || question.id?.toString();
      if (!questionId) return;

      // Find response
      let response = null;
      const possibleKeys = [
        `q-${questionId}`,
        `question-${questionId}`,
        questionId
      ];

      for (const key of possibleKeys) {
        if (taskData.questionnaireResponses && taskData.questionnaireResponses[key] !== undefined) {
          response = taskData.questionnaireResponses[key];
          break;
        }
      }

      if (!response && taskData.questionnaireResponses) {
        const foundKey = Object.keys(taskData.questionnaireResponses).find(key =>
          !key.startsWith('c-') && (key.includes(questionId) || key.endsWith(questionId))
        );
        if (foundKey) {
          response = taskData.questionnaireResponses[foundKey];
        }
      }

      const weight = question.weight || 1;
      const maxScore = question.scoring?.max || 2;
      const maxPointsForQuestion = maxScore * weight;

      let earnedPointsForQuestion = 0;
      let isNA = false;

      if (response !== null && response !== undefined) {
        if (response === 'not_applicable' || response === 'na' || response === 'N/A' || response === 'Not applicable') {
          isNA = true;
        } else {
          if (question.scores && typeof question.scores === 'object') {
            const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
            earnedPointsForQuestion = responseScore * weight;
          } else {
            if (questionType === 'compliance' || questionType === 'yesno') {
              if (response === 'full_compliance' || response === 'yes' || response === 'Yes' ||
                response === 'Full Compliance' || response === 'Full compliance') {
                earnedPointsForQuestion = maxPointsForQuestion;
              } else if (response === 'partial_compliance' || response === 'Partial Compliance' ||
                response === 'Partial compliance') {
                earnedPointsForQuestion = maxPointsForQuestion / 2;
              }
            }
          }
        }
      }

      if (!isNA) {
        totalAchieved += earnedPointsForQuestion;
        totalMax += maxPointsForQuestion;
      }
    });

    const percentage = totalMax > 0 ? Math.round((totalAchieved / totalMax) * 100) : 0;
    scores = { totalAchieved, totalMax, percentage };
  }

  const processedData = {
    ...taskData,
    questions: filteredQuestions,
    preInspectionQuestions,
    scores
  };

  return processedData;
}

export const generateTaskPDF = async (taskData) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const loadArabicFont = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf');
        const fontArrayBuffer = await response.arrayBuffer();
        const fontBase64 = btoa(
          new Uint8Array(fontArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', fontBase64);
        doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
        return true;
      } catch (error) {
        console.warn('Could not load Arabic font, fallback will be used:', error);
        return false;
      }
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

    const fetchImage = async (imageSource) => {
      if (!imageSource || typeof imageSource !== 'string') return null;
      if (imageSource.startsWith('data:image/')) return imageSource;
      if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
        return await toDataUrl(imageSource);
      }
      return null;
    };

    const fontLoaded = await loadArabicFont();

    const colors = {
      navy: '#122a6a',
      darkText: '#111827',
      muted: '#6b7280',
      border: '#d1d5db',
      yellow: '#fef08a',
      yellowDeep: '#ca8a04',
      cardGray: '#f3f4f6',
      success: '#16a34a',
      amber: '#f59e0b',
      danger: '#dc2626'
    };

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 14;

    const processedTaskData = processTaskDataForPDF(taskData);
    const allResponses = taskData?.questionnaireResponses || {};

    const pickResponse = (questionId) => {
      if (!questionId) return null;
      const id = questionId.toString();
      const possibleKeys = [`q-${id}`, `question-${id}`, id];
      for (const key of possibleKeys) {
        if (allResponses[key] !== undefined) return allResponses[key];
      }
      const fuzzyKey = Object.keys(allResponses).find((key) =>
        !key.startsWith('c-') && (key.includes(id) || key.endsWith(id))
      );
      return fuzzyKey ? allResponses[fuzzyKey] : null;
    };

    const hasArabicText = (value) => containsArabic(String(value || ''));

    const applyFont = (text, fontStyle = 'normal') => {
      if (hasArabicText(text) && fontLoaded) {
        doc.setFont('NotoNaskhArabic', fontStyle);
      } else {
        doc.setFont('helvetica', fontStyle);
      }
    };

    const drawText = (text, x, y, options = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        color = colors.darkText,
        align = 'left',
        maxWidth = null
      } = options;

      const safeText = text === null || text === undefined ? 'N/A' : String(text);
      doc.setFontSize(fontSize);
      applyFont(safeText, fontStyle);
      doc.setTextColor(color);

      if (maxWidth) {
        const lines = doc.splitTextToSize(safeText, maxWidth);
        if (hasArabicText(safeText) && align === 'left') {
          lines.forEach((line, idx) => {
            doc.text(line, x + maxWidth, y + (idx * (fontSize * 0.46)), { align: 'right' });
          });
        } else {
          doc.text(lines, x, y, { align });
        }
        return lines.length * (fontSize * 0.46);
      }

      if (hasArabicText(safeText) && align === 'left') {
        doc.text(safeText, x, y, { align: 'right' });
      } else {
        doc.text(safeText, x, y, { align });
      }
      return fontSize * 0.46;
    };

    const ensureSpace = (spaceNeeded = 20) => {
      if (yPosition + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    const formatDateTime = (value) => {
      if (!value) return 'N/A';
      try {
        return new Date(value).toLocaleString();
      } catch (error) {
        return String(value);
      }
    };

    const formatDuration = (secondsValue) => {
      const seconds = Number(secondsValue || 0);
      if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
      const timeInHours = seconds / 3600;
      const totalMinutes = Math.round(timeInHours * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    const responseToDisplay = async (response) => {
      if (response === null || response === undefined || response === '') {
        return { text: 'No response', image: null };
      }

      if (Array.isArray(response)) {
        return { text: response.join(', '), image: null };
      }

      const value = String(response);
      if (value.startsWith('data:image/')) {
        return { text: 'Image', image: value };
      }
      if (value.startsWith('http://') || value.startsWith('https://')) {
        const fetched = await fetchImage(value);
        return fetched ? { text: 'Image', image: fetched } : { text: value, image: null };
      }
      if (value.startsWith('data:')) {
        return { text: 'File uploaded', image: null };
      }
      if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
        return { text: 'File uploaded', image: null };
      }
      return { text: value, image: null };
    };

    const templateName = processedTaskData?.inspectionLevel?.name || processedTaskData?.inspectionLevel?.title || 'N/A';
    const assetName =
      (typeof processedTaskData?.asset === 'string' && processedTaskData.asset) ||
      processedTaskData?.asset?.name ||
      processedTaskData?.asset?.title ||
      processedTaskData?.asset?.assetName ||
      processedTaskData?.asset?.code ||
      'N/A';
    const inspector = Array.isArray(processedTaskData?.assignedTo) && processedTaskData.assignedTo.length > 0
      ? (processedTaskData.assignedTo[0]?.name || processedTaskData.assignedTo[0]?.username || 'N/A')
      : 'N/A';
    const department = Array.isArray(processedTaskData?.assignedTo) && processedTaskData.assignedTo.length > 0
      ? (processedTaskData.assignedTo[0]?.department || 'N/A')
      : 'N/A';

    const durationText = formatDuration(processedTaskData?.taskMetrics?.timeSpent);
    const scoreText = `${processedTaskData?.scores?.totalAchieved || 0}/${processedTaskData?.scores?.totalMax || 0}`;
    const scorePercent = `${processedTaskData?.scores?.percentage || 0}%`;

    // Header logos and title block
    const logoSizeW = 26;
    const logoSizeH = 16;
    const logoY = yPosition;
    const leftLogoData = await toDataUrl(`${window.location.origin}/logo.png`);
    const rightLogoData = await toDataUrl(`${window.location.origin}/logo.png`);

    if (leftLogoData) {
      doc.addImage(leftLogoData, 'PNG', margin, logoY, logoSizeW, logoSizeH);
    } else {
      doc.setDrawColor(colors.border);
      doc.rect(margin, logoY, logoSizeW, logoSizeH);
      drawText('LOGO', margin + logoSizeW / 2, logoY + 9, { align: 'center', fontSize: 8, color: colors.muted });
    }

    if (rightLogoData) {
      doc.addImage(rightLogoData, 'PNG', pageWidth - margin - logoSizeW, logoY, logoSizeW, logoSizeH);
    } else {
      doc.setDrawColor(colors.border);
      doc.rect(pageWidth - margin - logoSizeW, logoY, logoSizeW, logoSizeH);
      drawText('LOGO', pageWidth - margin - (logoSizeW / 2), logoY + 9, { align: 'center', fontSize: 8, color: colors.muted });
    }

    doc.setDrawColor('#9ca3af');
    doc.rect((pageWidth / 2) - 14, logoY - 1, 28, 18);
    drawText('Template Header', pageWidth / 2, logoY + 8, { align: 'center', fontSize: 6, color: colors.danger });

    yPosition += 22;
    drawText('Inspection Report', pageWidth / 2, yPosition, { align: 'center', fontSize: 13, fontStyle: 'bold', color: colors.darkText });
    yPosition += 8;

    // Highlight pills (template and asset)
    const chipHeight = 7;
    const chipPadding = 1.5;
    const drawChip = (label, value, y) => {
      const chipText = `[${label}] ${value || 'N/A'}`;
      const chipWidth = Math.min(contentWidth * 0.65, doc.getTextWidth(chipText) + 8);
      doc.setFillColor(colors.yellow);
      doc.roundedRect(margin, y - 5, chipWidth, chipHeight, 1.5, 1.5, 'F');
      drawText(chipText, margin + chipPadding, y - 0.8, { fontSize: 9, fontStyle: 'bold', color: colors.darkText });
    };

    drawChip('Template Name', templateName, yPosition);
    yPosition += 8;
    yPosition += 2;

    // Inspection details
    drawText('Inspection Details', margin, yPosition, { fontSize: 12, fontStyle: 'bold', color: colors.darkText });
    yPosition += 5;

    const inspectionRows = [
      ['Inspection Title', processedTaskData?.title || 'N/A'],
      ['Location', processedTaskData?.location || 'N/A'],
      ['Description', processedTaskData?.description || 'N/A'],
      ['Time Spent', durationText],
      ['Created at', formatDateTime(processedTaskData?.createdAt)],
      ['Closed at', formatDateTime(processedTaskData?.signedAt || processedTaskData?.updatedAt)],
      ['Inspector', inspector]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Property', 'Value']],
      body: inspectionRows,
      theme: 'grid',
      headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold' },
      bodyStyles: { textColor: colors.darkText, fontSize: 9 },
      styles: { lineColor: colors.border, lineWidth: 0.2, cellPadding: 2.2 },
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: contentWidth - 38 } },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.cell.raw && containsArabic(String(data.cell.raw)) && fontLoaded) {
          data.cell.styles.font = 'NotoNaskhArabic';
          data.cell.styles.halign = 'right';
        }
      }
    });

    yPosition = (doc.lastAutoTable?.finalY || yPosition) + 7;
    ensureSpace(48);

    // KPI cards block
    const statsBlockY = yPosition;
    const leftCardW = 90;
    const rightCardW = 34;
    const rightGap = 6;
    const rightX = margin + leftCardW + rightGap;

    doc.setFillColor(colors.cardGray);
    doc.roundedRect(margin, statsBlockY, leftCardW, 46, 3, 3, 'F');
    drawText('Score', margin + (leftCardW / 2), statsBlockY + 10, { align: 'center', fontSize: 10, fontStyle: 'bold' });
    doc.setFillColor(colors.yellow);
    doc.roundedRect(margin + 52, statsBlockY + 3, 20, 10, 2.5, 2.5, 'F');
    drawText(scorePercent, margin + 62, statsBlockY + 10, { align: 'center', fontSize: 13, fontStyle: 'bold', color: colors.darkText });
    drawText(`Points scored: ${scoreText}`, margin + 62, statsBlockY + 16, { align: 'center', fontSize: 7, fontStyle: 'bold', color: colors.yellowDeep });

    drawText(`Task Status: ${(processedTaskData?.status || 'N/A').toUpperCase()}`, margin + 4, statsBlockY + 24, { fontSize: 8, color: colors.muted });
    drawText(`Completion: ${(processedTaskData?.overallProgress || 0)}%`, margin + 4, statsBlockY + 29, { fontSize: 8, color: colors.muted });
    drawText(`Answered Questions: ${Object.keys(processedTaskData?.questionnaireResponses || {}).length}`, margin + 4, statsBlockY + 34, { fontSize: 8, color: colors.muted });
    drawText(`Template: ${templateName}`, margin + 4, statsBlockY + 39, { fontSize: 8, color: colors.muted, maxWidth: leftCardW - 8 });

    const drawRightStat = (top, title, value, suffix = '') => {
      doc.setFillColor(colors.cardGray);
      doc.roundedRect(rightX, top, rightCardW, 21, 3, 3, 'F');
      drawText(title, rightX + (rightCardW / 2), top + 7, { align: 'center', fontSize: 8.5, fontStyle: 'bold' });
      doc.setFillColor(colors.yellow);
      doc.roundedRect(rightX + 8, top + 9, 18, 8, 2, 2, 'F');
      drawText(String(value), rightX + (rightCardW / 2), top + 14.5, { align: 'center', fontSize: 12, fontStyle: 'bold' });
      if (suffix) {
        drawText(suffix, rightX + (rightCardW / 2), top + 19, { align: 'center', fontSize: 7, color: colors.muted });
      }
    };

    drawRightStat(statsBlockY, 'Duration', durationText, 'Hours');
    yPosition += 53;

    // Pre-inspection table
    const preInspectionQuestions = processedTaskData?.preInspectionQuestions || [];
    if (preInspectionQuestions.length > 0) {
      ensureSpace(35);
      drawText('Pre-inspection questionnaire', margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
      yPosition += 4;

      const preImageMap = new Map();
      const preRows = await Promise.all(
        preInspectionQuestions.map(async (question, index) => {
          const questionId = question?._id?.toString() || question?.id?.toString();
          const response = pickResponse(questionId);
          const display = await responseToDisplay(response);

          if (display.image) preImageMap.set(index, display.image);

          return [
            String(index + 1),
            question?.text || question?.question || 'N/A',
            display.text
          ];
        })
      );

      doc.autoTable({
        startY: yPosition,
        head: [['SN', 'Question', 'Answer']],
        body: preRows,
        theme: 'grid',
        headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, cellPadding: 2, textColor: colors.darkText },
        styles: { lineColor: colors.border, lineWidth: 0.2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 94 },
          2: { cellWidth: contentWidth - 104 }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.cell.raw && containsArabic(String(data.cell.raw)) && fontLoaded) {
            data.cell.styles.font = 'NotoNaskhArabic';
            data.cell.styles.halign = 'right';
          }
        },
        didDrawCell: (data) => {
          if (data.column.index === 2 && preImageMap.has(data.row.index)) {
            try {
              const img = preImageMap.get(data.row.index);
              const w = 16;
              const h = 10;
              const x = data.cell.x + data.cell.width - w - 1.5;
              const y = data.cell.y + 1.5;
              doc.addImage(img, 'PNG', x, y, w, h);
            } catch (error) {
              // keep text fallback
            }
          }
        }
      });

      yPosition = (doc.lastAutoTable?.finalY || yPosition) + 8;
    }

    yPosition += 2;

    // Keep existing data output: inspection questionnaire rows by category with scores
    const categories = {};
    (processedTaskData?.questions || []).forEach((question) => {
      if (!question) return;
      const category = question.category || 'General';
      if (!categories[category]) categories[category] = [];

      const questionId = question._id?.toString() || question.id?.toString();
      const response = pickResponse(questionId);

      const questionType = question.type || question.answerType;
      const scorableTypes = ['yesno', 'compliance'];
      const isRecommended = question.requirementType === 'recommended' || question.mandatory === false || question.required === false;
      const isScorable = scorableTypes.includes(questionType) && !isRecommended;

      const weight = question.weight || 1;
      const maxScore = isScorable ? (question.scoring?.max || 2) : 0;
      const maxPoints = maxScore * weight;

      let earned = 0;
      let isNA = false;
      if (isScorable && response !== null && response !== undefined) {
        if (['not_applicable', 'na', 'N/A', 'Not applicable'].includes(String(response))) {
          isNA = true;
        } else if (question.scores && typeof question.scores === 'object') {
          earned = (question.scores[response] || question.scores[String(response)] || 0) * weight;
        } else if (['full_compliance', 'yes', 'Yes', 'Full Compliance', 'Full compliance'].includes(String(response))) {
          earned = maxPoints;
        } else if (['partial_compliance', 'Partial Compliance', 'Partial compliance'].includes(String(response))) {
          earned = maxPoints / 2;
        }
      }

      categories[category].push({
        text: question.text || question.question || 'N/A',
        response,
        score: isNA ? 'N/A' : (isScorable && maxPoints > 0 ? `${earned}/${maxPoints}` : 'N/A')
      });
    });

    for (const [category, questions] of Object.entries(categories)) {
      ensureSpace(26);
      drawText(category, margin, yPosition, { fontSize: 12, fontStyle: 'bold', color: colors.navy });
      yPosition += 3;

      const questionImageMap = new Map();
      const rows = await Promise.all(
        questions.map(async (q, index) => {
          const display = await responseToDisplay(q.response);
          if (display.image) questionImageMap.set(index, display.image);
          return [q.text, display.text, q.score];
        })
      );
      doc.autoTable({
        startY: yPosition,
        head: [['Question', 'Response', 'Score']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: colors.navy, textColor: '#ffffff', fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.2, cellPadding: 2, textColor: colors.darkText },
        styles: { lineColor: colors.border, lineWidth: 0.2 },
        columnStyles: { 0: { cellWidth: 95 }, 1: { cellWidth: 64 }, 2: { cellWidth: contentWidth - 159 } },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.cell.raw && containsArabic(String(data.cell.raw)) && fontLoaded) {
            data.cell.styles.font = 'NotoNaskhArabic';
            data.cell.styles.halign = 'right';
          }
        },
        didDrawCell: (data) => {
          if (data.column.index === 1 && questionImageMap.has(data.row.index)) {
            try {
              const img = questionImageMap.get(data.row.index);
              const w = 16;
              const h = 10;
              const x = data.cell.x + data.cell.width - w - 1.5;
              const y = data.cell.y + 1.5;
              doc.addImage(img, 'PNG', x, y, w, h);
            } catch (error) {
              // keep text fallback
            }
          }
        }
      });
      yPosition = (doc.lastAutoTable?.finalY || yPosition) + 6;
    }

    // Signature
    if (processedTaskData?.signature || processedTaskData?.signedBy) {
      ensureSpace(46);
      drawText('Signature', margin, yPosition, { fontSize: 12, fontStyle: 'bold', color: colors.navy });
      yPosition += 4;

      if (processedTaskData.signature) {
        let signatureImage = processedTaskData.signature;
        if (typeof signatureImage === 'string' && signatureImage.startsWith('http')) {
          const fetchedSignature = await fetchImage(signatureImage);
          if (fetchedSignature) signatureImage = fetchedSignature;
        }
        if (typeof signatureImage === 'string' && signatureImage.startsWith('data:image/')) {
          doc.addImage(signatureImage, 'PNG', margin, yPosition, 62, 24);
        }
      }

      drawText('Status: Digitally Signed', margin, yPosition + 30, {
        fontSize: 10,
        fontStyle: 'bold',
        color: colors.success
      });
      drawText(`Signed at: ${formatDateTime(processedTaskData?.signedAt)}`, margin, yPosition + 35, {
        fontSize: 9,
        color: colors.darkText
      });
      yPosition += 40;
    }

    // Footer
    const footerY = pageHeight - 8;
    drawText(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, {
      align: 'center',
      fontSize: 7.5,
      color: colors.muted
    });

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadTaskPDF = async (taskData, filename = 'inspection_report') => {
  const doc = await generateTaskPDF(taskData);
  doc.save(`${filename}.pdf`);
};
