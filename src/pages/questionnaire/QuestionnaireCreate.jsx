import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
  }
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 10px;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 8px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
  
  &:hover {
    background-color: #f1f5f9;
    color: var(--color-navy);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: var(--color-navy);
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
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
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
  font-size: 14px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
  
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 16px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 6px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 13px;
  }
  
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  font-family: inherit;

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 13px;
    min-height: 80px;
  }
  
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 13px;
  }
  
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 10px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get question ID if editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get question library data for editing
  const { questions: libraryQuestions, loading: libraryLoading } = 
    useSelector(state => state.questionLibrary);
  
  const [newOption, setNewOption] = useState('');
  const [question, setQuestion] = useState({
    text: '',
    answerType: 'yesno',
    options: [],
    scores: {},
    required: true,
    requirementType: 'mandatory'
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
    
    // Add default options based on type - always reset when changing types
    if (newType === 'multiple_choice') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      updatedQuestion.scores = {
        [t('common.option1')]: 0,
        [t('common.option2')]: 0,
        [t('common.option3')]: 0
      };
    } else if (newType === 'select') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      updatedQuestion.scores = {
        [t('common.option1')]: 0,
        [t('common.option2')]: 0,
        [t('common.option3')]: 0
      };
    } else if (newType === 'checkbox') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      // Checkbox doesn't have scoring (no scores)
      updatedQuestion.scores = {};
    } else if (newType === 'compliance') {
      updatedQuestion.options = [
        t('common.fullCompliance'),
        t('common.partialCompliance'),
        t('common.nonCompliant'),
        t('common.notApplicable')
      ];
      updatedQuestion.scores = {
        [t('common.fullCompliance')]: 2,
        [t('common.partialCompliance')]: 1,
        [t('common.nonCompliant')]: 0,
        [t('common.notApplicable')]: 0
      };
    } else {
      // Reset options if changing to a type that doesn't need them (text, number, date, signature, media, file)
      updatedQuestion.options = [];
      updatedQuestion.scores = {};
    }
    
    setQuestion(updatedQuestion);
  };
  
  const addOption = () => {
    if (newOption.trim()) {
      setQuestion(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()],
        scores: {
          ...(prev.scores || {}),
          [newOption.trim()]: 0
        }
      }));
      setNewOption('');
    } else {
      // If no newOption, add empty option like before
      setQuestion(prev => ({
        ...prev,
        options: [...(prev.options || []), '']
      }));
    }
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          flexWrap: 'wrap'
        }}>
        <BackButton onClick={() => navigate('/questionnaire')}>
          <ChevronLeft size={16} />
          {t('common.backToQuestionLibrary')}
        </BackButton>
          <Title style={{ flex: 1, minWidth: 0 }}>{isEditing ? t('common.editQuestion') : t('common.createQuestion')}</Title>
        </div>
        <ActionButtons>
          <Button 
            primary 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isEditing ? t('common.updateQuestion') : t('common.saveQuestion')}
          </Button>
        </ActionButtons>
      </PageHeader>
      
      <FormCard>
        <CardTitle>{t('common.questionDetails')}</CardTitle>
        <FormRow>
          <FormGroup>
            <Label>{t('common.questionText')} *</Label>
            <TextArea
              name="text"
              value={question.text}
              onChange={handleChange}
              placeholder={t('common.enterQuestionText')}
              rows={3}
              required
            />
          </FormGroup>
        </FormRow>
        
        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>{t('common.answerType')}</Label>
            <Select 
              name="answerType" 
              value={question.answerType} 
              onChange={handleTypeChange}
            >
              <option value="text">{t('common.text')}</option>
              <option value="number">{t('common.number')}</option>
              <option value="date">{t('common.date')}</option>
              <option value="yesno">{t('common.yesNo')}</option>
              <option value="select">{t('common.select')}</option>
              <option value="multiple_choice">{t('common.multipleChoice')}</option>
              <option value="checkbox">{t('common.checkbox')}</option>
              <option value="compliance">{t('common.compliance')}</option>
              <option value="signature">{t('common.signature')}</option>
              <option value="media">{t('common.mediaUpload')}</option>
              <option value="file">{t('common.fileUpload')}</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>{t('common.requirementType')}</Label>
            <Select 
              name="requirementType" 
              value={question.requirementType || 'mandatory'} 
              onChange={handleChange}
            >
              <option value="mandatory">{t('common.mandatory')}</option>
              <option value="recommended">{t('common.recommended')}</option>
            </Select>
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label>Required</Label>
            <div style={{ 
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              <input 
                type="checkbox" 
                id="required" 
                name="required" 
                checked={question.required} 
                onChange={handleChange}
                style={{ 
                  marginRight: '0',
                  flexShrink: 0,
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="required"
                style={{
                  margin: 0,
                  cursor: 'pointer',
                  fontSize: '14px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  flex: 1,
                  minWidth: 0
                }}
              >
                {t('common.thisQuestionIsRequired')}
              </label>
            </div>
          </FormGroup>
        </FormRow>
        
        {['multiple_choice', 'select', 'compliance', 'checkbox'].includes(question.answerType) && (
          <FormRow>
            <FormGroup>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <Label>{t('tasks.options')}</Label>
                {question.answerType !== 'compliance' && question.answerType !== 'checkbox' && (
                  <button
                    type="button"
                    onClick={addOption}
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
                    <Plus size={14} /> {t('tasks.addOption')}
                  </button>
                )}
              </div>

              {question.answerType !== 'compliance' && question.answerType !== 'checkbox' && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder={t('tasks.enterOption')}
                    style={{ flex: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newOption.trim()) {
                          addOption();
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newOption.trim()) {
                        addOption();
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--color-navy)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}

              {/* Options table with scores - matching TaskForm */}
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
                      }}>{t('tasks.option')}</th>
                      {question.answerType !== 'checkbox' && (
                        <th style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          fontSize: '14px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>{t('tasks.score')}</th>
                      )}
                      {question.answerType !== 'compliance' && question.answerType !== 'checkbox' && (
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
                    {question.options.map((option, i) => (
                      <tr key={i} style={{
                        borderBottom: i < question.options.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <td style={{ padding: '12px 16px' }}>
                          {question.answerType === 'compliance' || question.answerType === 'checkbox' ? (
                            question.answerType === 'checkbox' ? (
                              <Input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(i, e.target.value)}
                                placeholder={`${t('tasks.option')} ${i + 1}`}
                                style={{ width: '100%', border: 'none', padding: '0', background: 'transparent' }}
                              />
                            ) : (
                              option
                            )
                          ) : (
                            <Input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(i, e.target.value)}
                              placeholder={`${t('tasks.option')} ${i + 1}`}
                              style={{ width: '100%', border: 'none', padding: '0', background: 'transparent' }}
                            />
                          )}
                        </td>
                        {question.answerType !== 'checkbox' && (
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <Input
                              type="number"
                              value={question.scores?.[option] || 0}
                              onChange={(e) => {
                                const value = e.target.value;
                                setQuestion(prev => ({
                                  ...prev,
                                  scores: {
                                    ...(prev.scores || {}),
                                    [option]: value === '' ? '' : parseInt(value) || 0
                                  }
                                }));
                              }}
                              style={{
                                width: '60px',
                                textAlign: 'center',
                                padding: '6px 8px'
                              }}
                            />
                          </td>
                        )}
                        {question.answerType !== 'compliance' && question.answerType !== 'checkbox' && (
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeOption(i)}
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
                              <X size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormGroup>
          </FormRow>
        )}
      </FormCard>
    </PageContainer>
  );
};

export default QuestionCreate; 