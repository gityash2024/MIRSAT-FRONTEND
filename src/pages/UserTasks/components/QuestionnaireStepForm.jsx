import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { 
  CheckCircle, XCircle, HelpCircle, AlertTriangle, Save, Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateTaskQuestionnaire } from '../../../store/slices/userTasksSlice';

const Container = styled.div`
  padding: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 24px;
`;

const QuestionsContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
`;

const QuestionItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(230, 232, 240, 0.8);
  transition: all 0.3s ease;
  
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
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
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
        default: return '#333';
      }
    }
    return '#333';
  }};
  
  box-shadow: ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return '0 2px 8px rgba(76, 175, 80, 0.15)';
        case 'partial_compliance': return '0 2px 8px rgba(255, 167, 38, 0.15)';
        case 'non_compliance': return '0 2px 8px rgba(229, 57, 53, 0.15)';
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
    color: #1a237e;
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
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
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

const QuestionnaireStepForm = ({ task, onSave }) => {
  const dispatch = useDispatch();
  // Store questions separately from responses
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [comments, setComments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);
  const [globalNotes, setGlobalNotes] = useState('');
  
  // Load questions and existing responses
  useEffect(() => {
    if (task) {
      // Just set the original questions without trying to modify them
      setQuestions(task.questions || []);
      
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
    }
  }, [task]);
  
  // Validate whenever responses change
  useEffect(() => {
    validateResponses();
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
  
  const handleSave = async () => {
    if (!validateResponses()) {
      toast.error('Please answer all required questions');
      return;
    }
    
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
      
      toast.success('Questionnaire saved successfully!');
      if (onSave) onSave(result);
    } catch (error) {
      toast.error(error.message || 'Failed to save questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!questions || questions.length === 0) {
    return (
      <Container>
        <Title>Inspection Questionnaire</Title>
        <NoQuestionsMessage>
          <HelpCircle size={48} />
          <h3>No Questions Available</h3>
          <p>There are no inspection questions for this task.</p>
        </NoQuestionsMessage>
      </Container>
    );
  }
  
  const isQuestionnaireCompleted = task?.questionnaireCompleted;
  
  return (
    <Container>
      <Title>Inspection Questionnaire</Title>
      <QuestionsContainer>
        {questions.map((question, index) => {
          if (!question) return null;
          
          const questionId = question._id || question.id;
          const response = responses[questionId];
          const comment = comments[questionId];
          
          return (
            <QuestionItem key={questionId || index}>
              <QuestionText>
                {question.text}
                {question.required && <span style={{ color: 'red' }}> *</span>}
              </QuestionText>
              
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
                placeholder="Add a comment (optional)"
                value={comment || ''}
                onChange={(e) => handleCommentChange(questionId, e.target.value)}
                disabled={isQuestionnaireCompleted}
              />
            </QuestionItem>
          );
        })}
      </QuestionsContainer>
      
      <CommentBox 
        placeholder="Add general notes about the questionnaire (optional)"
        value={globalNotes}
        onChange={(e) => setGlobalNotes(e.target.value)}
        disabled={isQuestionnaireCompleted}
        style={{ marginBottom: '24px' }}
      />
      
      <ValidationMessage complete={allAnswered}>
        {allAnswered ? (
          <>
            <CheckCircle size={20} />
            <p>All required questions have been answered.</p>
          </>
        ) : (
          <>
            <AlertTriangle size={20} />
            <p>Please answer all required questions before proceeding.</p>
          </>
        )}
      </ValidationMessage>
      
      {!isQuestionnaireCompleted && (
        <ButtonContainer>
          <SaveButton 
            onClick={handleSave} 
            disabled={isSubmitting || !allAnswered}
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