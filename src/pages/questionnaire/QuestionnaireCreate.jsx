import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Plus, X } from 'react-feather';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addQuestionToLibrary, fetchQuestionLibrary } from '../../store/slices/questionLibrarySlice';

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  
  &:hover {
    background-color: #f1f5f9;
    color: var(--color-navy);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: var(--color-navy);
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.primary && `
    background-color: var(--color-navy);
    color: white;
    border: none;
    
    &:hover {
      background-color: #3949ab;
    }
  `}
  
  ${props => props.secondary && `
    background-color: white;
    color: var(--color-navy);
    border: 1px solid #e2e8f0;
    
    &:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 16px;
  margin-bottom: 16px;
  
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
  color: #334155;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 1px var(--color-navy);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 1px var(--color-navy);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 1px var(--color-navy);
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  color: #334155;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const QuestionItem = styled.div`
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
`;

const QuestionTitle = styled.div`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #fee2e2;
    color: #dc2626;
  }
`;

const QuestionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;

const RequirementBadge = styled.span`
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${props => props.type === 'mandatory' ? '#FEE2E2' : '#DBEAFE'};
  color: ${props => props.type === 'mandatory' ? '#B91C1C' : '#1E40AF'};
  border: 1px solid ${props => props.type === 'mandatory' ? '#FECACA' : '#BFDBFE'};
  margin-left: 4px;
`;

const QuestionCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get question ID if editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get question library data for editing
  const { questions: libraryQuestions, loading: libraryLoading } = 
    useSelector(state => state.questionLibrary);
  
  const [question, setQuestion] = useState({
    text: '',
    answerType: 'yesno',
    options: [],
    required: true
  });
  
  // Fetch question data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadQuestion();
    }
  }, [id]);
  
  const loadQuestion = async () => {
    try {
      // First make sure we have the questions loaded
      if (libraryQuestions.length === 0) {
        await dispatch(fetchQuestionLibrary()).unwrap();
      }
      
      // Find the question in the state
      const questionToEdit = libraryQuestions.find(q => 
        (q.id === id) || (q._id === id)
      );
      
      if (questionToEdit) {
        setQuestion({
          ...questionToEdit,
          // If _id exists but id doesn't, use _id as id
          id: questionToEdit.id || questionToEdit._id
        });
      } else {
        toast.error('Question not found');
        navigate('/questionnaire');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Failed to load question data');
      navigate('/questionnaire');
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let updatedQuestion = { 
      ...question, 
      answerType: newType
    };
    
    // Add default options based on type
    if (['multiple_choice', 'select', 'radio', 'checkbox', 'dropdown'].includes(newType)) {
      updatedQuestion.options = updatedQuestion.options?.length ? updatedQuestion.options : ['Option 1', 'Option 2', 'Option 3'];
    } else if (newType === 'compliance') {
      updatedQuestion.options = [
        'Full compliance',
        'Partial compliance',
        'Non-compliant',
        'Not applicable'
      ];
    } else {
      // Reset options if changing to a type that doesn't need them
      updatedQuestion.options = [];
    }
    
    setQuestion(updatedQuestion);
  };
  
  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };
  
  const updateOption = (index, value) => {
    const options = [...question.options];
    options[index] = value;
    setQuestion(prev => ({
      ...prev,
      options
    }));
  };
  
  const removeOption = (index) => {
    const options = question.options.filter((_, i) => i !== index);
    setQuestion(prev => ({
      ...prev,
      options
    }));
  };
  
  const handleSubmit = async () => {
    if (!question.text.trim()) {
      toast.error('Question text is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the user info from localStorage if available
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to create a question');
        navigate('/login');
        return;
      }
      
      console.log('Adding/updating question in library:', question);
      
      // Use the Redux action to add the question to the library
      await dispatch(addQuestionToLibrary(question)).unwrap();
      
      toast.success(isEditing ? 'Question updated successfully' : 'Question added to library successfully');
      navigate('/questionnaire');
    } catch (error) {
      console.error('Error adding/updating question to library:', error);
      const errorMessage = typeof error === 'string' ? error : 
                          error.message || 
                          'Failed to add/update question to library';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={() => navigate('/questionnaire')}>
          <ChevronLeft size={16} />
          Back to Question Library
        </BackButton>
        <Title>{isEditing ? 'Edit Question' : 'Create Question'}</Title>
        <ActionButtons>
          <Button 
            primary 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isEditing ? 'Update Question' : 'Save Question'}
          </Button>
        </ActionButtons>
      </PageHeader>
      
      <FormCard>
        <CardTitle>Question Details</CardTitle>
        <FormRow>
          <FormGroup>
            <Label>Question Text *</Label>
            <TextArea
              name="text"
              value={question.text}
              onChange={handleChange}
              placeholder="Enter question text"
              rows={3}
              required
            />
          </FormGroup>
        </FormRow>
        
        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>Answer Type</Label>
            <Select 
              name="answerType" 
              value={question.answerType} 
              onChange={handleTypeChange}
            >
              <option value="yesno">Yes/No</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Dropdown/Select</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="radio">Radio Buttons</option>
              <option value="checkbox">Checkbox</option>
              <option value="dropdown">Dropdown</option>
              <option value="compliance">Compliance</option>
              <option value="date">Date</option>
              <option value="file">File Upload</option>
              <option value="location">Location</option>
              <option value="signature">Signature</option>
              <option value="media">Media Upload</option>
              <option value="slider">Slider</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Required</Label>
            <div style={{ marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="required" 
                name="required" 
                checked={question.required} 
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="required">This question is required</label>
            </div>
          </FormGroup>
        </FormRow>
        
        {['multiple_choice', 'select', 'radio', 'checkbox', 'dropdown', 'compliance'].includes(question.answerType) && (
          <FormRow>
            <FormGroup>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <Label>Options</Label>
                {question.answerType !== 'compliance' && (
                  <Button
                    type="button"
                    onClick={addOption}
                    style={{ padding: '4px 8px', fontSize: '13px' }}
                    secondary
                  >
                    <Plus size={14} />
                    Add Option
                  </Button>
                )}
              </div>
              
              {question.options.map((option, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '8px',
                  marginBottom: '8px',
                  alignItems: 'center'
                }}>
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    style={{ flex: 1 }}
                    readOnly={question.answerType === 'compliance'}
                  />
                  
                  {question.answerType !== 'compliance' && (
                    <button
                      onClick={() => removeOption(index)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px'
                      }}
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </FormGroup>
          </FormRow>
        )}
      </FormCard>
    </PageContainer>
  );
};

export default QuestionCreate; 