import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Upload, Users, X, File, Plus, Minus, Trash2, Check, ExternalLink, User, Tag, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { statusOptions, priorityOptions } from '../../../constants/taskOptions';
import { createTask, updateTask, uploadTaskAttachment } from '../../../store/slices/taskSlice';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spinner from '../../../components/ui/Spinner';
import PopoverMenu from '../../../components/ui/PopoverMenu';
import Switch from '../../../components/ui/Switch';
import DatePicker from '../../../components/ui/DatePicker';
import { fetchUsers } from '../../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../../store/slices/inspectionLevelSlice';
import { fetchAssets, fetchAllAssetsForDropdown } from '../../../store/slices/assetSlice';
import { fetchQuestionLibrary } from '../../../store/slices/questionLibrarySlice';
import { v4 as uuidv4 } from 'uuid';
import FrontendLogger from '../../../services/frontendLogger.service';

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const MultiSelect = styled.div`
  position: relative;
`;

const MultiSelectHeader = styled.div`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  flex-wrap: wrap;
`;

const SelectedItem = styled.span`
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #64748b;
    &:hover {
      color: #dc2626;
    }
  }
`;

const MultiSelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Option = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f1f5f9;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ToggleIndicator = styled.div`
  position: relative;
  width: 40px;
  height: 20px;
  background: ${props => props.checked ? '#1a237e' : '#e0e0e0'};
  border-radius: 20px;
  padding: 2px;
  transition: all 0.3s;
  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s;
    transform: translateX(${props => props.checked ? '20px' : '0'});
  }
`;

const AttachmentSection = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  &:hover {
    border-color: #1a237e;
  }
`;

const AttachmentInput = styled.input`
  display: none;
`;

const AttachmentList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  position: relative;
  button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #64748b;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    &:hover {
      color: #dc2626;
    }
  }
`;

const AttachmentProgress = styled.div`
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: #1a237e;
  transition: width 0.3s ease;
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;
    &:hover {
      background: #151b4f;
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;
    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserSelection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const UserTag = styled.span`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #dc2626;
  &:hover {
    color: #b91c1c;
  }
`;

const UserPickerButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const UserOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f1f5f9;
  }
  
  ${props => props.selected && `
    background: #e0e0e0;
  `}
  
  span {
    flex: 1;
  }
`;

const AdvancedToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

const AttachmentUpload = styled.div`
  margin-top: 16px;
  text-align: center;
`;

const UploadButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
  ${props => props.disabled && `
    opacity: 0.7;
    cursor: not-allowed;
  `}
`;

const AttachmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #1a237e;
  }
`;

const UsersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const UserBadge = styled.span`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const NoUsersText = styled.span`
  color: #64748b;
  font-size: 12px;
`;

const QuestionContainer = styled.div`
  margin-top: 24px;
  background: #f9fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const QuestionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QuestionItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  position: relative;
`;

const QuestionText = styled.div`
  font-weight: 500;
  margin-bottom: 12px;
`;

const QuestionType = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const QuestionOption = styled.div`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const QuestionActions = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
`;

const LibrarySelector = styled.div`
  position: relative;
`;

const LibraryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const LibraryDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  width: 100%;
  min-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
`;

const LibraryItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
  &:last-child {
    border-bottom: none;
  }
`;

const LibraryItemTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const LibraryItemType = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const RequiredBadge = styled.span`
  background: ${props => props.required ? '#e3f2fd' : '#f3f4f6'};
  color: ${props => props.required ? '#0277bd' : '#9ca3af'};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
`;

const AddQuestionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1a237e;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
`;

