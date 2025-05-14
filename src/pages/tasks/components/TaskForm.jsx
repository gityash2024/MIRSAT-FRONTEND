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
import { fetchAssets } from '../../../store/slices/assetSlice';
import { fetchQuestionLibrary } from '../../../store/slices/questionLibrarySlice';
import { v4 as uuidv4 } from 'uuid';

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
const PreInspectionQuestions = ({ questions = [], onChange }) => {
  const dispatch = useDispatch();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'text',
    options: [],
    required: true,
    scoring: {
      enabled: false,
      max: 2
    },
    scores: {}
  });
  const [newOption, setNewOption] = useState('');
  const { questions: libraryQuestions, loading } = useSelector(state => state.questionLibrary);
  
  useEffect(() => {
    dispatch(fetchQuestionLibrary());
  }, [dispatch]);
  
  const handleAddFromLibrary = (question, e) => {
    // Prevent form submission
    e.preventDefault();
    e.stopPropagation();
    
    const newQuestion = {
      text: question.text,
      type: question.answerType,
      options: question.options || [],
      required: question.required
    };
    
    onChange([...questions, newQuestion]);
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
    
    if (!newQuestion.text.trim()) return;
    
    onChange([...questions, { ...newQuestion }]);
    setNewQuestion({
      text: '',
      type: 'text',
      options: [],
      required: true,
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
      type: newType
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
          Pre-Inspection Questions
        </QuestionTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          <LibrarySelector>
            <LibraryButton type="button" onClick={(e) => {
              e.preventDefault();
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
            setShowLibrary(true);
            setShowAddManual(false);
          }}>
            <Plus size={16} /> Select from Library
          </AddQuestionButton>
          
          <AddQuestionButton type="button" onClick={(e) => {
            e.preventDefault();
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
  const stateAssets = useSelector(state => state.assets?.assets);

  let users = usersProp.length > 0 ? usersProp : stateUsers;
  users = users?.filter(user => user.role === 'inspector');
  const inspectionLevels = inspectionLevelsProp.length > 0 ? inspectionLevelsProp : stateInspectionLevels;
  const assets = assetsProp.length > 0 ? assetsProp : stateAssets;

  // Helper function to extract user IDs from various formats
  const extractUserIds = (assignedUsers) => {
    if (!assignedUsers || !Array.isArray(assignedUsers)) return [];
    
    return assignedUsers
      .filter(user => user != null)
      .map(user => {
        // Handle if user is directly an ID string
        if (typeof user === 'string') return user;
        // Handle if user is an object with _id
        if (user && user._id) return user._id;
        // Handle if user is directly an ID
        return user;
      })
      .filter(id => id && id !== 'undefined');
  };

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'open',
    dueDate: initialData.dueDate || initialData.deadline ? new Date(initialData.dueDate || initialData.deadline) : null,
    location: initialData.location || '',
    assignedTo: initialData.assignedTo?.length > 0 ? 
      (typeof initialData.assignedTo[0] === 'object' ? 
        [initialData.assignedTo[0].name || initialData.assignedTo[0].id || initialData.assignedTo[0]._id] : 
        initialData.assignedTo) : 
      [],
    inspectionLevel: initialData.inspectionLevel?.id || initialData.inspectionLevel?._id || '',
    asset: initialData.asset?.id || initialData.asset?._id || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    attachments: initialData.attachments || [],
    preInspectionQuestions: initialData.preInspectionQuestions || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useEffect(() => {
    // Debug logging for initialData
    console.log('Initial data passed to TaskForm:', initialData);
    if (initialData && initialData._id) {
      console.log('Task ID for form:', initialData._id);
    }
  }, [initialData]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get task ID - handle both id and _id formats
      const taskId = initialData?.id || initialData?._id;
      
      // Find the selected user
      let selectedUser = null;
      if (formData.assignedTo.length > 0) {
        // First, try to find user by name
        selectedUser = users.find(user => user.name === formData.assignedTo[0]);
        
        // If not found by name, try to find by ID
        if (!selectedUser) {
          selectedUser = users.find(user => 
            user.id === formData.assignedTo[0] || 
            user._id === formData.assignedTo[0]
          );
        }
      }
      
      // Get the user ID
      const selectedUserId = selectedUser ? 
        (selectedUser.id || selectedUser._id) : 
        (formData.assignedTo.length > 0 ? formData.assignedTo[0] : null);
      
      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.dueDate, // Map dueDate to deadline for backend compatibility
        location: formData.location || '',
        assignedTo: selectedUserId ? [selectedUserId] : [], // Send as array
        inspectionLevel: formData.inspectionLevel,
        asset: formData.asset || undefined, // Include asset ID if selected
        isActive: formData.isActive,
        attachments: formData.attachments,
        preInspectionQuestions: formData.preInspectionQuestions || [] // Include pre-inspection questions
      };
      
      console.log('Task data for submission:', taskData);
      
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
          if (onCancel) onCancel(updateResult); // Pass the updated task back
        }
      } else {
        console.log('Creating new task');
        
        const createResult = await dispatch(createTask(taskData)).unwrap();
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
    
    if (formData.assignedTo.length === 0 || !formData.assignedTo[0]) {
      newErrors.assignedTo = 'User assignment is required';
    }
    
    if (!formData.inspectionLevel) {
      newErrors.inspectionLevel = 'An inspection level must be selected';
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
    
    // Fetch assets if not provided as props
    if (assetsProp.length === 0) {
      // Add a flag to prevent multiple calls
      const localStorageKey = 'assetsFetchInitiated';
      const fetchInitiated = sessionStorage.getItem(localStorageKey);
      
      if (!fetchInitiated) {
        sessionStorage.setItem(localStorageKey, 'true');
        dispatch(fetchAssets())
          .unwrap()
          .catch(error => {
            console.error('Error fetching assets:', error);
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
          value={formData.assignedTo.length > 0 ? formData.assignedTo[0] : ''}
          onChange={(e) => {
            const userId = e.target.value;
            setFormData(prev => ({
              ...prev,
              assignedTo: userId ? [userId] : []
            }));
          }}
          required
        >
          <option value="">Select User</option>
          {users?.map(user => (
            <option key={user._id} value={user._id}>
              {user.name || user.email || 'Unknown user'}
            </option>
          ))}
        </Select>
        {errors.assignedTo && <ErrorMessage>{errors.assignedTo}</ErrorMessage>}
      </FormGroup>
      
      <FormRow>
        <FormGroup>
          <Label>Inspection Level</Label>
          <Select
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Inspection Level</option>
            {inspectionLevels?.map(level => (
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
              <option key={asset.id} value={asset.id}>
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
              {formData.attachments.map((attachment, index) => (
                <AttachmentItem key={index}>
                  <File size={16} />
                  <span>{attachment.filename || 'Attachment'}</span>
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
                        title="Open"
                      >
                        <ExternalLink size={14} />
                      </IconButton>
                    )}
                  </AttachmentActions>
                </AttachmentItem>
              ))}
              
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