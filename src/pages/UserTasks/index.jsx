import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Search, Filter, PlayCircle, Clock, CheckCircle, XCircle, 
  Activity, Calendar, AlertTriangle, Loader, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  fetchUserTasks, 
  startUserTask,
  setFilters,
  setPagination
} from '../../store/slices/userTasksSlice';
import { useAuth } from '../../hooks/useAuth';

const TasksContainer = styled.div`
  padding: 24px;
  background-color: #f5f7fb;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #666;
  font-size: 14px;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  align-items: center;
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const TaskCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TaskHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'in_progress':
        return 'background-color: #e1f5fe; color: #0288d1;';
      case 'completed':
        return 'background-color: #e8f5e9; color: #388e3c;';
      case 'incomplete':
        return 'background-color: #ffebee; color: #d32f2f;';
      default:
        return 'background-color: #f5f5f5; color: #616161;';
    }
  }}
`;

const TaskBody = styled.div`
  padding: 16px;
`;

const TaskDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TaskDetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
  
  svg {
    color: #1a237e;
    flex-shrink: 0;
  }
`;

const TaskProgress = styled.div`
  margin: 20px 0;
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .progress-label {
    font-weight: 500;
    color: #333;
  }
  
  .progress-percentage {
    color: #1a237e;
    font-weight: 500;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background-color: #1a237e;
    border-radius: 4px;
    width: ${props => props.progress}%;
  }
