import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Plus, X } from 'react-feather';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';

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

const QuestionnaireCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'safety',
    status: 'draft',
    questions: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'text',
    required: false,
    requirementType: 'mandatory',
    weight: 1,
    options: []
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast.error('Question text is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));
    
    setCurrentQuestion({
      text: '',
      type: 'text',
      required: false,
      requirementType: 'mandatory',
      weight: 1,
      options: []
    });
  };
  
  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the user info from localStorage if available
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to create a questionnaire');
        navigate('/login');
        return;
      }
      
      console.log('Sending questionnaire data:', formData);
      
      const response = await axios.post(`${API_BASE_URL}/questionnaires`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Questionnaire creation response:', response.data);
      
      toast.success('Questionnaire created successfully');
      navigate('/questionnaire');
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          'Failed to create questionnaire';
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
          Back to Questionnaires
        </BackButton>
        <Title>Create Questionnaire</Title>
        <ActionButtons>
          <Button 
            primary 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} />
            Save Questionnaire
          </Button>
        </ActionButtons>
      </PageHeader>
      
      <FormCard>
        <CardTitle>Basic Information</CardTitle>
        <FormRow>
          <FormGroup>
            <Label>Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter questionnaire title"
              required
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>Category</Label>
            <Select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              style={{ 
                borderLeft: `4px solid ${
                  formData.category === 'safety' ? '#B91C1C' : 
                  formData.category === 'health' ? '#166534' : 
                  formData.category === 'environment' ? '#0369A1' :
                  formData.category === 'quality' ? '#B45309' : '#94A3B8'
                }`
              }}
            >
              <option value="safety" style={{color: '#B91C1C'}}>Safety</option>
              <option value="health" style={{color: '#166534'}}>Health</option>
              <option value="environment" style={{color: '#0369A1'}}>Environment</option>
              <option value="quality" style={{color: '#B45309'}}>Quality</option>
              <option value="other" style={{color: '#94A3B8'}}>Other</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Status</Label>
            <Select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={{ 
                borderLeft: `4px solid ${formData.status === 'draft' ? '#B45309' : '#166534'}`
              }}
            >
              <option value="draft" style={{color: '#B45309'}}>Draft</option>
              <option value="published" style={{color: '#166534'}}>Published</option>
            </Select>
          </FormGroup>
        </FormRow>
      </FormCard>
      
      <FormCard>
        <CardTitle>Questions</CardTitle>
        
        <QuestionList>
          {formData.questions.map((question, index) => (
            <QuestionItem key={index}>
              <QuestionHeader>
                <QuestionTitle>
                  <span>Question {index + 1}</span>
                  <RequirementBadge type={question.requirementType}>
                    {question.requirementType === 'mandatory' ? 'Mandatory' : 'Recommended'}
                  </RequirementBadge>
                </QuestionTitle>
                <RemoveButton onClick={() => removeQuestion(index)}>
                  <X size={16} />
                </RemoveButton>
              </QuestionHeader>
              
              <QuestionContent>
                <div>{question.text}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Type: {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                  {question.weight > 1 && ` • Weight: ${question.weight}`}
                </div>
              </QuestionContent>
            </QuestionItem>
          ))}
          
          <FormCard style={{ marginTop: '16px' }}>
            <CardTitle>Add New Question</CardTitle>
            
            <FormRow>
              <FormGroup>
                <Label>Question Text *</Label>
                <Input
                  name="text"
                  value={currentQuestion.text}
                  onChange={handleQuestionChange}
                  placeholder="Enter question text"
                />
              </FormGroup>
            </FormRow>
            
            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <Label>Question Type</Label>
                <Select 
                  name="type" 
                  value={currentQuestion.type} 
                  onChange={handleQuestionChange}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="yesno">Yes/No</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="compliance">Compliance</option>
                  <option value="file">File</option>
                  <option value="date">Date</option>
                </Select>
                <HelpText>Select the type of answer expected for this question</HelpText>
              </FormGroup>
              
              <FormGroup>
                <Label>Requirement Type</Label>
                <Select
                  name="requirementType"
                  value={currentQuestion.requirementType}
                  onChange={handleQuestionChange}
                  style={{ 
                    borderLeft: `4px solid ${
                      currentQuestion.requirementType === 'recommended' ? '#1E40AF' : '#B91C1C'
                    }`
                  }}
                >
                  <option value="mandatory" style={{color: '#B91C1C'}}>
                    Mandatory
                  </option>
                  <option value="recommended" style={{color: '#1E40AF'}}>
                    Recommended
                  </option>
                </Select>
                <HelpText>Is this question required or recommended?</HelpText>
              </FormGroup>
              
              <FormGroup>
                <Label>Question Weight</Label>
                <Input
                  type="number"
                  name="weight"
                  value={currentQuestion.weight}
                  onChange={handleQuestionChange}
                  min="1"
                  max="10"
                />
                <HelpText>Higher weight gives the question more importance in scoring</HelpText>
              </FormGroup>
            </FormRow>
            
            <Button primary onClick={addQuestion} style={{ marginTop: '16px' }}>
              <Plus size={16} />
              Add Question
            </Button>
          </FormCard>
        </QuestionList>
      </FormCard>
    </PageContainer>
  );
};

export default QuestionnaireCreate; 