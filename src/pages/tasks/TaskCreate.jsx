import React from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskForm from './components/TaskForm';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
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

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TaskCreate = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/tasks')}>
          <ArrowLeft size={18} />
          Back to Tasks
        </BackButton>
        <PageTitle>Create New Task</PageTitle>
        <SubTitle>Create a new inspection task</SubTitle>
      </Header>

      <FormContainer>
        <TaskForm 
          onCancel={handleCancel} 
          
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskCreate;