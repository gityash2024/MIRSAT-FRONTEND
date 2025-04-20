import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, ChevronDown, ChevronUp, Calendar, Clock, AlertTriangle, CheckCircle, User, Layers } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchTasks } from '../../../store/slices/taskSlice';
import Skeleton from '../../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

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
  color: #1a237e;
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
    color: #1a237e;
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
  color: #1a237e;
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
  background: #1a237e;
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});
  
  useEffect(() => {
    if (isOpen && asset) {
      loadTasks();
    }
  }, [isOpen, asset]);
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await dispatch(fetchTasks({ asset: asset._id })).unwrap();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
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
  
  return (
    <ModalOverlay onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Layers size={20} />
            Asset Related Tasks
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <AssetInfo>
          <h4 style={{ margin: '12px 0', fontSize: '16px', color: '#1a237e' }}>Asset Information</h4>
          <AssetDetail><strong>Name:</strong> {asset.displayName || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Type:</strong> {asset.type || 'N/A'}</AssetDetail>
          <AssetDetail><strong>ID:</strong> {asset.uniqueId || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Location:</strong> {asset.location || 'N/A'}</AssetDetail>
          {asset.city && <AssetDetail><strong>City:</strong> {asset.city}</AssetDetail>}
          {asset.manufacturer && <AssetDetail><strong>Manufacturer:</strong> {asset.manufacturer}</AssetDetail>}
          {asset.serialNumber && <AssetDetail><strong>Serial Number:</strong> {asset.serialNumber}</AssetDetail>}
        </AssetInfo>
        
        <TasksContainer>
          <TasksHeader>
            <TaskTitle>Tasks</TaskTitle>
            <TaskCount>{tasks.length}</TaskCount>
          </TasksHeader>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((_, index) => (
                <div key={index} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <Skeleton.Base width="80%" height={20} style={{ marginBottom: '8px' }} />
                  <Skeleton.Base width="40%" height={16} />
                </div>
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <TaskList>
              {tasks.map(task => (
                <TaskItem key={task._id}>
                  <TaskHeader 
                    onClick={() => toggleTask(task._id)}
                    isExpanded={expandedTasks[task._id]}
                  >
                    <TaskItemTitle>
                      {task.title}
                    </TaskItemTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <StatusBadge status={task.status}>
                        {getStatusIcon(task.status)} {task.status}
                      </StatusBadge>
                      {expandedTasks[task._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </TaskHeader>
                  
                  {expandedTasks[task._id] && (
                    <TaskContent>
                      <div style={{ marginBottom: '12px' }}>{task.description || 'No description provided.'}</div>
                      
                      <TaskDetail>
                        <Calendar size={16} />
                        <div>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</div>
                      </TaskDetail>
                      
                      <TaskDetail>
                        <Layers size={16} />
                        <div>Inspection Level: {task.inspectionLevel?.name || 'N/A'}</div>
                      </TaskDetail>
                      
                      <TaskDetail>
                        <User size={16} />
                        <div>
                          Assigned to: {task.assignedTo?.length > 0 
                            ? task.assignedTo.map(user => user.name).join(', ') 
                            : 'Unassigned'}
                        </div>
                      </TaskDetail>
                      
                      <TaskActions>
                        <TaskButton to={`/tasks/${task._id}`}>
                          View Task Details
                        </TaskButton>
                      </TaskActions>
                    </TaskContent>
                  )}
                </TaskItem>
              ))}
            </TaskList>
          ) : (
            <EmptyState>
              <AlertTriangle size={40} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 8px 0', color: '#334155' }}>No tasks found</h4>
              <p>There are no tasks associated with this asset.</p>
            </EmptyState>
          )}
        </TasksContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AssetTasksModal; 