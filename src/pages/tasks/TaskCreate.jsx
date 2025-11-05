import React from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TaskForm from './components/TaskForm';

const PageContainer = styled.div`
  padding: 24px;
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

const Header = styled.div`
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
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
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 6px 0;
    margin-bottom: 12px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

  &:hover {
    color: #333;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
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

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const TaskCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          {t('common.backToTasks')}
        </BackButton>
        <PageTitle>{t('tasks.createNewTask')}</PageTitle>
        <SubTitle>{t('tasks.createNewInspectionTask')}</SubTitle>
      </Header>

      <FormContainer>
        <TaskForm 
          onCancel={handleCancel} 
          isEdit={false}
          submitButtonText={t('tasks.createTask')}
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskCreate;