import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import TaskForm from './components/TaskForm';
import { getTaskById } from '../../store/slices/taskSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { fetchAssets } from '../../store/slices/assetSlice';
import { toast } from 'react-hot-toast';

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
  min-height: 400px;
  color: #666;
  font-size: 16px;
`;

const TaskEdit = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users } = useSelector(state => state.users);
  const inspectionLevels = useSelector(state => state.inspectionLevels.levels);
  const { currentTask: task, loading } = useSelector(state => state.tasks);
  const { assets, loading: assetsLoading } = useSelector(state => state.assets);
  
  useEffect(() => {
    loadInitialData();
  }, [taskId]);
  
  const loadInitialData = async () => {
    // Load all required data
    try {
      await Promise.all([
        dispatch(getTaskById(taskId)).unwrap(),
        dispatch(fetchUsers()).unwrap(),
        dispatch(fetchInspectionLevels()).unwrap(),
        dispatch(fetchAssets()).unwrap()
      ]);
    } catch (error) {
      console.error('Error loading task data:', error);
    }
  };

  // Debug effect
  useEffect(() => {
    if (task?.data) {
      console.log('Task data in edit:', task.data);
      console.log('Asset in task:', task.data.asset);
    }
    
    if (assets?.length > 0) {
      console.log('Available assets:', assets);
    }
  }, [task, assets]);
  
  const handleCancel = () => {
    navigate(`/tasks/${taskId}`);
  };
  
  if (loading || !task) {
    return (
      <PageContainer>
        <div>Loading...</div>
      </PageContainer>
    );
  }

  const formattedData = {
    _id: task.data._id,
    title: task.data.title || '',
    description: task.data.description || '',
    assignedTo: task.data.assignedTo || [],
    status: task.data.status || 'pending',
    priority: task.data.priority || 'medium',
    deadline: task.data.deadline ? new Date(task.data.deadline) : '',
    location: task.data.location || '',
    inspectionLevel: task.data.inspectionLevel?._id || task.data.inspectionLevel || null,
    asset: task.data.asset?._id || task.data.asset || null,
    isActive: task.data.isActive ?? true,
    attachments: task.data.attachments?.map(attachment => ({
      ...attachment,
      url: attachment.url,
      filename: attachment.filename,
      existing: true,
      _id: attachment._id
    })) || []
  };

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
          initialData={formattedData}
          onCancel={handleCancel}
          submitButtonText="Save Changes"
          isEdit={true}
          usersProp={users}
          inspectionLevelsProp={inspectionLevels?.results || []}
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskEdit;