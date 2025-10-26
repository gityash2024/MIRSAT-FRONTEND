import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown, ChevronUp, Calendar, Clock, AlertTriangle, CheckCircle, User, Layers } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchTasks } from '../../../store/slices/taskSlice';
// import Skeleton from '../../../components/ui/Skeleton'; // COMMENTED OUT
import { Link } from 'react-router-dom';
import api from '../../../services/api'; // Fixed import path for api
import { toast } from 'react-hot-toast'; // Added toast import

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  width: 500px;
  max-width: 90%;
  background: white;
  height: 100%;
  overflow-y: auto;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f1f5f9;
    color: var(--color-navy);
  }
`;

const AssetInfo = styled.div`
  padding: 0 20px 16px 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const AssetDetail = styled.div`
  margin-bottom: 4px;
  font-size: 14px;
  
  strong {
    font-weight: 500;
    color: #475569;
  }
`;

const TasksContainer = styled.div`
  padding: 20px;
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TaskTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(--color-navy);
`;

const TaskCount = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  font-size: 14px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  cursor: pointer;
  border-bottom: ${props => props.isExpanded ? '1px solid #e0e0e0' : 'none'};
  
  &:hover {
    background: #f1f5f9;
  }
`;

const TaskItemTitle = styled.div`
  font-weight: 500;
  color: #334155;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#f0fdf4';
      case 'pending': return '#f8fafc';
      case 'in_progress': return '#eff6ff';
      case 'incomplete': return '#fef2f2';
      default: return '#f8fafc';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'pending': return '#475569';
      case 'in_progress': return '#1e40af';
      case 'incomplete': return '#b91c1c';
      default: return '#475569';
    }
  }};
`;

const TaskContent = styled.div`
  padding: 16px;
  font-size: 14px;
`;

const TaskDetail = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  color: #64748b;
  align-items: flex-start;
  
  svg {
    margin-top: 2px;
  }
`;

const TaskActions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 12px;
`;

const TaskButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-navy);
  color: white;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  
  &:hover {
    background: #151b60;
  }
`;

const EmptyState = styled.div`
  padding: 32px 20px;
  text-align: center;
  color: #64748b;
  
  p {
    margin-top: 12px;
  }
`;

const AssetTasksModal = ({ isOpen, onClose, asset }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});
  
  useEffect(() => {
    if (isOpen && asset) {
      // Reset expanded tasks when modal opens
      setExpandedTasks({});
      loadTasks();
    }
  }, [isOpen, asset]);
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const assetId = asset._id || asset.id;
      console.log('Loading tasks for asset:', assetId);
      
      // Use the asset-specific endpoint that bypasses role filtering
      const response = await api.get(`/tasks/asset/${assetId}`, {
        params: { limit: 100 }
      });
      
      console.log('Asset tasks response:', response.data);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  if (!isOpen) return null;
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'in_progress':
        return <User size={14} />;
      case 'incomplete':
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return t('common.completed');
      case 'pending':
        return t('common.pending');
      case 'in_progress':
        return t('common.inProgress');
      case 'incomplete':
        return t('common.incomplete');
      case 'archived':
        return t('common.archived');
      case 'cancelled':
        return t('common.cancelled');
      default:
        return t('common.pending');
    }
  };
  
  return (
    <ModalOverlay onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Layers size={20} />
            {t('common.assetRelatedTasks')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <AssetInfo>
          <h4 style={{ margin: '12px 0', fontSize: '16px', color: 'var(--color-navy)' }}>{t('assets.assetInformation')}</h4>
          <AssetDetail><strong>{t('common.name')}:</strong> {asset.displayName || t('common.notAvailable')}</AssetDetail>
          <AssetDetail><strong>{t('common.type')}:</strong> {asset.type || t('common.notAvailable')}</AssetDetail>
          <AssetDetail><strong>{t('common.id')}:</strong> {asset.uniqueId || t('common.notAvailable')}</AssetDetail>
          <AssetDetail><strong>{t('common.location')}:</strong> {asset.location || t('common.notAvailable')}</AssetDetail>
          {asset.city && <AssetDetail><strong>{t('common.city')}:</strong> {asset.city}</AssetDetail>}
          {asset.manufacturer && <AssetDetail><strong>{t('assets.manufacturer')}:</strong> {asset.manufacturer}</AssetDetail>}
          {asset.serialNumber && <AssetDetail><strong>{t('assets.serialNumber')}:</strong> {asset.serialNumber}</AssetDetail>}
        </AssetInfo>
        
        <TasksContainer>
          <TasksHeader>
            <TaskTitle>{t('common.tasks')}</TaskTitle>
            <TaskCount>{tasks.length}</TaskCount>
          </TasksHeader>
          
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '40px 0',
              textAlign: 'center' 
            }}>
              <div style={{ 
                color: 'var(--color-navy)', 
                fontSize: '16px' 
              }}>
                Loading tasks...
                </div>
            </div>
          ) : tasks.length > 0 ? (
            <TaskList>
              {tasks.map(task => {
                const taskId = task._id || task.id;
                return (
                <TaskItem key={taskId}>
                  <TaskHeader 
                    onClick={() => toggleTask(taskId)}
                    isExpanded={expandedTasks[taskId]}
                  >
                    <TaskItemTitle>
                      {task.title || 'Untitled Task'}
                    </TaskItemTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <StatusBadge status={task.status}>
                        {getStatusIcon(task.status)} {getStatusText(task.status)}
                      </StatusBadge>
                      {expandedTasks[taskId] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </TaskHeader>
                  
                  {expandedTasks[taskId] && (
                    <TaskContent>
                      <div style={{ marginBottom: '12px' }}>{task.description || 'No description provided.'}</div>
                      
                      <TaskDetail>
                        <Calendar size={16} />
                        <div>{t('calendar.deadline')}: {task.deadline ? new Date(task.deadline).toLocaleDateString() : t('tasks.noDeadline')}</div>
                      </TaskDetail>
                      
                      <TaskDetail>
                        <Layers size={16} />
                        <div>{t('common.template')}: {task.inspectionLevel?.name || t('common.notAvailable')}</div>
                      </TaskDetail>
                      
                      <TaskDetail>
                        <User size={16} />
                        <div>
                          {t('common.assignedTo')}: {task.assignedTo?.length > 0 
                            ? task.assignedTo.map(user => user.name || user.username || t('common.unknown')).join(', ') 
                            : t('common.unassigned')}
                        </div>
                      </TaskDetail>
                      
                      <TaskActions>
                        <TaskButton 
                          to={`/tasks/${task._id || task.id}`} 
                          key={`task-link-${task._id || task.id}`}
                          onClick={(e) => {
                            // Validate task ID before navigation
                            const taskId = task._id || task.id;
                            if (!taskId || taskId === 'undefined') {
                              e.preventDefault();
                              toast.error('Invalid task ID. Cannot view task details.');
                              return;
                            }
                          }}
                        >
                          {t('common.viewTaskDetails')}
                        </TaskButton>
                      </TaskActions>
                    </TaskContent>
                  )}
                </TaskItem>
                );
              })}
            </TaskList>
          ) : (
            <EmptyState>
              <AlertTriangle size={40} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>{t('assets.noTasksFound')}</h4>
              <p>{t('assets.noTasksAssociatedWithAsset')}</p>
            </EmptyState>
          )}
        </TasksContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AssetTasksModal; 