// Pre-inspection Questions Component
const PreInspectionQuestions = ({ 
  questions = [], 
  onChange, 
  initialQuestions = [],
  isEditMode = false 
}) => {
  const dispatch = useDispatch();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'text',
    options: [],
    required: true,
    requirementType: 'mandatory',
    scoring: {
      enabled: false,
      max: 2
    },
    scores: {}
  });
  const [newOption, setNewOption] = useState('');
  const { questions: libraryQuestions, loading } = useSelector(state => state.questionLibrary);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Add useEffect to properly initialize questions from initialQuestions and localStorage
  useEffect(() => {
    console.log('Initializing pre-inspection questions:', initialQuestions, 'isInitialized:', isInitialized);
    
    // Only initialize once and if we have initialQuestions
    if (!isInitialized && initialQuestions && initialQuestions.length > 0) {
      console.log('Setting pre-inspection questions from initialQuestions');
      onChange([...initialQuestions]);
      setIsInitialized(true);
    }
  }, [initialQuestions, onChange, isInitialized]);
  
  useEffect(() => {
    dispatch(fetchQuestionLibrary());
  }, [dispatch]);
  
  const handleAddFromLibrary = (question, e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding question from library:', question);
    console.log('Current questions before adding:', questions);
    
    const newQuestion = {
      text: question.text,
      type: question.answerType,
      options: question.options || [],
      required: question.required
    };
    
    const updatedQuestions = [...questions, newQuestion];
    console.log('Updated questions after adding:', updatedQuestions);
    
    onChange(updatedQuestions);
    setShowLibrary(false);
  };
  
  const handleRemoveQuestion = (index, e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onChange(newQuestions);
  };

  const handleAddManualQuestion = (e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding manual question:', newQuestion);
    console.log('Current questions before adding:', questions);
    
    if (!newQuestion.text.trim()) {
      console.log('Question text is empty, not adding');
      return;
    }
    
    const updatedQuestions = [...questions, { ...newQuestion }];
    console.log('Updated questions after adding:', updatedQuestions);
    
    onChange(updatedQuestions);
    setNewQuestion({
      text: '',
      type: 'text',
      options: [],
      required: true,
      requirementType: 'mandatory',
      scoring: {
        enabled: false,
        max: 2
      },
      scores: {}
    });
    setShowAddManual(false);
  };
  
  const handleAddOption = (e) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
    setNewOption('');
  };
  
  const handleRemoveOption = (index, e) => {
    e.preventDefault();
    const newOptions = [...newQuestion.options];
    newOptions.splice(index, 1);
    setNewQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const updateOptionScore = (option, score) => {
    const scores = { ...(newQuestion.scores || {}) };
    scores[option] = parseInt(score) || 0;
    setNewQuestion(prev => ({
      ...prev,
      scores
    }));
  };
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let updatedQuestion = { 
      ...newQuestion, 
      type: newType,
      requirementType: newQuestion.requirementType || 'mandatory'
    };
    
    // Add default options based on type
    if (newType === 'multiple_choice') {
      updatedQuestion.options = updatedQuestion.options?.length ? updatedQuestion.options : ['Option 1', 'Option 2', 'Option 3'];
    } else if (newType === 'compliance') {
      updatedQuestion.options = [
        'Full compliance',
        'Partial compliance',
        'Non-compliant',
        'Not applicable'
      ];
      
      // Add default scores for compliance options
      updatedQuestion.scoring = {
        enabled: true,
        max: 2
      };
      
      updatedQuestion.scores = {
        'Full compliance': 2,
        'Partial compliance': 1,
        'Non-compliant': 0,
        'Not applicable': 0
      };
    } else if (newType === 'select') {
      updatedQuestion.options = updatedQuestion.options?.length ? updatedQuestion.options : ['Option 1', 'Option 2', 'Option 3'];
    } else if (newType === 'yesno') {
      // Add default scores for Yes/No
      updatedQuestion.options = ['Yes', 'No', 'N/A'];
      updatedQuestion.scoring = {
        enabled: true,
        max: 2
      };
      updatedQuestion.scores = {
        'Yes': 2,
        'No': 0,
        'N/A': 0
      };
    } else {
      // Reset options if changing to a type that doesn't need them
      updatedQuestion.options = [];
      // Keep scoring if it exists, otherwise initialize it
      if (!updatedQuestion.scoring) {
        updatedQuestion.scoring = {
          enabled: false,
          max: 2
        };
      }
    }
    
    setNewQuestion(updatedQuestion);
  };
  
  const getTypeLabel = (type) => {
    switch(type) {
      case 'yesno': return 'Yes/No';
      case 'text': return 'Text';
      case 'number': return 'Number';
      case 'select': return 'Select';
      case 'multiple_choice': return 'Multiple Choice';
      case 'compliance': return 'Compliance';
      case 'date': return 'Date';
      default: return type;
    }
  };
  
  return (
    <QuestionContainer>
      <QuestionHeader>
        <QuestionTitle>
          <Database size={18} />
          {isEditMode ? 'Add More Pre-Inspection Questions' : 'Pre-Inspection Questions'} ({questions.length})
          {/* {isEditMode && (
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 'normal', 
              color: '#666', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Note: Previously filled questions are preserved. Any new questions added here will be included in the update.
            </div>
          )} */}
        </QuestionTitle>
        {/* {questions.length > 0 && (
          <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                {i+1}. {q.text} ({q.type}) {q._id ? `ID: ${q._id}` : 'New'}
              </div>
            ))}
          </div>
        )} */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <LibrarySelector>
            <LibraryButton type="button" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Header library button clicked');
              setShowLibrary(!showLibrary);
              setShowAddManual(false);
            }}>
              {showLibrary ? 'Close Library' : 'Select from Library'}
              {showLibrary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </LibraryButton>
            
            {showLibrary && (
              <LibraryDropdown>
                {loading ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <Spinner size={24} />
                  </div>
                ) : libraryQuestions.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    No questions in library
                  </div>
                ) : (
                  libraryQuestions.map(question => (
                    <LibraryItem 
                      key={question._id} 
                      onClick={(e) => handleAddFromLibrary(question, e)}
                    >
                      <LibraryItemTitle>{question.text}</LibraryItemTitle>
                      <LibraryItemType>
                        {getTypeLabel(question.answerType)}
                        {question.options && question.options.length > 0 && 
                          ` • ${question.options.length} options`}
                      </LibraryItemType>
                    </LibraryItem>
                  ))
                )}
              </LibraryDropdown>
            )}
          </LibrarySelector>
          
          <LibraryButton type="button" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Header manual button clicked');
            setShowAddManual(!showAddManual);
            setShowLibrary(false);
          }}>
            {showAddManual ? 'Cancel' : 'Add Manually'}
            {showAddManual ? <X size={16} /> : <Plus size={16} />}
          </LibraryButton>
        </div>
      </QuestionHeader>
      
      {showAddManual && (
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '20px', 
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <FormGroup>
            <Label>Question Text <span style={{ color: 'red' }}>*</span></Label>
            <TextArea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter question text"
              rows={2}
            />
          </FormGroup>
          
          <FormGroup style={{ marginTop: '16px' }}>
            <Label>Question Type</Label>
            <Select
              value={newQuestion.type}
              onChange={handleTypeChange}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="yesno">Yes/No</option>
              <option value="select">Select</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="compliance">Compliance</option>
            </Select>
          </FormGroup>
          
          <FormGroup style={{ marginTop: '16px' }}>
            <Label>Requirement Type</Label>
            <Select
              value={newQuestion.requirementType || 'mandatory'}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, requirementType: e.target.value }))}
            >
              <option value="mandatory">Mandatory</option>
              <option value="recommended">Recommended</option>
            </Select>
          </FormGroup>
          
          {/* Weight field similar to InspectionLevelForm */}
          <FormGroup style={{ marginTop: '16px' }}>
            <Label>Question Weight</Label>
            <Input
              type="number"
              value={newQuestion.weight !== undefined ? newQuestion.weight : 1}
              onChange={(e) => {
                const weight = parseInt(e.target.value);
                setNewQuestion(prev => ({
                  ...prev,
                  weight: isNaN(weight) ? 0 : Math.max(0, weight)
                }));
              }}
              min="0"
              placeholder="Question weight"
            />
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Set to 0 for non-scored questions
            </div>
          </FormGroup>
          
          {/* Options editor for multiple choice, select or compliance questions */}
          {['multiple_choice', 'compliance', 'select', 'yesno'].includes(newQuestion.type) && (
            <FormGroup style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <Label>Options</Label>
                {newQuestion.type !== 'compliance' && newQuestion.type !== 'yesno' && (
                  <button 
                    type="button"
                    onClick={handleAddOption}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#334155',
                      fontWeight: '500'
                    }}
                  >
                    <Plus size={14} /> Add Option
                  </button>
                )}
              </div>
              
              {newQuestion.type !== 'compliance' && newQuestion.type !== 'yesno' && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <Input 
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Enter option"
                    style={{ flex: 1 }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddOption}
                    style={{ padding: '8px 12px' }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              )}
              
              {/* Options table with scores - similar to InspectionLevelForm */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontSize: '14px',
                        borderBottom: '1px solid #e2e8f0'
                      }}>Option</th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontSize: '14px',
                        borderBottom: '1px solid #e2e8f0'
                      }}>Score</th>
                      {newQuestion.type !== 'compliance' && newQuestion.type !== 'yesno' && (
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'center', 
                          fontSize: '14px',
                          width: '60px',
                          borderBottom: '1px solid #e2e8f0'
                        }}></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {newQuestion.options.map((option, i) => (
                      <tr key={i} style={{ 
                        borderBottom: i < newQuestion.options.length - 1 ? '1px solid #e2e8f0' : 'none' 
                      }}>
                        <td style={{ padding: '12px 16px' }}>{option}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                          <Input
                            type="number"
                            value={newQuestion.scores?.[option] || 0}
                            onChange={(e) => updateOptionScore(option, e.target.value)}
                            style={{ 
                              width: '60px', 
                              textAlign: 'center',
                              padding: '6px 8px'
                            }}
                          />
                        </td>
                        {newQuestion.type !== 'compliance' && newQuestion.type !== 'yesno' && (
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button 
                              type="button"
                              onClick={(e) => handleRemoveOption(i, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormGroup>
          )}
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '16px'
          }}>
            <input 
              type="checkbox"
              checked={newQuestion.required}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
              id="required-checkbox"
            />
            <Label htmlFor="required-checkbox" style={{ marginBottom: 0 }}>Required</Label>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px', 
            marginTop: '20px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px'
          }}>
            <Button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                setShowAddManual(false);
              }}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '500'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="primary"
              onClick={handleAddManualQuestion}
              disabled={!newQuestion.text.trim()}
              style={{
                background: '#1a237e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '500'
              }}
            >
              Add Question
            </Button>
          </div>
        </div>
      )}
      
      {questions.length === 0 && !showAddManual ? (
        <EmptyState>
          <p>No pre-inspection questions added yet</p>
          <p>Add questions from the library or manually</p>
        </EmptyState>
      ) : (
        <QuestionList>
          {questions.map((question, index) => (
            <QuestionItem key={index}>
              <QuestionText>
                {question.text}
                <RequiredBadge required={question.required}>
                  {question.required ? 'Required' : 'Optional'}
                </RequiredBadge>
              </QuestionText>
              <QuestionType>
                {getTypeLabel(question.type)}
              </QuestionType>
              
              {question.options && question.options.length > 0 && (
                <QuestionOptions>
                  {question.options.map((option, i) => (
                    <QuestionOption key={i}>{option}</QuestionOption>
                  ))}
                </QuestionOptions>
              )}
              
              <QuestionActions>
                <IconButton type="button" onClick={(e) => handleRemoveQuestion(index, e)}>
                  <Trash2 size={16} />
                </IconButton>
              </QuestionActions>
            </QuestionItem>
          ))}
        </QuestionList>
      )}
      
      {!showAddManual && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <AddQuestionButton type="button" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Library button clicked');
            setShowLibrary(true);
            setShowAddManual(false);
          }}>
            <Plus size={16} /> Select from Library
          </AddQuestionButton>
          
          <AddQuestionButton type="button" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Manual button clicked');
            setShowAddManual(true);
            setShowLibrary(false);
          }}>
            <Plus size={16} /> Add Manually
          </AddQuestionButton>
        </div>
      )}
    </QuestionContainer>
  );
};

const TaskForm = ({ 
  initialData = {}, 
  onCancel, 
  submitButtonText = 'Save',
  isSubmitting: propIsSubmitting = false,
  usersProp = [],
  inspectionLevelsProp = [],
  assetsProp = []
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const stateUsers = useSelector(state => state.users.users);
  const stateInspectionLevels = useSelector(state => state.inspectionLevels?.levels?.results);
  const stateAssets = useSelector(state => state.assets?.allAssetsForDropdown);

  let users = usersProp.length > 0 ? usersProp : stateUsers;
  users = users?.filter(user => user.role === 'inspector');
  const inspectionLevels = inspectionLevelsProp.length > 0 ? inspectionLevelsProp : stateInspectionLevels;
  const assets = assetsProp.length > 0 ? assetsProp : stateAssets;

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'open',
    dueDate: initialData.dueDate || initialData.deadline ? new Date(initialData.dueDate || initialData.deadline) : null,
    location: initialData.location || '',
    assignedTo: initialData.assignedTo || [],
    inspectionLevel: initialData.inspectionLevel?.id || initialData.inspectionLevel?._id || initialData.inspectionLevel || '',
    asset: initialData.asset?.id || initialData.asset?._id || initialData.asset || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    attachments: initialData.attachments || [],
    preInspectionQuestions: initialData.preInspectionQuestions || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  useEffect(() => {
    if (!initialData?.assignedTo) return;
    
    console.log('Initial assignedTo:', initialData.assignedTo);
    
    try {
      // Extract user ID from initialData.assignedTo
      if (Array.isArray(initialData.assignedTo) && initialData.assignedTo.length > 0) {
        const assignedUser = initialData.assignedTo[0];
        
        if (typeof assignedUser === 'string') {
          setSelectedUserId(assignedUser);
          console.log('Set selectedUserId from string:', assignedUser);
        } 
        else if (assignedUser && typeof assignedUser === 'object') {
          const userId = assignedUser.id || assignedUser._id;
          if (userId) {
            setSelectedUserId(userId);
            console.log('Set selectedUserId from object:', userId);
          }
        }
      }
    } catch (error) {
      console.error('Error extracting user ID:', error);
    }
  }, [initialData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is selected
    if (!selectedUserId) {
      setErrors(prev => ({
        ...prev,
        assignedTo: 'User assignment is required'
      }));
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get task ID - handle both id and _id formats
      const taskId = initialData?.id || initialData?._id;
      
      // Check if pre-inspection questions have been added or modified
      const isQuestionsChanged = !initialData || 
        !initialData.preInspectionQuestions || 
        formData.preInspectionQuestions.length !== initialData.preInspectionQuestions.length;
      
      let formattedPreInspectionQuestions = [];
      
      // For edit mode, use form data directly (localStorage is handled in TaskEdit)
      if (taskId && isQuestionsChanged) {
        formattedPreInspectionQuestions = Array.isArray(formData.preInspectionQuestions)
          ? formData.preInspectionQuestions.map(q => {
              // Create a clean question object without any undefined/null values
              const cleanQuestion = {
                text: q.text,
                type: q.type,
                options: q.options || [],
                required: q.required !== undefined ? q.required : true
              };
              
              // Preserve _id if it exists
              if (q._id) {
                cleanQuestion._id = q._id;
              }
              
              // Include scoring if it exists
              if (q.scoring) {
                cleanQuestion.scoring = q.scoring;
              }
              
              // Include scores if they exist
              if (q.scores) {
                cleanQuestion.scores = q.scores;
              }
              
              return cleanQuestion;
            })
          : [];
        
        console.log('Formatted pre-inspection questions for edit:', JSON.stringify(formattedPreInspectionQuestions));
      } else if (!taskId) {
        // For new tasks, use form data directly
        formattedPreInspectionQuestions = Array.isArray(formData.preInspectionQuestions)
          ? formData.preInspectionQuestions.map(q => {
              // Create a clean question object without any undefined/null values
              const cleanQuestion = {
                text: q.text,
                type: q.type,
                options: q.options || [],
                required: q.required !== undefined ? q.required : true
              };
              
              // Preserve _id if it exists
              if (q._id) {
                cleanQuestion._id = q._id;
              }
              
              // Include scoring if it exists
              if (q.scoring) {
                cleanQuestion.scoring = q.scoring;
              }
              
              // Include scores if they exist
              if (q.scores) {
                cleanQuestion.scores = q.scores;
              }
              
              return cleanQuestion;
            })
          : [];
        
        console.log('Formatted pre-inspection questions for new task:', JSON.stringify(formattedPreInspectionQuestions));
      }
      
      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status || 'open',
        deadline: formData.dueDate,
        location: formData.location || '',
        assignedTo: selectedUserId ? [selectedUserId] : [], // Use selectedUserId
        inspectionLevel: formData.inspectionLevel || null,
        asset: formData.asset || null,
        isActive: formData.isActive,
        attachments: formData.attachments || []
      };
      
      // Include preInspectionQuestions in the payload if we have any questions
      if (formattedPreInspectionQuestions.length > 0) {
        taskData.preInspectionQuestions = formattedPreInspectionQuestions;
      }
      
      console.log('Task data for submission:', JSON.stringify(taskData));
      
      // Call API to create or update task
      if (initialData && taskId) {
        // Ensure we have a valid ID before attempting update
        if (taskId === 'undefined') {
          throw new Error('Invalid task ID for update operation');
        }
        
        console.log('Updating task with ID:', taskId);
        
        // For updates, ensure we're passing the correct ID and data format
        const updateResult = await dispatch(updateTask({ 
          id: taskId, 
          data: taskData 
        })).unwrap();
        
        if (updateResult) {
          // Log task update
          await FrontendLogger.logActivity({
            action: 'task_updated',
            description: `Updated task: ${taskData.title}`,
            module: 'tasks',
            details: { taskId, title: taskData.title, changes: taskData }
          });
          
          // Clear localStorage data after successful update
          localStorage.removeItem(`task_${taskId}_preinspection`);
          console.log('Cleared localStorage data for task:', taskId);
          
          toast.success('Task updated successfully');
          if (onCancel) onCancel(updateResult); // Pass the updated task back
        }
      } else {
        console.log('Creating new task');
        
        const createResult = await dispatch(createTask(taskData)).unwrap();
        
        // Log task creation
        await FrontendLogger.logActivity({
          action: 'task_created',
          description: `Created new task: ${taskData.title}`,
          module: 'tasks',
          details: { taskId: createResult._id || createResult.id, title: taskData.title, assignedTo: taskData.assignedTo }
        });
        
        if (onCancel) onCancel(createResult); // Pass the created task back
      }
    } catch (error) {
      console.error('Error in task form submission:', error);
      toast.error(`Failed to ${initialData?.id || initialData?._id ? 'update' : 'create'} task: ${error.message || 'Error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Deadline is required';
    }
    
    if (!selectedUserId) {
      newErrors.assignedTo = 'User assignment is required';
    }
    
    if (!formData.inspectionLevel) {
      newErrors.inspectionLevel = 'A template must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCancel = () => {
    if (onCancel) onCancel();
  };
  
  const handleAttachmentChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // If task already exists, include the task ID
      const payload = initialData._id 
        ? { id: initialData._id, file } 
        : { file };
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      const result = await dispatch(uploadTaskAttachment(payload)).unwrap();
      
      if (result && result.data) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, result.data]
        }));
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Upload error details:', error.message);
      if (!error.message) {
        toast.error('Error uploading file');
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };
  
  const handleRemoveAttachment = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };
  
  const handlePreInspectionQuestionsChange = (questions) => {
    setFormData(prev => ({
      ...prev,
      preInspectionQuestions: questions
    }));
  };
  
  useEffect(() => {
    // Fetch users if not provided as props
    if (usersProp.length === 0) {
      // Add a flag to prevent multiple calls
      const localStorageKey = 'usersFetchInitiated';
      const fetchInitiated = sessionStorage.getItem(localStorageKey);
      
      if (!fetchInitiated) {
        sessionStorage.setItem(localStorageKey, 'true');
        dispatch(fetchUsers())
          .unwrap()
          .catch(error => {
            console.error('Error fetching users:', error);
          })
          .finally(() => {
            // Reset after 10 seconds to allow refetching if needed
            setTimeout(() => {
              sessionStorage.removeItem(localStorageKey);
            }, 10000);
          });
      }
    }
    
    // Fetch inspection levels if not provided as props
    if (inspectionLevelsProp.length === 0) {
      // Add a flag to prevent multiple calls
      const localStorageKey = 'inspectionLevelsFetchInitiated';
      const fetchInitiated = sessionStorage.getItem(localStorageKey);
      
      if (!fetchInitiated) {
        sessionStorage.setItem(localStorageKey, 'true');
        dispatch(fetchInspectionLevels())
          .unwrap()
          .catch(error => {
            console.error('Error fetching inspection levels:', error);
          })
          .finally(() => {
            // Reset after 10 seconds to allow refetching if needed
            setTimeout(() => {
              sessionStorage.removeItem(localStorageKey);
            }, 10000);
          });
      }
    }
    
    // Fetch assets for dropdown if not provided as props
    if (assetsProp.length === 0) {
      // Add a flag to prevent multiple calls
      const localStorageKey = 'assetsDropdownFetchInitiated';
      const fetchInitiated = sessionStorage.getItem(localStorageKey);
      
      if (!fetchInitiated) {
        sessionStorage.setItem(localStorageKey, 'true');
        dispatch(fetchAllAssetsForDropdown())
          .unwrap()
          .catch(error => {
            console.error('Error fetching assets for dropdown:', error);
          })
          .finally(() => {
            // Reset after 10 seconds to allow refetching if needed
            setTimeout(() => {
              sessionStorage.removeItem(localStorageKey);
            }, 10000);
          });
      }
    }
  }, [usersProp.length, inspectionLevelsProp.length, assetsProp.length, dispatch]);
  
  // Define a better check for initialData format in useEffect
  useEffect(() => {
    console.log('TaskForm initialData updated:', initialData);
    
    // Log data.data or data directly depending on structure
    if (initialData) {
      // Check for nested data structure (could be data.data pattern)
      const taskData = initialData.data && typeof initialData.data === 'object' 
        ? initialData.data 
        : initialData;
        
      console.log('Using task data:', taskData);
      
      // Extract preInspectionQuestions from the correct location
      const questions = taskData.preInspectionQuestions;
      
      if (questions) {
        console.log('Found preInspectionQuestions:', questions);
        console.log('Type:', typeof questions);
        console.log('Is array:', Array.isArray(questions));
        console.log('Length:', questions?.length);
        
        if (Array.isArray(questions) && questions.length > 0) {
          // Create a deep copy to avoid reference issues
          const questionsCopy = JSON.parse(JSON.stringify(questions));
          
          // Store pre-inspection questions in localStorage for this task
          const taskId = taskData.id || taskData._id;
          if (taskId) {
            localStorage.setItem(`task_${taskId}_preinspection`, JSON.stringify(questionsCopy));
            console.log('Stored pre-inspection questions in localStorage for task:', taskId);
          }
          
          // Update form data with the pre-inspection questions
          setFormData(prev => ({
            ...prev,
            preInspectionQuestions: questionsCopy
          }));
          
          console.log('Updated formData with questions copy');
        } else {
          console.log('No questions to update or not in expected format');
        }
      } else {
        console.log('No preInspectionQuestions found in task data');
      }
    } else {
      console.log('initialData is null or undefined');
    }
  }, [initialData]);

  // Update the component rendering to check for data in both initialData and initialData.data
  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <FormGroup>
          <Label>Title</Label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label>Description</Label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={4}
          required
        />
        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label>Priority</Label>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Deadline</Label>
          <DatePicker
            selected={formData.dueDate}
            onChange={date => setFormData(prev => ({ ...prev, dueDate: date }))}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select deadline date and time"
            minDate={new Date()}
            required
          />
          {errors.dueDate && <ErrorMessage>{errors.dueDate}</ErrorMessage>}
        </FormGroup>
      </FormRow>
      
      <FormGroup>
        <Label>Location</Label>
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location (optional)"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Assigned User</Label>
        <Select
          name="assignedUser"
          value={selectedUserId}
          onChange={(e) => {
            const userId = e.target.value;
            console.log('User selection changed to:', userId);
            setSelectedUserId(userId);
            
            // We don't update formData.assignedTo here to avoid re-renders
            // It will be collected in handleSubmit
          }}
          required
        >
          <option value="">Select User</option>
          {users?.map(user => {
            const userIdValue = user.id || user._id;
            return (
              <option key={userIdValue} value={userIdValue}>
                {user.name || user.email || 'Unknown user'}
              </option>
            );
          })}
        </Select>
        {errors.assignedTo && <ErrorMessage>{errors.assignedTo}</ErrorMessage>}
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label>Template</Label>
          <Select
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Template</option>
            {inspectionLevels?.filter(level => level.status === 'active').map(level => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </Select>
          {errors.inspectionLevel && <ErrorMessage>{errors.inspectionLevel}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>Asset</Label>
          <Select
            name="asset"
            value={formData.asset}
            onChange={handleChange}
          >
            <option value="">Select Asset (Optional)</option>
            {assets?.map(asset => (
              <option key={asset._id || asset.id} value={asset._id || asset.id}>
                {asset.displayName || asset.uniqueId} - {asset.type}
              </option>
            ))}
          </Select>
        </FormGroup>
      </FormRow>

      <FormGroup>
        <ToggleSwitch>
          <ToggleIndicator 
            checked={formData.isActive}
            onClick={() => setFormData(prev => ({
              ...prev,
              isActive: !prev.isActive
            }))}
          />
          <span>Active</span>
        </ToggleSwitch>
      </FormGroup>

      <AdvancedToggle 
        type="button" 
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          setShowAdvanced(!showAdvanced);
        }}
      >
        <span>Advanced Options</span>
        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </AdvancedToggle>
      
      {showAdvanced && (
        <>
          <FormGroup>
            <Label>Attachments</Label>
            <AttachmentList>
              {formData.attachments.map((attachment, index) => {
                console.log('Attachment data:', attachment); // Debug log
                
                const isImage = attachment.contentType?.startsWith('image/') || 
                               attachment.type?.startsWith('image/') || 
                               attachment.filename?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                const isDocument = attachment.contentType?.includes('pdf') || 
                                  attachment.contentType?.includes('document') ||
                                  attachment.type?.includes('pdf') || 
                                  attachment.type?.includes('document') ||
                                  attachment.filename?.match(/\.(pdf|doc|docx|txt)$/i);
                
                console.log('Is image:', isImage, 'Is document:', isDocument); // Debug log
                
                return (
                  <AttachmentItem key={index}>
                    {isImage ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename || 'Preview'} 
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}
                          onError={(e) => {
                            console.log('Image failed to load:', attachment.url);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <File size={16} style={{ display: 'none' }} />
                        <span>{attachment.filename || 'Image'}</span>
                      </div>
                    ) : (
                      <>
                        <File size={16} />
                        <span>{attachment.filename || 'Attachment'}</span>
                      </>
                    )}
                    <AttachmentActions>
                      <IconButton 
                        type="button" 
                        title="Remove"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                      {attachment.url && (
                        <IconButton 
                          type="button" 
                          as="a" 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title={isImage ? "View Image" : isDocument ? "Open Document" : "Open File"}
                        >
                          <ExternalLink size={14} />
                        </IconButton>
                      )}
                    </AttachmentActions>
                  </AttachmentItem>
                );
              })}
              
              <AttachmentUpload>
                <input 
                  type="file" 
                  id="file-upload" 
                  onChange={handleAttachmentChange} 
                  style={{ display: 'none' }}
                />
                <UploadButton 
                  type="button" 
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {isUploading ? <Spinner size={16} /> : <Plus size={16} />}
                  <span>{isUploading ? 'Uploading...' : 'Add Attachment'}</span>
                </UploadButton>
              </AttachmentUpload>
            </AttachmentList>
          </FormGroup>
        </>
      )}
      
      
      <PreInspectionQuestions 
        questions={formData.preInspectionQuestions} 
        onChange={handlePreInspectionQuestionsChange}
        initialQuestions={initialData.preInspectionQuestions || 
                      (initialData.data && initialData.data.preInspectionQuestions) || 
                      []}
        isEditMode={!!initialData && !!initialData._id}
      />
      
      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? <Spinner size={16} /> : null}
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default TaskForm;