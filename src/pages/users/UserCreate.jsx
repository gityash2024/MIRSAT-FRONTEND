/* This code snippet is a React component called `UserCreate` that represents a page for creating a new
user in a system. Here's a breakdown of what the code is doing: */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, UserPlus } from 'lucide-react';
import UserForm from './components/UserForm';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import api from '../../services/api';

const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;

  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
  }

  .icon {
    opacity: 0.7;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const CreateConfirmDialog = styled.div`
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
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 6px;
  }
`;

const DialogMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
  }
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

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const UserCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  if (!hasPermission(PERMISSIONS.CREATE_USER)) {
    navigate('/users');
    return null;
  }

  const handleSubmit = (formData) => {
    setConfirmData(formData);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/users', confirmData);
      toast.success('User created successfully');
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/users')}>
        <ArrowLeft size={18} />
        {t('common.backToUsers')}
      </BackButton>

      <Header>
        <PageTitle>
          <UserPlus size={24} className="icon" />
          {t('common.createNewUser')}
        </PageTitle>
        <SubTitle>{t('common.addNewUser')}</SubTitle>
      </Header>

      <UserForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/users')}
        submitButtonText={t('common.createUser')}
        isSubmitting={isSubmitting}
      />

      {confirmData && (
        <CreateConfirmDialog>
          <DialogContent>
            <DialogTitle>{t('common.confirmUserCreation')}</DialogTitle>
            <DialogMessage>
              {t('common.areYouSureYouWantToCreate')}
              <br /><br />
              {t('common.name')}: {confirmData.name}
              <br />
              {t('common.email')}: {confirmData.email}
              <br />
              {t('common.role')}: {confirmData.role?.toUpperCase()}
            </DialogMessage>
            <DialogActions>
              <Button 
                variant="secondary" 
                onClick={() => setConfirmData(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Confirm'}
              </Button>
            </DialogActions>
          </DialogContent>
        </CreateConfirmDialog>
      )}
    </PageContainer>
  );
};

export default UserCreate;