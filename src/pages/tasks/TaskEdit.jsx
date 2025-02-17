import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TaskForm from './components/TaskForm';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskById } from '../../store/slices/taskSlice';

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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const TaskEdit = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTask: task, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(getTaskById(taskId));
  }, [taskId, dispatch]);

  const handleCancel = () => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>Loading task details...</LoadingContainer>
      </PageContainer>
    );
  }

  if (!task) {
    return (
      <PageContainer>
        <LoadingContainer>Task not found</LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(`/tasks/${taskId}`)}>
          <ArrowLeft size={18} />
          Back to Task
        </BackButton>
        <PageTitle>Edit Task</PageTitle>
        <SubTitle>Update task details and information</SubTitle>
      </Header>

      <FormContainer>
        <TaskForm 
          initialData={task}
          onCancel={handleCancel}
          submitButtonText="Save Changes"
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskEdit;