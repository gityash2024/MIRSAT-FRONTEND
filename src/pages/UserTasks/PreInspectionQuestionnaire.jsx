import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle,
  CheckSquare, Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchUserTaskDetails, updateTaskQuestionnaire } from '../../store/slices/userTasksSlice';

const PageContainer = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  color: #1a237e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  margin-bottom: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.9);
    color: #0d1186;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 28px;
  transition: all 0.35s cubic-bezier(0.21, 0.6, 0.35, 1);
  border: 1px solid rgba(255, 255, 255, 0.7);
  max-width: 800px;
  margin: 0 auto;
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
  
  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
  
  svg {
    color: #3f51b5;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  }
`;

const TaskTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  text-align: center;
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
  
  border: 1px solid ${props => {
    if (props.selected) {
      switch(props.value) {
        case 'full_compliance': return 'rgba(76, 175, 80, 0.3)';
        case 'partial_compliance': return 'rgba(255, 152, 0, 0.3)';
        case 'non_compliance': return 'rgba(244, 67, 54, 0.3)';
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
        default: return '0 1px 3px rgba(0, 0, 0, 0.05)';
      }
    }
    return '0 1px 3px rgba(0, 0, 0, 0.05)';
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)' : 
    'rgba(255, 255, 255, 0.8)'};
  border: none;
  color: ${props => props.primary ? 'white' : '#1a237e'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background: ${props => props.primary ? 
      'linear-gradient(135deg, #151b4f 0%, #2c3889 100%)' : 
      'rgba(255, 255, 255, 0.9)'};
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
`;

const ErrorContainer = styled.div`
  background: rgba(255, 236, 236, 0.9);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(244, 67, 54, 0.2);
  color: #c62828;
  max-width: 500px;
  margin: 40px auto;
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
`;

const StepDot = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.active ? '#1a237e' : props.completed ? '#c8e6c9' : '#e0e0e0'};
  color: ${props => props.active || props.completed ? 'white' : '#757575'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  box-shadow: ${props => props.active ? '0 0 0 4px rgba(26, 35, 126, 0.2)' : 'none'};
`;

const StepLabel = styled.div`
  font-size: 12px;
  color: ${props => props.active ? '#1a237e' : '#757575'};
  text-align: center;
  font-weight: ${props => props.active ? '600' : '400'};
`;

const StepConnector = styled.div`
  height: 2px;
  width: 50px;
  background: ${props => props.completed ? '#c8e6c9' : '#e0e0e0'};
  margin-top: 15px;
`;

const NotesInput = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(229, 231, 235, 0.8);
    border-radius: 12px;
    font-size: 14px;
    min-height: 110px;
    resize: vertical;
    background: rgba(255, 255, 255, 0.9);
    color: #333; /* Ensure text is visible */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
    }
  }
  
  label {
    position: absolute;
    top: -10px;
    left: 12px;
    background: white;
    padding: 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1a237e;
    border-radius: 4px;
  }
`;

const PreInspectionQuestionnaire = () => {
  const { taskId, subLevelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTask, taskDetailsLoading, error } = useSelector(state => state.userTasks);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (taskId) {
      dispatch(fetchUserTaskDetails(taskId));
    }
  }, [taskId, dispatch]);
  
  // Check if questionnaire was already completed
  useEffect(() => {
    if (currentTask?.questionnaireCompleted && currentTask?.questionnaireResponses) {
      setResponses(currentTask.questionnaireResponses);
    }
  }, [currentTask]);
  
  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [`${subLevelId || 'general'}-${questionId}`]: value
    }));
  };
  
  const handleSubmit = async () => {
    if (currentTask?.questions) {
      const requiredQuestions = currentTask.questions.filter(q => q.required);
      const allRequiredAnswered = requiredQuestions.every(q => 
        responses[`${subLevelId || 'general'}-${q.id}`] ||
        responses[`${subLevelId || 'general'}-${q._id}`]
      );
      
      if (!allRequiredAnswered) {
        toast.error('Please answer all required questions');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Save questionnaire to backend
      await dispatch(updateTaskQuestionnaire({
        taskId,
        data: {
          responses,
          notes,
          completed: true
        }
      })).unwrap();
      
      // Navigate back to the task detail page with the questionnaire data
      navigate(`/user-tasks/${taskId}`, { 
        state: { 
          questionnaireCompleted: true,
          responses,
          subLevelId,
          notes
        } 
      });
    } catch (error) {
      toast.error('Failed to save questionnaire: ' + (error.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/user-tasks/${taskId}`);
  };
  
  if (taskDetailsLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader size={40} color="#1a237e" />
          <div>Loading task details...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  if (error || !currentTask) {
    return (
      <PageContainer>
        <ErrorContainer>
          <AlertTriangle size={32} />
          <h3>Error Loading Task</h3>
          <p>{error || 'Unable to load task details'}</p>
          <Button onClick={() => navigate('/user-tasks')}>
            Return to Tasks
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <BackButton onClick={handleCancel}>
        <ArrowLeft size={18} />
        Back to Task
      </BackButton>
      
      <ProgressSteps>
        <Step>
          <StepDot completed={true}>1</StepDot>
          <StepLabel>Task Overview</StepLabel>
        </Step>
        <StepConnector completed={true} />
        <Step>
          <StepDot active={true}>2</StepDot>
          <StepLabel active={true}>Questionnaire</StepLabel>
        </Step>
        <StepConnector />
        <Step>
          <StepDot>3</StepDot>
          <StepLabel>Inspection</StepLabel>
        </Step>
      </ProgressSteps>
      
      <Card>
        <TaskTitle>{currentTask.title}</TaskTitle>
        <CardTitle>
          <CheckSquare size={22} />
          Pre-Inspection Questionnaire
        </CardTitle>
        
        <QuestionsContainer>
          {currentTask.questions && currentTask.questions.map((question, index) => (
            <QuestionItem key={question._id || question.id || index}>
              <QuestionText>
                {index + 1}. {question.text} {question.required && <span style={{ color: 'red' }}>*</span>}
              </QuestionText>
              
              <QuestionOptions>
                {question.answerType === 'yesNo' && (
                  <>
                    <OptionButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'yes'}
                      onClick={() => handleResponse(question._id || question.id, 'yes')}
                    >
                      Yes
                    </OptionButton>
                    <OptionButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'no'}
                      onClick={() => handleResponse(question._id || question.id, 'no')}
                    >
                      No
                    </OptionButton>
                    <OptionButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'na'}
                      onClick={() => handleResponse(question._id || question.id, 'na')}
                    >
                      N/A
                    </OptionButton>
                  </>
                )}
                
                {question.answerType === 'compliance' && (
                  <>
                    <ComplianceButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'full_compliance'}
                      onClick={() => handleResponse(question._id || question.id, 'full_compliance')}
                      value="full_compliance"
                    >
                      Full Compliance
                    </ComplianceButton>
                    <ComplianceButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'partial_compliance'}
                      onClick={() => handleResponse(question._id || question.id, 'partial_compliance')}
                      value="partial_compliance"
                    >
                      Partial Compliance
                    </ComplianceButton>
                    <ComplianceButton
                      selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === 'non_compliance'}
                      onClick={() => handleResponse(question._id || question.id, 'non_compliance')}
                      value="non_compliance"
                    >
                      Non Compliance
                    </ComplianceButton>
                  </>
                )}
                
                {question.answerType === 'custom' && question.options && question.options.length > 0 && (
                  <>
                    {question.options.map((option, optionIndex) => (
                      <OptionButton
                        key={optionIndex}
                        selected={responses[`${subLevelId || 'general'}-${question._id || question.id}`] === option}
                        onClick={() => handleResponse(question._id || question.id, option)}
                      >
                        {option}
                      </OptionButton>
                    ))}
                  </>
                )}
              </QuestionOptions>
            </QuestionItem>
          ))}
        </QuestionsContainer>
        
        <NotesInput>
          <label>Additional Notes</label>
          <textarea
            placeholder="Add any additional notes or observations here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </NotesInput>
        
        <ButtonGroup>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            primary 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <CheckCircle size={18} />
            Submit & Start Inspection
          </Button>
        </ButtonGroup>
      </Card>
    </PageContainer>
  );
};

export default PreInspectionQuestionnaire;