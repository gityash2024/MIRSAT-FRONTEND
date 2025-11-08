import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable
const { jsPDF: jsPDFCore } = jsPDF;

// Process task data to match backend structure
function processTaskDataForPDF(taskData) {
  if (!taskData) return taskData;
  
  // Debug logging
  console.log('Raw task data received:', taskData);
  console.log('Inspection level:', taskData.inspectionLevel);
  console.log('Questionnaire responses:', taskData.questionnaireResponses);

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
    return true; // If no inspection level, include all questions
  });

  // Calculate scores
  let scores = { totalAchieved: 0, totalMax: 0, percentage: 0 };
  
  if (filteredQuestions.length > 0) {
    let totalAchieved = 0;
    let totalMax = 0;

    filteredQuestions.forEach((question) => {
      // CRITICAL FIX: Exclude recommended questions from scoring
      if (question.requirementType === 'recommended' || question.mandatory === false || question.required === false) {
        return; // Skip recommended/non-mandatory questions
      }
      
      // CRITICAL FIX: Only score Yes/No and Compliance question types
      const questionType = question.type || question.answerType;
      const scorableTypes = ['yesno', 'compliance'];
      if (!scorableTypes.includes(questionType)) {
        return; // Skip text, signature, date, number, file, and other non-scorable types
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

      // Calculate scores - only for scorable questions
      const weight = question.weight || 1;
      const maxScore = question.scoring?.max || 2;
      const maxPointsForQuestion = maxScore * weight;
      
      let earnedPointsForQuestion = 0;
      let isNA = false;
      
      if (response !== null && response !== undefined) {
        if (response === 'not_applicable' || response === 'na' || response === 'N/A' || response === 'Not applicable') {
          isNA = true;
        } else {
          // Use template-defined scores if available
          if (question.scores && typeof question.scores === 'object') {
            const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
            earnedPointsForQuestion = responseScore * weight;
          } else {
            // Fallback to old logic if no template scores defined
            // Only process compliance and yesno types (already filtered above)
            if (questionType === 'compliance' || questionType === 'yesno') {
              if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || 
                  response === 'Full Compliance' || response === 'Full compliance') {
                earnedPointsForQuestion = maxPointsForQuestion;
              } else if (response === 'partial_compliance' || response === 'Partial Compliance' || 
                        response === 'Partial compliance') {
                earnedPointsForQuestion = maxPointsForQuestion / 2;
              }
            }
            // REMOVED: All other question types (text, signature, date, number, file, checkbox, multiple)
            // These should NEVER be scored
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
  
  // Debug logging
  console.log('Processed task data:', processedData);
  console.log('Questions found:', filteredQuestions.length);
  console.log('Pre-inspection questions found:', preInspectionQuestions.length);
  console.log('Scores calculated:', scores);
  console.log('Task title:', processedData.title);
  console.log('Task status:', processedData.status);
  console.log('Task location:', processedData.location);
  
  return processedData;
}

export const generateTaskPDF = (taskData) => {
  try {
    const doc = new jsPDF();
    
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

    // Process task data to match backend structure
    console.log('About to process task data:', taskData);
    const processedTaskData = processTaskDataForPDF(taskData);
    console.log('Processed task data successfully:', processedTaskData);

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text with proper positioning
  const addText = (text, x, y, options = {}) => {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      color = colors.text,
      align = 'left',
      maxWidth = contentWidth
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color);
    
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (fontSize * 0.4); // Return height used
    } else {
      doc.text(text, x, y);
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
  addText('INSPECTION REPORT', margin, yPosition, {
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
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      yPosition = data.cursor.y + 10;
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

      // Question text
      const questionText = question.text || question.question || 'No question text available';
      addText(`Q${index + 1}. ${questionText}`, margin, yPosition, {
        fontSize: 11,
        fontStyle: 'bold',
        color: colors.text
      });
      yPosition += 8;

      // Response
      let responseText = '';
      if (response !== null && response !== undefined) {
        if (Array.isArray(response)) {
          responseText = response.join(', ');
        } else {
          const responseStr = String(response);
          
            // Check if it's a base64 image/file
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
      
      // CRITICAL FIX: Determine if question is scorable
      const questionType = question.type || question.answerType;
      const scorableTypes = ['yesno', 'compliance'];
      const isRecommended = question.requirementType === 'recommended' || question.mandatory === false || question.required === false;
      const isScorable = scorableTypes.includes(questionType) && !isRecommended;
      
      // Calculate scores - only for scorable questions
      const weight = question.weight || 1;
      const maxScore = isScorable ? (question.scoring?.max || 2) : 0;
      const maxPointsForQuestion = maxScore * weight;
      
      let earnedPointsForQuestion = 0;
      let isNA = false;
      
      // CRITICAL FIX: Only calculate score for scorable questions
      if (isScorable && response !== null && response !== undefined) {
        if (response === 'not_applicable' || response === 'na' || response === 'N/A' || response === 'Not applicable') {
          isNA = true;
        } else {
          // Use template-defined scores if available
          if (question.scores && typeof question.scores === 'object') {
            const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
            earnedPointsForQuestion = responseScore * weight;
          } else {
            // Fallback to old logic if no template scores defined
            // Only process compliance and yesno types (already filtered above)
            if (questionType === 'compliance' || questionType === 'yesno') {
              if (response === 'full_compliance' || response === 'yes' || response === 'Yes' || 
                  response === 'Full Compliance' || response === 'Full compliance') {
                earnedPointsForQuestion = maxPointsForQuestion;
              } else if (response === 'partial_compliance' || response === 'Partial Compliance' || 
                        response === 'Partial compliance') {
                earnedPointsForQuestion = maxPointsForQuestion / 2;
              }
            }
            // REMOVED: All other question types (text, signature, date, number, file, checkbox, multiple)
            // These should NEVER be scored
          }
        }
      }
      
      // Add all questions to categories (including non-scorable) but mark them appropriately
      categories[category].push({
        id: questionId,
        text: question.text || question.question || 'No question text available',
        response,
        comment,
        earned: earnedPointsForQuestion,
        max: maxPointsForQuestion, // Will be 0 for non-scorable questions
        isNA,
        isScorable // Add flag to identify scorable questions
      });
    });

    // Add questions to PDF
    Object.entries(categories).forEach(([category, questions]) => {
      checkNewPage(50);
      
      // Category header
      addText(category, margin, yPosition, {
        fontSize: 14,
        fontStyle: 'bold',
        color: colors.secondary
      });
      yPosition += 10;

      // Questions table
      const tableData = questions.map(question => {
        let responseText = '';
        if (question.response !== null && question.response !== undefined) {
          if (Array.isArray(question.response)) {
            responseText = question.response.join(', ');
          } else {
            const responseStr = String(question.response);
            
            // Check if it's a base64 image/file
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

        // Score - only show for scorable questions
        const scoreText = question.isNA ? 'N/A' : 
                         (question.isScorable && question.max > 0) ? `${question.earned}/${question.max}` : 
                         'N/A'; // Show N/A for non-scorable questions
        
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
        columnStyles: {
          0: { cellWidth: 80 }, // Question column
          1: { cellWidth: 60 }, // Response column
          2: { cellWidth: 20 }  // Score column
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          yPosition = data.cursor.y + 10;
        }
      });

      yPosition += 20;
    });
  }

  // Signature section
  if (processedTaskData.signature || processedTaskData.signedBy) {
    checkNewPage(30);
    
    addText('Signature', margin, yPosition, {
      fontSize: 16,
      fontStyle: 'bold',
      color: colors.primary
    });
    yPosition += 10;

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
  addText(`Generated on ${new Date().toLocaleString()}`, margin, yPosition, {
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

export const downloadTaskPDF = (taskData, filename = 'inspection_report') => {
  const doc = generateTaskPDF(taskData);
  doc.save(`${filename}.pdf`);
};
