import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Layers, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
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
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
`;

const FooterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
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
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f5f7fb;
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SubLevelEditModal = ({ subLevel, onClose, onSave, loading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: subLevel?.name || '',
    description: subLevel?.description || '',
    order: subLevel?.order || 0
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!validateForm()) {
      return;
    }
    
    // Ensure we preserve all original fields, especially the _id
    const updatedSubLevel = {
      ...subLevel,
      name: formData.name,
      description: formData.description,
      order: parseInt(formData.order, 10) || 0
    };
    
    // Log the data being sent for debugging
    console.log('Submitting updated sublevel:', {
      original: subLevel,
      updated: updatedSubLevel,
      hasId: !!updatedSubLevel._id
    });
    
    // Check if _id exists to avoid errors
    if (!updatedSubLevel._id) {
      console.error('Missing _id in the sub-level data');
      // If missing, try to find it in different properties
      if (subLevel.id) {
        updatedSubLevel._id = subLevel.id;
        console.log('Using id property as _id:', updatedSubLevel._id);
      } else {
        console.error('Cannot find any valid ID for this sub-level');
        return;
      }
    }
    
    onSave(updatedSubLevel);
  };
  
  if (!subLevel) return null;
  
  return (
    <ModalOverlay onClick={loading ? null : onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Layers size={20} />
            {t('inspections.editSubLevel')}
          </ModalTitle>
          <ModalCloseButton onClick={loading ? null : onClose} disabled={loading}>
            <X size={20} />
          </ModalCloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">{t('common.description')}</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="order">{t('common.order')}</Label>
            <Input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              disabled={loading}
            />
          </FormGroup>
          
          <FooterActions>
            <Button 
              type="button" 
              onClick={loading ? null : onClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? t('common.saving') : (
                <>
                  <Save size={16} />
                  {t('common.saveChanges')}
                </>
              )}
            </Button>
          </FooterActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SubLevelEditModal;