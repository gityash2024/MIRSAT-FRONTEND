import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, XCircle, HelpCircle, AlertTriangle, Save, Loader,
  Award, AlertCircle, Info, Clipboard, BarChart2, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateTaskQuestionnaire } from '../../../store/slices/userTasksSlice';

const Container = styled.div`
  padding: 16px;
  height: 100%;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuestionsContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  height: 100%;
`;

const QuestionItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 232, 240, 0.8);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-right: ${props => props.mandatory ? '70px' : '0'};
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 14px;
    padding-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 6px;
  }
`;

const MandatoryBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.mandatory === false ? '#e0e0e0' : '#e3f2fd'};
  color: ${props => props.mandatory === false ? '#757575' : '#0277bd'};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 12px;
  }

  button {
    @media (max-width: 480px) {
      flex: 1 1 calc(50% - 4px);
      max-width: calc(50% - 4px);
      min-width: 0;
    }
  }
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: ${props => props.selected ? 
    'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
  color: ${props => props.selected ? '#2e7d32' : '#333'};
  box-shadow: ${props => props.selected ? 
    '0 2px 8px rgba(76, 175, 80, 0.15)' : 
    '0 1px 3px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    background: ${props => props.selected ? 
      'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 
      'linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%)'};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ComplianceButton = styled(OptionButton)`
  background: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
        case 'partial_compliance': return 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)';
        case 'non_compliance': return 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
        case 'not_applicable': return 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
        default: return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
      }
    }
    return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }};
  
  color: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return '#2e7d32';
        case 'partial_compliance': return '#e65100';
        case 'non_compliance': return '#c62828';
        case 'not_applicable': return '#616161';
        default: return '#333';
      }
    }
    return '#333';
  }};
  
  border: 1px solid ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return 'rgba(76, 175, 80, 0.3)';
        case 'partial_compliance': return 'rgba(255, 152, 0, 0.3)';
        case 'non_compliance': return 'rgba(244, 67, 54, 0.3)';
        case 'not_applicable': return 'rgba(97, 97, 97, 0.3)';
        default: return 'rgba(0, 0, 0, 0.1)';
      }
    }
    return 'rgba(0, 0, 0, 0.1)';
  }};
  
  box-shadow: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return '0 2px 8px rgba(76, 175, 80, 0.15)';
        case 'partial_compliance': return '0 2px 8px rgba(255, 152, 0, 0.15)';
        case 'non_compliance': return '0 2px 8px rgba(244, 67, 54, 0.15)';
        case 'not_applicable': return '0 2px 8px rgba(97, 97, 97, 0.15)';
        default: return '0 1px 3px rgba(0, 0, 0, 0.05)';
      }
    }
    return '0 1px 3px rgba(0, 0, 0, 0.05)';
  }};
`;

const CommentBox = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.7);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
  }
`;

const NoQuestionsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #64748b;
  }
  
  svg {
    margin-bottom: 16px;
    color: #3f51b5;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--color-navy) 0%, #3f51b5 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(26, 35, 126, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const ValidationMessage = styled.div`
  margin-top: 24px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${props => props.complete ? 'rgba(232, 245, 233, 0.8)' : 'rgba(255, 243, 224, 0.8)'};
  color: ${props => props.complete ? '#2e7d32' : '#e65100'};
  border: 1px solid ${props => props.complete ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
  
  p {
    font-size: 14px;
    margin: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 24px 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoringSummary = styled.div`
  background: rgba(237, 246, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(191, 220, 255, 0.5);
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const ScoreItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  .score-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
  }
  
  .score-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
  }
  
  .score-percent {
    font-size: 13px;
    color: ${props => props.percent >= 80 ? '#4caf50' : props.percent >= 50 ? '#ff9800' : '#f44336'};
    margin-left: 4px;
  }
`;

const ScoringCriteria = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  
  .criteria-item {
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &.full {
      color: #2e7d32;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }
    
    &.partial {
      color: #e65100;
      border: 1px solid rgba(255, 152, 0, 0.2);
    }
    
    &.non {
      color: #c62828;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }
    
    &.na {
      color: #616161;
      border: 1px solid rgba(97, 97, 97, 0.2);
    }
  }
`;

const CategoryBadge = styled.div`
  display: inline-block;
  background: rgba(25, 118, 210, 0.08);
  color: #1976d2;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const getQuestionNumber = (question, allQuestions, index) => {
  // If question has levelId, try to calculate proper numbering
  if (question.levelId) {
    // First, try to use hierarchyPath if available
    if (question.hierarchyPath) {
      const parts = question.hierarchyPath.split('.');
      // Find all questions with the same levelId to determine this question's position
      const positionInLevel = allQuestions
        .filter(q => q.levelId === question.levelId)
        .findIndex(q => q._id === question._id) + 1;
      
      // Format the level path with proper numbering
      // If it starts with a letter, it's a top-level (A, B, C, etc.)
      const levelNumber = parts[0];
      let formattedPath = levelNumber;
      
      // Add sub-levels (1, 2, 3, etc.)
      for (let i = 1; i < parts.length; i++) {
        formattedPath += `.${parts[i]}`;
      }
      
      // Add the question number
      return `${formattedPath}.${positionInLevel}`;
    }
    
    // If no hierarchyPath but we have levelPath
    if (question.levelPath) {
      // Use the level path to generate numbering
      const levelIdentifier = question.levelPath.charAt(0); // Get the first character which should be A, B, C, etc.
      
      // Extract sub-levels from the path
      const subLevels = question.levelPath.substring(1).split('.').filter(Boolean);
      
      // Find all questions with the same levelId to determine this question's position
      const positionInLevel = allQuestions
        .filter(q => q.levelId === question.levelId)
        .findIndex(q => q._id === question._id) + 1;
      
      // Build the formatted path
      let formattedPath = levelIdentifier;
      
      // Add sub-levels if any
      if (subLevels.length > 0) {
        formattedPath += `.${subLevels.join('.')}`;
      }
      
      // Add the question number
      return `${formattedPath}.${positionInLevel}`;
    }
    
    // Fallback to simpler level-based numbering
    // Find all questions with the same levelId to determine this question's position
    const levelQuestions = allQuestions.filter(q => q.levelId === question.levelId);
    const positionInLevel = levelQuestions.findIndex(q => q._id === question._id) + 1;
    
    // Determine top-level indicator (A, B, C...)
    // This is a simple approximation - in a real implementation you'd want to map levelIds to their correct hierarchy
    const levelIndex = index % 26; // Cycle through alphabet
    const levelLetter = String.fromCharCode(65 + levelIndex);
    
    return `${levelLetter}.${positionInLevel}`;
  }
  
  // Fallback to simple indexing if no level information
  return `${index + 1}`;
};

const QuestionnaireStepForm = ({ task, onSave, filteredCategory, filteredQuestion }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Store questions separately from responses
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [comments, setComments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);
  const [globalNotes, setGlobalNotes] = useState('');
  const [scores, setScores] = useState({
    total: 0,
    achieved: 0,
    percentage: 0
  });
  
  // Load questions and existing responses
  useEffect(() => {
    if (task) {
      // Filter questions if needed
      let filteredQuestions = task.questions || [];
      
      // First set the original questions without trying to modify them
      setQuestions(filteredQuestions);
      
      // Extract responses into a separate state object
      const extractedResponses = {};
      const extractedComments = {};
      
      if (task.questionnaireResponses) {
        Object.entries(task.questionnaireResponses).forEach(([key, value]) => {
          // Handle different response key formats
          if (key.startsWith('q-')) {
            const questionId = key.substring(2);
            extractedResponses[questionId] = value;
          } else if (key.startsWith('c-')) {
            const questionId = key.substring(2);
            extractedComments[questionId] = value;
          } else if (key.includes('-')) {
            // Format may be "{subLevelId}-{questionId}"
            const parts = key.split('-');
            if (parts.length === 2) {
              const questionId = parts[1];
              extractedResponses[questionId] = value;
            }
          }
        });
      }
      
      setResponses(extractedResponses);
      setComments(extractedComments);
      setGlobalNotes(task.questionnaireNotes || '');
      
      // Calculate initial scores
      calculateScores(extractedResponses);
    }
  }, [task, filteredCategory, filteredQuestion]);
  
  // Validate whenever responses change
  useEffect(() => {
    validateResponses();
    calculateScores(responses);
  }, [responses, questions]);
  
  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleCommentChange = (questionId, comment) => {
    setComments(prev => ({
      ...prev,
      [questionId]: comment
    }));
  };
  
  const validateResponses = () => {
    // Check if all required questions are answered
    const requiredQuestions = questions.filter(q => q.required);
    const unanswered = requiredQuestions.filter(q => {
      const questionId = q._id || q.id;
      return !responses[questionId];
    });
    
    const valid = unanswered.length === 0;
    setAllAnswered(valid);
    
    return valid;
  };
  
  const calculateScores = (currentResponses) => {
    let totalPoints = 0;
    let achievedPoints = 0;
    
    // Filter only mandatory questions
    const mandatoryQuestions = questions.filter(q => q.mandatory !== false);
    
    mandatoryQuestions.forEach(question => {
      // CRITICAL FIX: Only score Yes/No and Compliance question types
      const questionType = question.type || question.answerType;
      const scorableTypes = ['yesno', 'compliance'];
      if (!scorableTypes.includes(questionType)) {
        return; // Skip text, signature, date, number, file, and other non-scorable types
      }
      
      const questionId = question._id || question.id;
      const response = currentResponses[questionId];
      const weight = question.weight || 1;
      
      // Add to total score potential (2 points per mandatory question)
      totalPoints += (2 * weight);
      
      if (response) {
        // Skip if response is "Not Applicable"
        if (response === 'na' || response === 'not_applicable' || response === 'Not applicable') {
          totalPoints -= (2 * weight); // Don't count NA questions
          return;
        }
        
        // Use template-defined scores if available
        if (question.scores && typeof question.scores === 'object') {
          // Get the score for this specific response from the template
          const responseScore = question.scores[response] || question.scores[response.toString()] || 0;
          achievedPoints += responseScore * weight;
        } else {
          // Fallback to old logic if no template scores defined
          if (response === 'full_compliance' || response === 'yes') {
            achievedPoints += (2 * weight); // Full compliance = 2 points
          } else if (response === 'partial_compliance') {
            achievedPoints += (1 * weight); // Partial compliance = 1 point
          }
        }
      }
    });
    
    const percentage = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;
    
    setScores({
      total: totalPoints,
      achieved: achievedPoints,
      percentage
    });
  };
  
  const handleSave = async () => {
    // if (!validateResponses()) {
    //   toast.error('Please answer all required questions');
    //   return;
    // }
    
    setIsSubmitting(true);
    
    try {
      // Format responses for the API
      const formattedResponses = {};
      
      // Add responses with appropriate keys
      Object.entries(responses).forEach(([questionId, value]) => {
        formattedResponses[`q-${questionId}`] = value;
      });
      
      // Add comments with appropriate keys
      Object.entries(comments).forEach(([questionId, value]) => {
        if (value) { // Only include non-empty comments
          formattedResponses[`c-${questionId}`] = value;
        }
      });
      
      const result = await dispatch(updateTaskQuestionnaire({
        taskId: task._id,
        questionnaire: {
          responses: formattedResponses,
          completed: true,
          notes: globalNotes
        }
      })).unwrap();
      
      // toast.success('Questionnaire saved successfully!');
      if (onSave) onSave(result);
    } catch (error) {
      toast.error(error.message || t('questionnaire.failedToSaveQuestionnaire'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Group questions by category for better organization
  const groupQuestionsByCategory = () => {
    const groups = {};
    
    questions.forEach(q => {
      const category = q.category || t('questionnaire.general');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(q);
    });
    
    return groups;
  };
  
  // Apply filtering based on props
  const getFilteredQuestions = () => {
    if (!questions) return [];
    
    let filtered = [...questions];
    
    // Filter by category if specified
    if (filteredCategory) {
      filtered = filtered.filter(q => (q.category || t('questionnaire.general')) === filteredCategory);
    }
    
    // Filter by specific question if specified
    if (filteredQuestion) {
      filtered = filtered.filter(q => 
        q._id === filteredQuestion._id || 
        q.id === filteredQuestion.id || 
        q.text === filteredQuestion.text
      );
    }
    
    return filtered;
  };
  
  const filteredQuestions = getFilteredQuestions();
  
  if (!questions || questions.length === 0) {
    return (
      <Container>
        <Title>
          <Clipboard size={20} />
          Inspection Questionnaire
        </Title>
        <NoQuestionsMessage>
          <HelpCircle size={48} />
          <h3>{t('questionnaire.noQuestionsAvailable')}</h3>
          <p>{t('questionnaire.noInspectionQuestionsForTask')}</p>
        </NoQuestionsMessage>
      </Container>
    );
  }
  
  if (filteredQuestions.length === 0) {
    return (
      <Container>
        <Title>
          <Clipboard size={20} />
          {filteredCategory ? `${filteredCategory} ${t('questionnaire.questions')}` : t('questionnaire.inspectionQuestionnaire')}
        </Title>
        <NoQuestionsMessage>
          <HelpCircle size={48} />
          <h3>{t('questionnaire.noQuestionsFound')}</h3>
          <p>{t('questionnaire.noQuestionsMatchFilters')}</p>
        </NoQuestionsMessage>
      </Container>
    );
  }
  
  const isQuestionnaireCompleted = task?.questionnaireCompleted;
  
  return (
    <Container>
      <Title>
        <Clipboard size={20} />
        {filteredCategory ? `${filteredCategory} ${t('questionnaire.questions')}` : t('questionnaire.inspectionQuestionnaire')}
      </Title>
      
      {/* If not filtering, show scoring summary */}
      {!filteredCategory && !filteredQuestion && (
        <ScoringSummary>
          <SectionTitle style={{ margin: '0 0 16px 0' }}>
            <BarChart2 size={18} />
            Compliance Scoring Summary
          </SectionTitle>
          
          <ScoreGrid>
            <ScoreItem percent={scores.percentage}>
              <div className="score-label">{t('questionnaire.overallCompliance')}</div>
              <div className="score-value">
                {scores.achieved} / {scores.total}
                <span className="score-percent">({scores.percentage}%)</span>
              </div>
            </ScoreItem>
            
            <ScoreItem>
              <div className="score-label">{t('questionnaire.questions')}</div>
              <div className="score-value">
                {questions.filter(q => q.mandatory !== false).length} Mandatory 
                {questions.filter(q => q.mandatory === false).length > 0 && (
                  <span className="score-percent">
                    (+{questions.filter(q => q.mandatory === false).length} Recommended)
                  </span>
                )}
              </div>
            </ScoreItem>
            
            <ScoreItem>
              <div className="score-label">{t('common.status')}</div>
              <div className="score-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isQuestionnaireCompleted ? (
                  <>
                    <CheckCircle size={16} color="#4caf50" />
                    <span>{t('questionnaire.completed')}</span>
                  </>
                ) : Object.keys(responses).length > 0 ? (
                  <>
                    <AlertCircle size={16} color="#ff9800" />
                    <span>{t('questionnaire.inProgress')}</span>
                  </>
                ) : (
                  <>
                    <Info size={16} color="#90a4ae" />
                    <span>{t('questionnaire.notStarted')}</span>
                  </>
                )}
              </div>
            </ScoreItem>
          </ScoreGrid>
          
          <ScoringCriteria>
            <div className="criteria-item full">
              <CheckCircle size={14} /> Full Compliance: 2 points
            </div>
            <div className="criteria-item partial">
              <AlertCircle size={14} /> Partial Compliance: 1 point
            </div>
            <div className="criteria-item non">
              <XCircle size={14} /> Non-Compliance: 0 points
            </div>
            <div className="criteria-item na">
              <HelpCircle size={14} /> Not Applicable: Excluded
            </div>
          </ScoringCriteria>
        </ScoringSummary>
      )}
      
      {/* Questions for selected category/filter */}
      <QuestionsContainer>
        {filteredQuestions.map((question, index) => {
          if (!question) return null;
          
          const questionId = question._id || question.id;
          const response = responses[questionId];
          const comment = comments[questionId];
          
          // Get question number based on hierarchy
          const questionNumber = getQuestionNumber(question, questions, index);
          
          return (
            <QuestionItem key={questionId || index}>
              <QuestionText mandatory={question.required !== false}>
                {questionNumber}. {question.text}
                {question.required !== false && <span style={{ color: 'red' }}> *</span>}
              </QuestionText>
              
              <MandatoryBadge mandatory={question.required !== false}>
                <Info size={12} />
                {question.required === false ? t('questionnaire.optional') : t('questionnaire.required')}
              </MandatoryBadge>
              
              {/* Yes/No Questions */}
              {(question.answerType === 'yes_no' || question.answerType === 'yesNo' || question.type === 'yes_no') && (
                <QuestionOptions>
                  <OptionButton 
                    selected={response === 'yes'}
                    onClick={() => handleResponse(questionId, 'yes')}
                    disabled={isQuestionnaireCompleted}
                  >
                    Yes
                  </OptionButton>
                  <OptionButton 
                    selected={response === 'no'}
                    onClick={() => handleResponse(questionId, 'no')}
                    disabled={isQuestionnaireCompleted}
                  >
                    No
                  </OptionButton>
                  <OptionButton 
                    selected={response === 'na'}
                    onClick={() => handleResponse(questionId, 'na')}
                    disabled={isQuestionnaireCompleted}
                  >
                    N/A
                  </OptionButton>
                </QuestionOptions>
              )}
              
              {/* Compliance Questions */}
              {(question.answerType === 'compliance' || question.type === 'compliance') && (
                <QuestionOptions>
                  <ComplianceButton 
                    selected={response === 'full_compliance'}
                    onClick={() => handleResponse(questionId, 'full_compliance')}
                    value="full_compliance"
                    disabled={isQuestionnaireCompleted}
                  >
                    Full Compliance
                  </ComplianceButton>
                  <ComplianceButton 
                    selected={response === 'partial_compliance'}
                    onClick={() => handleResponse(questionId, 'partial_compliance')}
                    value="partial_compliance"
                    disabled={isQuestionnaireCompleted}
                  >
                    Partial Compliance
                  </ComplianceButton>
                  <ComplianceButton 
                    selected={response === 'non_compliance'}
                    onClick={() => handleResponse(questionId, 'non_compliance')}
                    value="non_compliance"
                    disabled={isQuestionnaireCompleted}
                  >
                    Non-Compliance
                  </ComplianceButton>
                  <ComplianceButton 
                    selected={response === 'not_applicable'}
                    onClick={() => handleResponse(questionId, 'not_applicable')}
                    value="not_applicable"
                    disabled={isQuestionnaireCompleted}
                  >
                    Not Applicable
                  </ComplianceButton>
                </QuestionOptions>
              )}
              
              {/* Custom options */}
              {question.options && question.options.length > 0 && (
                <QuestionOptions>
                  {question.options.map((option, idx) => (
                    <OptionButton 
                      key={idx}
                      selected={response === option}
                      onClick={() => handleResponse(questionId, option)}
                      disabled={isQuestionnaireCompleted}
                    >
                      {option}
                    </OptionButton>
                  ))}
                </QuestionOptions>
              )}
              
              {/* Default to Yes/No if no type is provided */}
              {!question.answerType && !question.type && !question.options && (
                <QuestionOptions>
                  <OptionButton 
                    selected={response === 'yes'}
                    onClick={() => handleResponse(questionId, 'yes')}
                    disabled={isQuestionnaireCompleted}
                  >
                    Yes
                  </OptionButton>
                  <OptionButton 
                    selected={response === 'no'}
                    onClick={() => handleResponse(questionId, 'no')}
                    disabled={isQuestionnaireCompleted}
                  >
                    No
                  </OptionButton>
                  <OptionButton 
                    selected={response === 'na'}
                    onClick={() => handleResponse(questionId, 'na')}
                    disabled={isQuestionnaireCompleted}
                  >
                    N/A
                  </OptionButton>
                </QuestionOptions>
              )}
              
              <CommentBox 
                placeholder={t('questionnaire.addCommentOptional')}
                value={comment || ''}
                onChange={(e) => handleCommentChange(questionId, e.target.value)}
                disabled={isQuestionnaireCompleted}
              />
            </QuestionItem>
          );
        })}
      </QuestionsContainer>
      
      {/* Show global notes and buttons only when viewing all questions */}
      {!filteredCategory && !filteredQuestion && (
        <>
          <CommentBox 
            placeholder={t('questionnaire.addGeneralNotesOptional')}
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            disabled={isQuestionnaireCompleted}
            style={{ marginBottom: '24px' }}
          />
          
          <ValidationMessage complete={allAnswered}>
            {allAnswered ? (
              <>
                <CheckCircle size={20} />
                <p>{t('questionnaire.allRequiredQuestionsAnswered')}</p>
              </>
            ) : (
              <>
                <AlertTriangle size={20} />
                <p>{t('questionnaire.pleaseAnswerAllRequiredQuestions')}</p>
              </>
            )}
          </ValidationMessage>
        </>
      )}
      
      {!isQuestionnaireCompleted && (
        <ButtonContainer>
          <SaveButton 
            onClick={handleSave} 
            disabled={isSubmitting }
            // disabled={isSubmitting || !allAnswered}
          >
            {isSubmitting ? <Loader size={16} /> : <Save size={16} />}
            Save Questionnaire
          </SaveButton>
        </ButtonContainer>
      )}
    </Container>
  );
};

export default QuestionnaireStepForm;