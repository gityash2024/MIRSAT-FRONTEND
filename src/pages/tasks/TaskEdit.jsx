import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import TaskForm from './components/TaskForm';
import { getTaskById } from '../../store/slices/taskSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { fetchAssets } from '../../store/slices/assetSlice';
import { toast } from 'react-hot-toast';

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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #666;
  font-size: 16px;
`;

const TaskEdit = () => {
  const { t } = useTranslation();
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users } = useSelector(state => state.users);
  const inspectionLevels = useSelector(state => state.inspectionLevels.levels);
  const { currentTask: task, loading } = useSelector(state => state.tasks);
  const { assets, loading: assetsLoading } = useSelector(state => state.assets);
  
  useEffect(() => {
    if (taskId) {
      console.log('Task ID from URL params:', taskId);
      loadInitialData();
    } else {
      toast.error(t('tasks.missingTaskId'));
      navigate('/tasks');
    }
  }, [taskId]);
  
  const loadInitialData = async () => {
    // Load all required data
    try {
      if (!taskId || taskId === 'undefined') {
        throw new Error(t('tasks.invalidTaskId'));
      }
      
      await Promise.all([
        dispatch(getTaskById(taskId)).unwrap(),
        dispatch(fetchUsers()).unwrap(),
        dispatch(fetchInspectionLevels()).unwrap(),
        dispatch(fetchAssets()).unwrap()
      ]);
    } catch (error) {
      console.error('Error loading task data:', error);
      toast.error(t('tasks.failedToLoadTaskData'));
      navigate('/tasks');
    }
  };

  // Debug effect
  useEffect(() => {
    if (task) {
      console.log('Full task response:', task);
      
      // Handle different data structures (array or single object)
      if (Array.isArray(task.data)) {
        console.log('Task data is an array with length:', task.data.length);
        console.log('First task in array:', task.data[0]);
      } else if (task.data) {
        console.log('Task data is a single object:', task.data);
      }
    }
    
    if (assets?.length > 0) {
      console.log('Available assets:', assets);
    }
  }, [task, assets]);

  
  const handleCancel = () => {
    navigate(`/tasks`);
  };

  // Create formattedData - must be before any conditional returns
  const formattedData = task ? (() => {
    try {
      return {
        _id: task.firstTask?.id || task.firstTask?._id || 
             (Array.isArray(task.data) && task.data.length > 0 
              ? task.data[0].id || task.data[0]._id 
              : (task.data?._id || task.data?.id || taskId)),
        title: task.firstTask?.title || 
               (Array.isArray(task.data) && task.data.length > 0 
                ? task.data[0].title 
                : (task.data?.title || '')),
        description: task.firstTask?.description || 
                     (Array.isArray(task.data) && task.data.length > 0 
                      ? task.data[0].description 
                      : (task.data?.description || '')),
        assignedTo: task.firstTask?.assignedTo || 
                    (Array.isArray(task.data) && task.data.length > 0 
                     ? task.data[0].assignedTo 
                     : (task.data?.assignedTo || [])),
        status: task.firstTask?.status || 
                (Array.isArray(task.data) && task.data.length > 0 
                 ? task.data[0].status 
                 : (task.data?.status || 'pending')),
        priority: task.firstTask?.priority || 
                  (Array.isArray(task.data) && task.data.length > 0 
                   ? task.data[0].priority 
                   : (task.data?.priority || 'medium')),
        deadline: task.firstTask?.deadline ? new Date(task.firstTask.deadline) :
                  (Array.isArray(task.data) && task.data.length > 0 && task.data[0].deadline
                   ? new Date(task.data[0].deadline) 
                   : (task.data?.deadline ? new Date(task.data.deadline) : null)),
        location: task.firstTask?.location || 
                  (Array.isArray(task.data) && task.data.length > 0 
                   ? task.data[0].location 
                   : (task.data?.location || '')),
        inspectionLevel: task.firstTask?.inspectionLevel?._id || task.firstTask?.inspectionLevel?.id || task.firstTask?.inspectionLevel ||
                         (Array.isArray(task.data) && task.data.length > 0 
                          ? (task.data[0].inspectionLevel?._id || task.data[0].inspectionLevel?.id || task.data[0].inspectionLevel) 
                          : (task.data?.inspectionLevel?._id || task.data?.inspectionLevel?.id || task.data?.inspectionLevel || null)),
        asset: task.firstTask?.asset?._id || task.firstTask?.asset?.id || task.firstTask?.asset ||
               (Array.isArray(task.data) && task.data.length > 0 
                ? (task.data[0].asset?._id || task.data[0].asset?.id || task.data[0].asset) 
                : (task.data?.asset?._id || task.data?.asset?.id || task.data?.asset || null)),
        isActive: task.firstTask?.isActive !== undefined ? task.firstTask.isActive :
                  (Array.isArray(task.data) && task.data.length > 0 
                   ? task.data[0].isActive 
                   : (task.data?.isActive ?? true)),
        attachments: task.firstTask?.attachments?.map(attachment => ({
                       ...attachment,
                       url: attachment.url,
                       filename: attachment.filename,
                       existing: true,
                       _id: attachment._id || attachment.id
                     })) || 
                     (Array.isArray(task.data) && task.data.length > 0 
                      ? (task.data[0].attachments?.map(attachment => ({
                          ...attachment,
                          url: attachment.url,
                          filename: attachment.filename,
                          existing: true,
                          _id: attachment._id || attachment.id
                        })) || [])
                      : (task.data?.attachments?.map(attachment => ({
                          ...attachment,
                          url: attachment.url,
                          filename: attachment.filename,
                          existing: true,
                          _id: attachment._id || attachment.id
                        })) || [])),
        preInspectionQuestions: task.firstTask?.preInspectionQuestions || 
                               (Array.isArray(task.data) && task.data.length > 0 
                                ? task.data[0].preInspectionQuestions 
                                : (task.data?.preInspectionQuestions || []))
      };
    } catch (error) {
      console.error('Error creating formattedData:', error);
      return null;
    }
  })() : null;

  // Store pre-inspection questions in localStorage when task is loaded
  useEffect(() => {
    try {
      if (formattedData && formattedData.preInspectionQuestions && formattedData.preInspectionQuestions.length > 0) {
        const taskId = formattedData._id;
        if (taskId) {
          localStorage.setItem(`task_${taskId}_preinspection`, JSON.stringify(formattedData.preInspectionQuestions));
          console.log('Stored pre-inspection questions in localStorage for task:', taskId, formattedData.preInspectionQuestions);
        }
      }
    } catch (error) {
      console.error('Error storing pre-inspection questions in localStorage:', error);
    }
  }, [formattedData]);

  // All conditional returns must come after all hooks
  if (loading || !task) {
    return (
      <PageContainer>
        <div>{t('common.loading')}</div>
      </PageContainer>
    );
  }

  if (!formattedData) {
    return (
      <PageContainer>
        <div>{t('tasks.errorLoadingTaskDataTryAgain')}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(`/tasks`)}>
          <ArrowLeft size={18} />
          Back to Task
        </BackButton>
        <PageTitle>{t('tasks.editTask')}</PageTitle>
        <SubTitle>{t('tasks.updateTaskDetailsAndInformation')}</SubTitle>
      </Header>

      <FormContainer>
        <TaskForm 
          initialData={formattedData}
          onCancel={handleCancel}
          submitButtonText={t('common.saveChanges')}
          isEdit={true}
          usersProp={users}
          inspectionLevelsProp={inspectionLevels?.results || []}
        />
      </FormContainer>
    </PageContainer>
  );
};

export default TaskEdit;