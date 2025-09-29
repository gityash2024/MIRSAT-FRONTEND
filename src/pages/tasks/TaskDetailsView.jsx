import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  MapPin,
  Award,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Save,
  X
} from 'lucide-react';
import { fetchUserTaskDetails, exportTaskReport, updateTaskQuestionnaire } from '../../store/slices/userTasksSlice';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import Skeleton from '../../components/ui/Skeleton';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import { toast } from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const TaskTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const Content = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TaskCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#dcfce7';
      case 'in_progress': return '#fef3c7';
      case 'pending': return '#e0f2fe';
      case 'archived': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'in_progress': return '#92400e';
      case 'pending': return '#0369a1';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const CardContent = styled.div`
  padding: 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0f2fe;
  color: #0369a1;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ProgressValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0369a1;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const QuestionsSection = styled.div`
  margin-top: 24px;
`;

const QuestionCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: ${props => props.completed ? '#f0fdf4' : '#fefefe'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const QuestionText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
`;

const QuestionStatus = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#dcfce7';
      case 'in_progress': return '#fef3c7';
      case 'pending': return '#e0f2fe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'in_progress': return '#92400e';
      case 'pending': return '#0369a1';
      default: return '#6b7280';
    }
  }};
`;

const QuestionDetails = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
`;

const ResponseSection = styled.div`
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
`;

const ResponseLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ResponseValue = styled.div`
  font-size: 13px;
  color: #1e293b;
`;

const ScoreSection = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const ScoreItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
`;

const ScoreValue = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #0369a1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(3, 105, 161, 0.2);
  position: relative;

  &:hover {
    background: #0284c7;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(3, 105, 161, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ExportDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 160px;
  overflow: hidden;
`;

const ExportOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const ExportButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`;


const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EditToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.isEditMode ? '#dc2626' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isEditMode ? '#b91c1c' : '#2563eb'};
  }
`;

const UpdateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 16px auto;
  display: block;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const EditableQuestionCard = styled.div`
  background: ${props => props.isEditMode ? '#fef3c7' : 'white'};
  border: 2px solid ${props => props.isEditMode ? '#f59e0b' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  position: relative;

  ${props => props.isEditMode && `
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  `}
`;

const EditModeIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: 12px;
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const OptionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.selected ? '#3b82f6' : 'white'};
  color: ${props => props.selected ? 'white' : '#374151'};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: ${props => props.selected ? '#3b82f6' : '#f8fafc'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputContainer = styled.div`
  margin-top: 12px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const TaskDetailsView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { userRole } = usePermissions();
  
  const { currentTask, taskDetailsLoading, error } = useSelector((state) => state.userTasks);
  const [isExporting, setIsExporting] = useState(false);
  const [showDocumentNamingModal, setShowDocumentNamingModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('excel');
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [localInputValues, setLocalInputValues] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if user is admin (has all permissions)
  const canEdit = userRole === 'admin';

  useEffect(() => {
    if (taskId && taskId !== 'undefined') {
      console.log('Fetching task details for ID:', taskId);
      // Clear any previous task data and error when fetching new task
      dispatch({ type: 'userTasks/clearCurrentTask' });
      dispatch(fetchUserTaskDetails(taskId));
    } else {
      console.warn('Invalid task ID provided:', taskId);
    }
  }, [dispatch, taskId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('[data-export-dropdown]')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);


  const handleBack = () => {
    navigate('/tasks');
  };

  const handleExportClick = () => {
    if (!currentTask) return;
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExportFormat = (format) => {
    setSelectedExportFormat(format);
    setShowExportDropdown(false);
    setShowDocumentNamingModal(true);
  };

  const handleConfirmExport = async (fileName) => {
    if (!currentTask) return;
    
    const formatLabels = {
      excel: 'Excel',
      word: 'Word',
      pdf: 'PDF'
    };
    
    try {
      setIsExporting(true);
      setShowDocumentNamingModal(false);
      
      toast.loading(`Generating ${formatLabels[selectedExportFormat]} report...`);
      
      await dispatch(exportTaskReport({ 
        taskId: currentTask._id, 
        format: selectedExportFormat,
        fileName: fileName
      })).unwrap();
      
      toast.dismiss();
      toast.success(`${formatLabels[selectedExportFormat]} report exported successfully`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export ${formatLabels[selectedExportFormat]} report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Reset local values when exiting edit mode
      setLocalInputValues({});
    }
  };

  const handleInputChange = (questionId, value) => {
    setLocalInputValues(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSaveInspectionResponse = async (questionId, value) => {
    if (!currentTask || !isEditMode) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const currentResponses = currentTask.questionnaireResponses || {};
      const updatedResponses = {
        ...currentResponses,
        [questionId]: value
      };
      
      await dispatch(updateTaskQuestionnaire({
        taskId: currentTask._id,
        questionnaire: {
          responses: updatedResponses,
          notes: currentTask.questionnaireNotes || '',
          completed: false
        }
      })).unwrap();
      
      toast.success('Response updated successfully');
      
      // Refresh task details
      await dispatch(fetchUserTaskDetails(currentTask._id));
      
    } catch (error) {
      toast.error(`Failed to update response: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateInspection = async () => {
    if (!currentTask || !isEditMode) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Update all local changes
      const currentResponses = currentTask.questionnaireResponses || {};
      const updatedResponses = {
        ...currentResponses,
        ...localInputValues
      };
      
      await dispatch(updateTaskQuestionnaire({
        taskId: currentTask._id,
        questionnaire: {
          responses: updatedResponses,
          notes: currentTask.questionnaireNotes || '',
          completed: false
        }
      })).unwrap();
      
      toast.success('Inspection responses updated successfully');
      
      // Refresh task details and exit edit mode
      await dispatch(fetchUserTaskDetails(currentTask._id));
      setIsEditMode(false);
      setLocalInputValues({});
      
    } catch (error) {
      toast.error(`Failed to update inspection: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getQuestionStatus = (question, responses) => {
    if (!responses || !question._id) return 'pending';
    
    const response = responses[question._id];
    if (!response) return 'pending';
    
    // Check if there's a valid response
    if (response !== undefined && response !== null && response !== '') {
      return 'completed';
    }
    
    return 'in_progress';
  };

  const getQuestionResponse = (question, responses) => {
    if (!responses || !question._id) return null;
    return responses[question._id];
  };

  const calculateQuestionScore = (question, response) => {
    if (!response || !question.scoring?.enabled) return { achieved: 0, max: 0 };
    
    const maxScore = question.scoring?.max || 0;
    let achievedScore = 0;
    
    // Use template-defined scores if available
    if (question.scores && typeof question.scores === 'object') {
      // Get the score for this specific response from the template
      achievedScore = question.scores[response] || question.scores[response.toString()] || 0;
    } else {
      // Fallback to old logic if no template scores defined
    if (question.type === 'yesno' && response) {
      achievedScore = question.scores?.[response] || 0;
    } else if (question.type === 'compliance' && response) {
      achievedScore = question.scores?.[response] || 0;
      }
    }
    
    return { achieved: achievedScore, max: maxScore };
  };

  const renderEditableQuestionInput = (question, task, onSaveResponse) => {
    const questionId = question._id;
    const response = task.questionnaireResponses?.[questionId];
    const localValue = localInputValues[questionId];
    const displayValue = localValue !== undefined ? localValue : response;
    
    let questionType = question.type || question.answerType;
    
    if (questionType === 'yesno' && question.answerType === 'compliance') {
      questionType = 'compliance';
    } else if (questionType === 'yesno' && (question.options?.includes('Yes') || question.options?.includes('No'))) {
      questionType = 'yesno';
    } else if (questionType === 'multiple_choice') {
      questionType = 'radio';
    } else if (questionType === 'multiple') {
      questionType = 'checkbox';
    }
    
    switch (questionType) {
      case 'compliance':
        const complianceOptions = question.options?.length > 0 
          ? question.options 
          : ['Full compliance', 'Partial compliance', 'Non-compliant', 'Not applicable'];
        
        return (
          <OptionsContainer>
            {complianceOptions.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={displayValue === option}
                onClick={() => onSaveResponse(questionId, option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        );
        
      case 'yesno':
        const yesNoOptions = question.options?.length > 0 
          ? question.options 
          : ['Yes', 'No', 'N/A'];
        
        return (
          <OptionsContainer>
            {yesNoOptions.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={displayValue === option}
                onClick={() => onSaveResponse(questionId, option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        );
        
      case 'radio':
        return (
          <OptionsContainer>
            {question.options && question.options.length > 0 ? question.options.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={displayValue === option}
                onClick={() => onSaveResponse(questionId, option)}
              >
                {option}
              </OptionButton>
            )) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No options available</div>
            )}
          </OptionsContainer>
        );
        
      case 'checkbox':
        const selectedOptions = Array.isArray(displayValue) ? displayValue : displayValue ? [displayValue] : [];
        
        return (
          <OptionsContainer>
            {question.options && question.options.length > 0 ? question.options.map((option, optIndex) => (
              <OptionButton 
                key={optIndex}
                selected={selectedOptions.includes(option)}
                onClick={() => {
                  const newSelection = selectedOptions.includes(option)
                    ? selectedOptions.filter(opt => opt !== option)
                    : [...selectedOptions, option];
                  onSaveResponse(questionId, newSelection);
                }}
              >
                {option}
              </OptionButton>
            )) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>No options available</div>
            )}
          </OptionsContainer>
        );
        
      case 'text':
        return (
          <InputContainer>
            <InputGroup>
              <StyledInput
                type="text"
                placeholder="Enter your response"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => onSaveResponse(questionId, e.target.value)}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'number':
        return (
          <InputContainer>
            <InputGroup>
              <StyledInput
                type="number"
                placeholder="Enter a number"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => onSaveResponse(questionId, e.target.value)}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'date':
        return (
          <InputContainer>
            <InputGroup>
              <StyledInput
                type="date"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => onSaveResponse(questionId, e.target.value)}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'textarea':
        return (
          <InputContainer>
            <InputGroup>
              <StyledTextarea
                placeholder="Enter your response"
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => onSaveResponse(questionId, e.target.value)}
              />
            </InputGroup>
          </InputContainer>
        );
        
      case 'file':
        return (
          <InputContainer>
            <InputGroup>
              <div style={{ 
                border: '2px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                background: '#f9fafb',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                <div style={{ 
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {displayValue ? 'File uploaded' : 'Click to upload file'}
                </div>
                
                {displayValue && displayValue.startsWith('data:image/') && (
                  <div style={{ marginBottom: '12px' }}>
                    <img 
                      src={displayValue} 
                      alt="Uploaded file" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '150px', 
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onSaveResponse(questionId, event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </InputGroup>
          </InputContainer>
        );
        
      case 'signature':
        return (
          <InputContainer>
            <InputGroup>
              <div 
                style={{ 
                  border: '2px dashed #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#f9fafb',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
                title="Signature cannot be edited once provided"
              >
                <div style={{ 
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {displayValue ? 'Signature provided' : 'No signature provided'}
                </div>
                
                {displayValue && displayValue.startsWith('data:image/') && (
                  <div style={{ marginBottom: '12px' }}>
                    <img 
                      src={displayValue} 
                      alt="Signature" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '100px', 
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  </div>
                )}
                
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  display: 'inline-block',
                  cursor: 'not-allowed'
                }}>
                  {displayValue ? 'Signature Locked' : 'No Signature'}
                </div>
                
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  Signatures cannot be edited once provided
                </div>
              </div>
            </InputGroup>
          </InputContainer>
        );
        
      default:
        return (
          <InputContainer>
            <InputGroup>
              <StyledInput
                type={questionType === 'number' ? 'number' : questionType === 'date' ? 'date' : 'text'}
                placeholder={`Enter your ${questionType || 'text'} response`}
                value={displayValue || ''}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                onBlur={(e) => onSaveResponse(questionId, e.target.value)}
              />
            </InputGroup>
          </InputContainer>
        );
    }
  };

  if (taskDetailsLoading || (!error && !currentTask)) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tasks
          </BackButton>
          <TaskTitle>Loading Task Details...</TaskTitle>
        </Header>
        <Content>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>Loading task details...</h3>
            <p style={{ color: '#9ca3af' }}>Please wait while we fetch the task information</p>
          </div>
        </Content>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tasks
          </BackButton>
          <TaskTitle>Error Loading Task</TaskTitle>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px' }} />
            <h3>Failed to load task details</h3>
            <p>{error}</p>
            <button 
              onClick={() => {
                dispatch({ type: 'userTasks/clearCurrentTask' });
                dispatch(fetchUserTaskDetails(taskId));
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </Content>
      </PageContainer>
    );
  }

  if (!currentTask) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tasks
          </BackButton>
          <TaskTitle>Task Not Found</TaskTitle>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <FileText size={48} style={{ marginBottom: '16px', color: '#64748b' }} />
            <h3>Task not found</h3>
            <p>The requested task could not be found.</p>
          </div>
        </Content>
      </PageContainer>
    );
  }


  const responses = currentTask.questionnaireResponses || {};
  const inspectionLevel = currentTask.inspectionLevel;
  
  // Calculate total questions from inspection level (excluding pre-inspection questions)
  // Prioritize pages structure as it contains the correct data
  const totalQuestionsFromPages = inspectionLevel?.pages?.reduce((total, page) => {
    return total + page.sections?.reduce((pageTotal, section) => {
      return pageTotal + (section.questions?.length || 0);
    }, 0) || 0;
  }, 0) || 0;
  
  // Fallback to subLevels structure if pages is not available
  const totalQuestions = inspectionLevel?.subLevels?.reduce((total, page) => {
    return total + page.subLevels?.reduce((pageTotal, section) => {
      return pageTotal + (section.questions?.length || 0);
    }, 0) || 0;
  }, 0) || 0;
  
  // Use pages structure if available, otherwise fallback to subLevels
  const finalTotalQuestions = totalQuestionsFromPages > 0 ? totalQuestionsFromPages : totalQuestions;

  // Calculate completed questions based on actual responses (excluding pre-inspection questions)
  // Filter out pre-inspection question responses
  const inspectionQuestionIds = new Set();
  
  // Prioritize pages structure as it contains the correct data
  if (inspectionLevel?.pages) {
    inspectionLevel.pages.forEach(page => {
      if (page.sections) {
        page.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              if (question._id) {
                inspectionQuestionIds.add(question._id.toString());
              }
            });
          }
        });
      }
    });
  }
  
  // Fallback to subLevels structure if pages is not available
  if (inspectionLevel?.subLevels && inspectionQuestionIds.size === 0) {
    inspectionLevel.subLevels.forEach(page => {
      if (page.subLevels) {
        page.subLevels.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              if (question._id) {
                inspectionQuestionIds.add(question._id.toString());
              }
            });
          }
        });
      }
    });
  }
  
  const completedQuestions = Object.keys(responses).filter(responseId => 
    inspectionQuestionIds.has(responseId)
  ).length;

  // Use the actual progress from the task data or calculate it
  const progressPercentage = currentTask.overallProgress || 
    (finalTotalQuestions > 0 ? Math.round((completedQuestions / finalTotalQuestions) * 100) : 0);

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Tasks
        </BackButton>
        <TaskTitle>{currentTask.name || currentTask.title}</TaskTitle>
        <HeaderActions>
          <StatusBadge status={currentTask.status}>
            {currentTask.status === 'completed' && <CheckCircle size={12} />}
            {currentTask.status === 'in_progress' && <Clock size={12} />}
            {currentTask.status === 'pending' && <Clock size={12} />}
            {currentTask.status === 'archived' && <FileText size={12} />}
            {currentTask.status === 'archived' ? 'Completed' : currentTask.status?.charAt(0).toUpperCase() + currentTask.status?.slice(1)}
          </StatusBadge>
          
          <ExportButtonContainer data-export-dropdown>
            <ExportButton 
              onClick={handleExportClick}
              disabled={isExporting || !currentTask}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export Report'}
              <ChevronDown size={14} />
            </ExportButton>
            {showExportDropdown && (
              <ExportDropdown>
                <ExportOption onClick={() => handleExportFormat('excel')}>
                  <FileSpreadsheet size={16} />
                  Export as Excel
                </ExportOption>
                {/* <ExportOption onClick={() => handleExportFormat('word')}>
                  <FileText size={16} />
                  Export as Word
                </ExportOption> */}
                <ExportOption onClick={() => handleExportFormat('pdf')}>
                  <FileText size={16} />
                  Export as PDF
                </ExportOption>
              </ExportDropdown>
            )}
          </ExportButtonContainer>
        </HeaderActions>
      </Header>

      <Content>
        {/* Task Overview */}
        <TaskCard>
          <CardHeader>
            <CardTitle>
              <FileText size={20} />
              Task Overview
            </CardTitle>
            {canEdit && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <EditToggleButton 
                  onClick={handleEditToggle}
                  isEditMode={isEditMode}
                >
                  {isEditMode ? <X size={16} /> : <Edit size={16} />}
                  {isEditMode ? 'Exit Edit' : 'Edit Inspection'}
                </EditToggleButton>
                {isEditMode && (
                  <UpdateButton 
                    onClick={handleUpdateInspection}
                    disabled={isUpdating}
                    style={{ margin: 0, display: 'flex' }}
                  >
                    <Save size={16} />
                    {isUpdating ? 'Updating...' : 'Update Inspection'}
                  </UpdateButton>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <User size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Assigned To</InfoLabel>
                  <InfoValue>
                    {currentTask.assignedTo?.map(user => user.name).join(', ') || 'Unassigned'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Calendar size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Due Date</InfoLabel>
                  <InfoValue>
                    {currentTask.deadline ? new Date(currentTask.deadline).toLocaleDateString() : 'No due date'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>

              {/* <InfoItem>
                <InfoIcon>
                  <MapPin size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Location</InfoLabel>
                  <InfoValue>{currentTask.location || 'Not specified'}</InfoValue>
                </InfoContent>
              </InfoItem> */}

              <InfoItem>
                <InfoIcon>
                  <Award size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Priority</InfoLabel>
                  <InfoValue style={{ 
                    color: currentTask.priority === 'high' ? '#dc2626' : 
                           currentTask.priority === 'medium' ? '#d97706' : '#16a34a'
                  }}>
                    {currentTask.priority?.charAt(0).toUpperCase() + currentTask.priority?.slice(1) || 'Normal'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoGrid>

            {currentTask.description && (
              <div style={{ marginTop: '16px' }}>
                <InfoLabel>Description</InfoLabel>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#475569'
                }}>
                  {currentTask.description}
                </div>
              </div>
            )}
          </CardContent>
        </TaskCard>

        {/* Progress Section */}
        <TaskCard>
          <CardHeader>
            <CardTitle>
              <Award size={20} />
              Progress & Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressSection>
              <ProgressHeader>
                <ProgressTitle>Overall Progress</ProgressTitle>
                <ProgressValue>{progressPercentage}%</ProgressValue>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill progress={progressPercentage} />
              </ProgressBar>
              <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Questions Completed: {completedQuestions} / {finalTotalQuestions}</span>
                <span>Completion Rate: {progressPercentage}%</span>
              </div>
            </ProgressSection>
          </CardContent>
        </TaskCard>

        {/* Questions Section */}
        {(inspectionLevel?.subLevels || inspectionLevel?.pages) && (
          <TaskCard>
            <CardHeader>
              <CardTitle>
                <MessageSquare size={20} />
                Inspection Questions & Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsSection>
                {/* Render questions from pages structure */}
                {inspectionLevel.pages?.map((page, pageIndex) => (
                  <div key={page._id || pageIndex} style={{ marginBottom: '32px' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#f1f5f9',
                      borderRadius: '8px'
                    }}>
                      Page {pageIndex + 1}: {page.name}
                    </h3>
                    
                    {page.sections?.map((section, sectionIndex) => (
                      <div key={section._id || sectionIndex} style={{ marginBottom: '24px' }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#475569',
                          marginBottom: '12px',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: '6px'
                        }}>
                          Section {sectionIndex + 1}: {section.name}
                        </h4>
                        
                        {section.questions?.map((question, questionIndex) => {
                          const status = getQuestionStatus(question, responses);
                          const response = getQuestionResponse(question, responses);
                          const score = calculateQuestionScore(question, response);
                          
                          return (
                            <EditableQuestionCard 
                              key={question._id || questionIndex} 
                              completed={status === 'completed'}
                              isEditMode={isEditMode}
                            >
                              {isEditMode && <EditModeIndicator>Edit Mode</EditModeIndicator>}
                              <QuestionHeader>
                                <QuestionText>
                                  Q{questionIndex + 1}. {question.text}
                                </QuestionText>
                                <QuestionStatus status={status}>
                                  {status === 'completed' && <CheckCircle size={10} />}
                                  {status === 'in_progress' && <Clock size={10} />}
                                  {status === 'pending' && <Clock size={10} />}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </QuestionStatus>
                              </QuestionHeader>
                              
                              <QuestionDetails>
                                <div>Type: {question.type} • {question.required ? 'Required' : 'Optional'} • {question.scoring?.enabled ? 'Scored' : 'Not Scored'}</div>
                                {question.description && (
                                  <div style={{ marginTop: '4px' }}>{question.description}</div>
                                )}
                              </QuestionDetails>
                              
                              {isEditMode ? (
                                <ResponseSection>
                                  <ResponseLabel>Edit Response:</ResponseLabel>
                                  <ResponseValue>
                                    {renderEditableQuestionInput(question, currentTask, handleSaveInspectionResponse)}
                                  </ResponseValue>
                                </ResponseSection>
                              ) : response ? (
                                <ResponseSection>
                                  <ResponseLabel>Response:</ResponseLabel>
                                  <ResponseValue>
                                    {question.type === 'yesno' && (
                                      <span style={{ 
                                        color: response === 'Yes' ? '#16a34a' : 
                                               response === 'No' ? '#dc2626' : '#64748b'
                                      }}>
                                        {response}
                                      </span>
                                    )}
                                    {question.type === 'compliance' && (
                                      <span style={{ 
                                        color: response === 'Compliant' || response === 'Full compliance' ? '#16a34a' : 
                                               response === 'Non-Compliant' || response === 'Non compliance' ? '#dc2626' : '#64748b'
                                      }}>
                                        {response}
                                      </span>
                                    )}
                                    {question.type === 'text' && response}
                                    {question.type === 'date' && response && new Date(response).toLocaleDateString()}
                                    {question.type === 'file' && response && (
                                      <div style={{ marginTop: '8px' }}>
                                        {response.startsWith('data:image/') ? (
                                          <div>
                                            <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                              📎 Image uploaded
                                            </div>
                                            <img 
                                              src={response} 
                                              alt="Uploaded file" 
                                              style={{ 
                                                maxWidth: '200px', 
                                                maxHeight: '150px', 
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                cursor: 'pointer'
                                              }}
                                              onClick={() => window.open(response, '_blank')}
                                            />
                                          </div>
                                        ) : response.startsWith('data:') ? (
                                          <div>
                                            <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                              📎 File uploaded
                                            </div>
                                            <button
                                              onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = response;
                                                link.download = 'uploaded-file';
                                                link.click();
                                              }}
                                              style={{
                                                padding: '8px 12px',
                                                background: '#0369a1',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                              }}
                                            >
                                              Download File
                                            </button>
                                          </div>
                                        ) : (
                                          <span style={{ color: '#0369a1' }}>📎 File uploaded: {response}</span>
                                        )}
                                      </div>
                                    )}
                                    {question.type === 'signature' && response && (
                                      <div 
                                        style={{ 
                                          marginTop: '8px',
                                          padding: '12px',
                                          backgroundColor: '#f9fafb',
                                          borderRadius: '8px',
                                          border: '1px solid #e5e7eb',
                                          position: 'relative',
                                          cursor: 'not-allowed',
                                          opacity: 0.8
                                        }}
                                        title="Signature cannot be edited once provided"
                                      >
                                        <div style={{ marginBottom: '8px', color: '#6b7280', fontSize: '12px' }}>
                                          ✍️ Signature provided (Locked)
                                        </div>
                                        {response.startsWith('data:image/') ? (
                                          <img 
                                            src={response} 
                                            alt="Signature" 
                                            style={{ 
                                              maxWidth: '200px', 
                                              maxHeight: '100px', 
                                              borderRadius: '6px',
                                              border: '1px solid #e2e8f0',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(response, '_blank')}
                                          />
                                        ) : (
                                          <span style={{ color: '#6b7280' }}>✍️ Signature provided</span>
                                        )}
                                        <div style={{
                                          marginTop: '8px',
                                          fontSize: '11px',
                                          color: '#9ca3af',
                                          fontStyle: 'italic'
                                        }}>
                                          Signatures cannot be edited once provided
                                        </div>
                                      </div>
                                    )}
                                    {question.type === 'multiple_choice' && Array.isArray(response) && (
                                      <span>{response.join(', ')}</span>
                                    )}
                                    {question.type === 'multiple_choice' && !Array.isArray(response) && (
                                      <span>{response}</span>
                                    )}
                                  </ResponseValue>
                                </ResponseSection>
                              ) : (
                                <ResponseSection>
                                  <ResponseLabel>Response:</ResponseLabel>
                                  <ResponseValue style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                    No response provided
                                  </ResponseValue>
                                </ResponseSection>
                              )}
                            </EditableQuestionCard>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </QuestionsSection>
            </CardContent>
          </TaskCard>
        )}
      </Content>

      {/* Document Naming Modal */}
      <DocumentNamingModal
        isOpen={showDocumentNamingModal}
        onClose={() => setShowDocumentNamingModal(false)}
        onExport={handleConfirmExport}
        exportFormat={selectedExportFormat}
        documentType="Task Report"
        defaultCriteria={['documentType', 'currentDate']}
      />
    </PageContainer>
  );
};

export default TaskDetailsView;
