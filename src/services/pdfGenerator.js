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
    const doc = new jsPDF();

    // Add Arabic font usingCallAddFont
    // We'll load the font from a CDN and add it to jsPDF
    const loadArabicFont = async () => {
      try {
        // Fetch the Amiri font from CDN
        const response = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf');
        const fontArrayBuffer = await response.arrayBuffer();
        const fontBase64 = btoa(
          new Uint8Array(fontArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        // Add the font to jsPDF
        doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', fontBase64);
        doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');

        return true;
      } catch (error) {
        console.warn('Could not load Arabic font, Arabic text may not display correctly:', error);
        return false;
      }
    };

    // Load the font
    const fontLoaded = await loadArabicFont();

    // Colors
    const colors = {
      primary: '#1A237E',
      secondary: '#3949ab',
      text: '#000000',
      lightText: '#666666',
      green: '#4caf50',
      amber: '#ffc107',
      red: '#f44336',
      gray: '#9e9e9e'
    };

    // Process task data
    const processedTaskData = processTaskDataForPDF(taskData);

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to add text with proper positioning and Arabic support
    const addText = (text, x, y, options = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        color = colors.text,
        align = 'left',
        maxWidth = contentWidth
      } = options;

      doc.setFontSize(fontSize);

      // Check if text contains Arabic
      const hasArabic = containsArabic(text);

      if (hasArabic && fontLoaded) {
        doc.setFont('NotoNaskhArabic', fontStyle);
      } else {
        doc.setFont('helvetica', fontStyle);
      }

      doc.setTextColor(color);

      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);

        // For Arabic text, align to the right
        if (hasArabic && align === 'left') {
          lines.forEach((line, index) => {
            doc.text(line, pageWidth - margin, y + (index * fontSize * 0.4), { align: 'right' });
          });
        } else {
          doc.text(lines, x, y, { align });
        }

        return lines.length * (fontSize * 0.4);
      } else {
        if (hasArabic && align === 'left') {
          doc.text(text, pageWidth - margin, y, { align: 'right' });
        } else {
          doc.text(text, x, y, { align });
        }
        return fontSize * 0.4;
      }
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight = 20) => {
      if (yPosition + requiredHeight > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Title
    addText('INSPECTION REPORT', pageWidth / 2, yPosition, {
      fontSize: 20,
      fontStyle: 'bold',
      color: colors.primary,
      align: 'center'
    });
    yPosition += 15;

    // Task Information
    addText('Task Information', margin, yPosition, {
      fontSize: 16,
      fontStyle: 'bold',
      color: colors.primary
    });
    yPosition += 10;

    // Task details table
    const taskDetails = [
      ['Task Title:', processedTaskData.title || 'N/A'],
      ['Status:', processedTaskData.status || 'N/A'],
      ['Location:', processedTaskData.location || 'N/A'],
      ['Description:', processedTaskData.description || 'N/A'],
      ['Created At:', processedTaskData.createdAt ? new Date(processedTaskData.createdAt).toLocaleString() : 'N/A'],
      ['Updated At:', processedTaskData.updatedAt ? new Date(processedTaskData.updatedAt).toLocaleString() : 'N/A']
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Property', 'Value']],
      body: taskDetails,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: '#FFFFFF',
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: colors.text
      },
      styles: {
        font: 'helvetica', // Default to Helvetica
        fontStyle: 'normal'
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        yPosition = data.cursor.y + 10;
      },
      didParseCell: function (data) {
        // If cell contains Arabic, switch to Arabic font and align right
        if (data.cell.raw && containsArabic(String(data.cell.raw))) {
          if (fontLoaded) {
            data.cell.styles.font = 'NotoNaskhArabic';
          }
          data.cell.styles.halign = 'right';
        }
      }
    });

    yPosition += 20;

    // Pre-Inspection Questionnaire
    if (processedTaskData.preInspectionQuestions && processedTaskData.preInspectionQuestions.length > 0) {
      checkNewPage(50);

      addText('Pre-Inspection Questionnaire', margin, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
      });
      yPosition += 15;

      processedTaskData.preInspectionQuestions.forEach((question, index) => {
        checkNewPage(30);

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

        const questionText = question.text || question.question || 'No question text available';
        addText(`Q${index + 1}. ${questionText}`, margin, yPosition, {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.text
        });
        yPosition += 8;

        let responseText = '';
        if (response !== null && response !== undefined) {
          if (Array.isArray(response)) {
            responseText = response.join(', ');
          } else {
            const responseStr = String(response);

            if (responseStr.startsWith('data:image/')) {
              responseText = 'Image uploaded';
            } else if (responseStr.startsWith('data:')) {
              responseText = 'File uploaded';
            } else if (responseStr.length > 100 && /^[A-Za-z0-9+/=]+$/.test(responseStr)) {
              responseText = 'File uploaded';
            } else {
              responseText = responseStr;
            }
          }
        } else {
          responseText = 'No response';
        }

        addText(`Response: ${responseText}`, margin + 15, yPosition, {
          fontSize: 10,
          fontStyle: 'normal',
          color: colors.text
        });
        yPosition += 15;
      });

      yPosition += 10;
    }

    // Overall Score
    if (processedTaskData.scores) {
      checkNewPage(30);

      addText('Overall Score', margin, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
      });
      yPosition += 10;

      const scoreText = `${processedTaskData.scores.totalAchieved || 0}/${processedTaskData.scores.totalMax || 0} (${processedTaskData.scores.percentage || 0}%)`;
      addText(`Total Score: ${scoreText}`, margin, yPosition, {
        fontSize: 14,
        fontStyle: 'bold',
        color: colors.text
      });
      yPosition += 20;
    }

    // Questionnaire Results
    if (processedTaskData.questions && processedTaskData.questions.length > 0) {
      checkNewPage(50);

      addText('Questionnaire Results', margin, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
      });
      yPosition += 15;

      // Group questions by category
      const categories = {};

      processedTaskData.questions.forEach((question) => {
        if (!question) return;

        const category = question.category || 'General';

        if (!categories[category]) {
          categories[category] = [];
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

        const commentKey = `c-${questionId}`;
        const comment = taskData.questionnaireResponses ? taskData.questionnaireResponses[commentKey] || '' : '';

        const questionType = question.type || question.answerType;
        const scorableTypes = ['yesno', 'compliance'];
        const isRecommended = question.requirementType === 'recommended' || question.mandatory === false || question.required === false;
        const isScorable = scorableTypes.includes(questionType) && !isRecommended;

        const weight = question.weight || 1;
        const maxScore = isScorable ? (question.scoring?.max || 2) : 0;
        const maxPointsForQuestion = maxScore * weight;

        let earnedPointsForQuestion = 0;
        let isNA = false;

        if (isScorable && response !== null && response !== undefined) {
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

        categories[category].push({
          id: questionId,
          text: question.text || question.question || 'No question text available',
          response,
          comment,
          earned: earnedPointsForQuestion,
          max: maxPointsForQuestion,
          isNA,
          isScorable
        });
      });

      // Add questions to PDF
      Object.entries(categories).forEach(([category, questions]) => {
        checkNewPage(50);

        addText(category, margin, yPosition, {
          fontSize: 14,
          fontStyle: 'bold',
          color: colors.secondary
        });
        yPosition += 10;

        const tableData = questions.map(question => {
          let responseText = '';
          if (question.response !== null && question.response !== undefined) {
            if (Array.isArray(question.response)) {
              responseText = question.response.join(', ');
            } else {
              const responseStr = String(question.response);

              if (responseStr.startsWith('data:image/')) {
                responseText = 'Image uploaded';
              } else if (responseStr.startsWith('data:')) {
                responseText = 'File uploaded';
              } else if (responseStr.length > 100 && /^[A-Za-z0-9+/=]+$/.test(responseStr)) {
                responseText = 'File uploaded';
              } else {
                responseText = responseStr;
              }
            }
          } else {
            responseText = 'No response';
          }

          const scoreText = question.isNA ? 'N/A' :
            (question.isScorable && question.max > 0) ? `${question.earned}/${question.max}` :
              'N/A';

          return [
            question.text,
            responseText,
            scoreText
          ];
        });

        doc.autoTable({
          startY: yPosition,
          head: [['Question', 'Response', 'Score']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: colors.primary,
            textColor: '#FFFFFF',
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: colors.text,
            fontSize: 9
          },
          styles: {
            font: 'helvetica', // Default to Helvetica
            fontStyle: 'normal'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20 }
          },
          margin: { left: margin, right: margin },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
          didParseCell: function (data) {
            // If cell contains Arabic, switch to Arabic font and align right
            if (data.cell.raw && containsArabic(String(data.cell.raw))) {
              if (fontLoaded) {
                data.cell.styles.font = 'NotoNaskhArabic';
              }
              data.cell.styles.halign = 'right';
            }
          }
        });
        yPosition += 20;
      });
    }

    // Helper to fetch image and convert to base64
    const fetchImage = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('Error fetching image:', error);
        return null;
      }
    };

    // Signature section
    if (processedTaskData.signature || processedTaskData.signedBy) {
      checkNewPage(60); // Ensure enough space for signature

      addText('Signature', margin, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
      });
      yPosition += 10;

      // Render signature image if available
      if (processedTaskData.signature) {
        try {
          const signatureImg = processedTaskData.signature;
          let imgData = signatureImg;

          // If it's a URL, fetch it first
          if (signatureImg.startsWith('http')) {
            const fetchedData = await fetchImage(signatureImg);
            if (fetchedData) {
              imgData = fetchedData;
            }
          }

          // Add image if we have valid data URI
          if (imgData && imgData.startsWith('data:image')) {
            doc.addImage(imgData, 'PNG', margin, yPosition, 60, 30);
            yPosition += 35;
          }
        } catch (e) {
          console.warn('Error adding signature image:', e);
        }
      }

      addText('Status: Digitally Signed', margin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.green
      });
      yPosition += 8;

      if (processedTaskData.signedAt) {
        addText(`Signed at: ${new Date(processedTaskData.signedAt).toLocaleString()}`, margin, yPosition, {
          fontSize: 10,
          fontStyle: 'normal',
          color: colors.text
        });
      }
    }

    // Footer
    yPosition = doc.internal.pageSize.height - 20;
    addText(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, {
      fontSize: 8,
      fontStyle: 'normal',
      color: colors.lightText,
      align: 'center'
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