`;

const TaskActions = styled.div`
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
`;

const TaskButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background-color: #1a237e;
    color: white;
    
    &:hover {
      background-color: #151b4f;
    }
  ` : `
    background-color: #f1f5f9;
    color: #333;
    
    &:hover {
      background-color: #e2e8f0;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyTasks = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  grid-column: 1 / -1;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    
    &.active {
      background-color: #1a237e;
      color: white;
    }
    
    &:not(.active) {
      background-color: #f1f5f9;
      color: #333;
      
      &:hover {
        background-color: #e2e8f0;
      }
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return 'background-color: #ffebee; color: #d32f2f;';
      case 'medium':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'low':
        return 'background-color: #e8f5e9; color: #2e7d32;';
      default:
        return 'background-color: #f5f5f5; color: #616161;';
    }
  }}
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'incomplete':
      return <XCircle size={size} color="#d32f2f" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const UserTasks = () => {
  console.log("UserTasks component mounted");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const defaultState = {
    tasks: { results: [], totalPages: 0, page: 1, limit: 10 },
    loading: false,
    actionLoading: false,
    error: null,
    filters: {},
    pagination: { page: 1, limit: 10 }
  };
  
  const { 
    tasks = defaultState.tasks, 
    loading = defaultState.loading, 
    actionLoading = defaultState.actionLoading, 
    error = defaultState.error, 
    filters = defaultState.filters, 
    pagination = defaultState.pagination 
  } = useSelector((state) => state.userTasks || defaultState);

  useEffect(() => {
    loadTasks();
  }, [filters, pagination.page, pagination.limit]);

  const loadTasks = () => {
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    };
    
    dispatch(fetchUserTasks(params));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    dispatch(setFilters({ search }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFilterClick = (status) => {
    setActiveFilter(status);
    
    if (status === 'all') {
      dispatch(setFilters({ status: [] }));
    } else {
      dispatch(setFilters({ status: [status] }));
    }
    
    dispatch(setPagination({ page: 1 }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleStartTask = (taskId) => {
    dispatch(startUserTask(taskId));
  };
  
  const viewTaskDetails = (taskId) => {
    navigate(`/user-tasks/${taskId}`);
  };

  const isPastDue = (deadline) => {
    return new Date(deadline) < new Date() && true;
  };

  if (loading && (!tasks.results || tasks.results.length === 0)) {
    return (
      <TasksContainer>
        <PageHeader>
          <Title>My Tasks</Title>
          <Description>View and manage all your assigned tasks</Description>
        </PageHeader>
        
        <LoadingContainer>
          <Loader size={30} color="#1a237e" />
        </LoadingContainer>
      </TasksContainer>
    );
  }

  return (
    <TasksContainer>
      <PageHeader>
        <Title>My Tasks</Title>
        <Description>View and manage all your assigned tasks</Description>
      </PageHeader>
      
      <FilterBar>
        <SearchInput>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
        </SearchInput>
        
        <ButtonGroup>
          <FilterButton 
            onClick={() => handleFilterClick('all')} 
            style={{background: activeFilter === 'all' ? '#e3f2fd' : '#f1f5f9'}}
          >
            <Filter size={16} />
            All
          </FilterButton>
          <FilterButton 
            onClick={() => handleFilterClick('pending')}
            style={{background: activeFilter === 'pending' ? '#fff8e1' : '#f1f5f9'}}
          >
            <Clock size={16} />
            Pending
          </FilterButton>
          <FilterButton 
            onClick={() => handleFilterClick('in_progress')}
            style={{background: activeFilter === 'in_progress' ? '#e1f5fe' : '#f1f5f9'}}
          >
            <Activity size={16} />
            In Progress
          </FilterButton>
          <FilterButton 
            onClick={() => handleFilterClick('completed')}
            style={{background: activeFilter === 'completed' ? '#e8f5e9' : '#f1f5f9'}}
          >
            <CheckCircle size={16} />
            Completed
          </FilterButton>
        </ButtonGroup>
      </FilterBar>
      
      {tasks.results && tasks.results.length > 0 ? (
        <TasksGrid>
          {tasks.results.map((task) => (
            <TaskCard key={task._id}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <StatusBadge status={task.status}>
                  <StatusIcon status={task.status} size={14} />
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                </StatusBadge>
              </TaskHeader>
              
              <TaskBody>
                <TaskDescription>{task.description}</TaskDescription>
                
                <TaskDetailRow>
                  <Calendar size={16} />
                  <span style={{ 
                    color: isPastDue(task.deadline) && task.status !== 'completed' ? '#d32f2f' : '#666' 
                  }}>
                    Due: {formatDate(task.deadline)}
                    {isPastDue(task.deadline) && task.status !== 'completed' && ' (Overdue)'}
                  </span>
                </TaskDetailRow>
                
                <TaskDetailRow>
                  <AlertTriangle size={16} />
                  Priority: 
                  <PriorityBadge priority={task.priority}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </PriorityBadge>
                </TaskDetailRow>

                <TaskDetailRow>
                  <Activity size={16} />
                  Inspection: {task.inspectionLevel?.name || 'N/A'}
                </TaskDetailRow>
                
                <TaskProgress progress={task.overallProgress || 0}>
                  <div className="progress-header">
                    <span className="progress-label">Completion</span>
                    <span className="progress-percentage">{task.overallProgress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </TaskProgress>
              </TaskBody>
              
              <TaskActions>
                <TaskButton 
                  onClick={() => viewTaskDetails(task._id)}
                >
                  View Details
                </TaskButton>
                
                {task.status === 'pending' && (
                  <TaskButton 
                    primary
                    onClick={() => handleStartTask(task._id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <>
                        <PlayCircle size={16} />
                        Start Task
                      </>
                    )}
                  </TaskButton>
                )}
                
                {task.status === 'in_progress' && (
                  <TaskButton 
                    primary
                    onClick={() => viewTaskDetails(task._id)}
                  >
                    <PlayCircle size={16} />
                    Continue
                  </TaskButton>
                )}
              </TaskActions>
            </TaskCard>
          ))}
        </TasksGrid>
      ) : (
        <EmptyTasks>
          <h3>No tasks found</h3>
          <p>No tasks match your current filters. Try adjusting your search criteria.</p>
        </EmptyTasks>
      )}
      
      {tasks.totalPages > 1 && (
        <Pagination>
          <button 
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          
          {[...Array(tasks.totalPages)].map((_, index) => (
            <button 
              key={index + 1}
              className={pagination.page === index + 1 ? 'active' : ''}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          )).slice(
            Math.max(0, pagination.page - 3),
            Math.min(tasks.totalPages, pagination.page + 2)
          )}
          
          <button 
            disabled={pagination.page >= tasks.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </Pagination>
      )}
    </TasksContainer>
  );
};

export default UserTasks;