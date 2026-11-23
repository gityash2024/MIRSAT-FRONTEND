import { useMemo } from "react";
import { useCopy } from "../maintenance/shared";
import React from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

const TaskCreate = ({ workOrder = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const m = useCopy();
  const [params] = useSearchParams();
  const fromAsset = useLocation().state?.fromAsset;
  const backToAsset = workOrder && fromAsset?.tab === "tasks" && /^\/assets\/[^/?#]+(?:\/equipment\/[^/?#]+)?$/.test(fromAsset.path);
  const asset = workOrder ? params.get("asset") || "" : "";
  const initialData = useMemo(() => ({ asset }), [asset]);
  const handleCancel = () => {
    if (backToAsset) navigate(fromAsset.path, { state: { assetTab: "tasks" } });
    else navigate('/tasks');
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleCancel}>
          <ArrowLeft size={18} />
          {workOrder ? m(backToAsset ? 'Back to Asset' : 'Back to Work Orders') : t('common.backToTasks')}
        </BackButton>
        <PageTitle>{workOrder ? m('Create Work Order') : t('tasks.createNewTask')}</PageTitle>
      </Header>

      <FormContainer>
        <TaskForm
          onCancel={handleCancel}
          isEdit={false}
          workOrder={workOrder}
          initialData={workOrder ? initialData : undefined}
          submitButtonText={workOrder ? m('Create Work Order') : t('tasks.createTask')}
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskCreate;