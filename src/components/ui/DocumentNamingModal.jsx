import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, FileText, Download, Calendar, User, Tag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Z_INDEX } from '../../utils/zIndex';
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
  z-index: ${Z_INDEX.MODAL_OVERLAY};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  margin: 0 16px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #333;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const PreviewSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const PreviewText = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #1e293b;
  word-break: break-all;
`;

const CriteriaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const CriteriaItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: #f9fafb;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

    &:hover:not(:disabled) {
      background: #151b4f;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover:not(:disabled) {
      background: #f5f7fb;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `}
`;

const DocumentNamingModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  exportFormat = 'pdf',
  documentType = 'Report',
  defaultCriteria = []
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [namingCriteria, setNamingCriteria] = useState({
    documentType: true,
    currentDate: true,
    currentTime: false,
    username: false,
    userRole: false,
    customText: false
  });

  const [customText, setCustomText] = useState('');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('HH-MM');

  useEffect(() => {
    if (defaultCriteria.length > 0) {
      const criteria = {};
      defaultCriteria.forEach(criterion => {
        criteria[criterion] = true;
      });
      setNamingCriteria(prev => ({ ...prev, ...criteria }));
    }
  }, [defaultCriteria]);

  const handleCriteriaChange = (criterion) => {
    setNamingCriteria(prev => ({
      ...prev,
      [criterion]: !prev[criterion]
    }));
  };

  const generateFileName = () => {
    const parts = [];
    
    if (namingCriteria.documentType) {
      parts.push(documentType);
    }
    
    if (namingCriteria.currentDate) {
      const now = new Date();
      let dateStr = '';
      switch (dateFormat) {
        case 'YYYY-MM-DD':
          dateStr = now.toISOString().split('T')[0];
          break;
        case 'DD-MM-YYYY':
          dateStr = now.toLocaleDateString('en-GB').split('/').join('-');
          break;
        case 'MM-DD-YYYY':
          dateStr = now.toLocaleDateString('en-US').split('/').join('-');
          break;
        default:
          dateStr = now.toISOString().split('T')[0];
      }
      parts.push(dateStr);
    }
    
    if (namingCriteria.currentTime) {
      const now = new Date();
      let timeStr = '';
      switch (timeFormat) {
        case 'HH-MM':
          timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
          break;
        case 'HH-MM-SS':
          timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
          break;
        default:
          timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
      }
      parts.push(timeStr);
    }
    
    if (namingCriteria.username && user?.name) {
      parts.push(user.name.replace(/\s+/g, '-'));
    }
    
    if (namingCriteria.userRole && user?.role) {
      parts.push(user.role.toUpperCase());
    }
    
    if (namingCriteria.customText && customText.trim()) {
      parts.push(customText.trim().replace(/\s+/g, '-'));
    }
    
    const fileName = parts.join('_').replace(/[^\w\-]/g, '');
    return fileName || 'document';
  };

  const handleExport = () => {
    const fileName = generateFileName();
    onExport(fileName);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FileText size={20} />
            {t('common.exportDocumentSettings')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <FormSection>
          <SectionTitle>
            <Tag size={16} />
            {t('common.documentNamingCriteria')}
          </SectionTitle>
          
          <CriteriaGrid>
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.documentType}
                onChange={() => handleCriteriaChange('documentType')}
              />
              {t('common.documentType')} ({documentType})
            </CriteriaItem>
            
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.currentDate}
                onChange={() => handleCriteriaChange('currentDate')}
              />
              <Calendar size={14} />
              {t('common.currentDate')}
            </CriteriaItem>
            
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.currentTime}
                onChange={() => handleCriteriaChange('currentTime')}
              />
              {t('common.currentTime')}
            </CriteriaItem>
            
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.username}
                onChange={() => handleCriteriaChange('username')}
              />
              <User size={14} />
              {t('common.username')}
            </CriteriaItem>
            
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.userRole}
                onChange={() => handleCriteriaChange('userRole')}
              />
              {t('common.userRole')}
            </CriteriaItem>
            
            <CriteriaItem>
              <input
                type="checkbox"
                checked={namingCriteria.customText}
                onChange={() => handleCriteriaChange('customText')}
              />
              {t('common.customText')}
            </CriteriaItem>
          </CriteriaGrid>

          {namingCriteria.currentDate && (
            <FormGroup>
              <Label>{t('common.dateFormat')}</Label>
              <Select 
                value={dateFormat} 
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2025-01-08)</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY (08-01-2025)</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY (01-08-2025)</option>
              </Select>
            </FormGroup>
          )}

          {namingCriteria.currentTime && (
            <FormGroup>
              <Label>{t('common.timeFormat')}</Label>
              <Select 
                value={timeFormat} 
                onChange={(e) => setTimeFormat(e.target.value)}
              >
                <option value="HH-MM">HH-MM (14-30)</option>
                <option value="HH-MM-SS">HH-MM-SS (14-30-45)</option>
              </Select>
            </FormGroup>
          )}

          {namingCriteria.customText && (
            <FormGroup>
              <Label>{t('common.customText')}</Label>
              <Input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={t('common.enterCustomTextForFilename')}
                maxLength={50}
              />
            </FormGroup>
          )}
        </FormSection>

        <PreviewSection>
          <SectionTitle style={{ marginBottom: '8px', fontSize: '14px' }}>
            {t('common.previewFilename')}:
          </SectionTitle>
          <PreviewText>
            {generateFileName()}.{exportFormat}
          </PreviewText>
        </PreviewSection>

        <ButtonGroup>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleExport}>
            <Download size={16} />
            {t('common.exportPDF')}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DocumentNamingModal; 