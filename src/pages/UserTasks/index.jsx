import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { gsap } from 'gsap';
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
import Skeleton from '../../components/ui/Skeleton';

const TasksContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e5eeff 100%);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 80% 20%, rgba(180, 190, 255, 0.15), transparent 40%),
                radial-gradient(circle at 20% 80%, rgba(120, 140, 255, 0.15), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`;

const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e5eeff 100%);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background-color: #ffebee;
  border-radius: 8px;
  
  h3 {
    color: #d32f2f;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  p {
    color: #616161;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
  opacity: 0;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(26, 35, 126, 0.1);
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
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  align-items: center;
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0.8) 50%, 
      rgba(255, 255, 255, 0.2) 100%);
    border-radius: 12px 12px 0 0;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: rgba(26, 35, 126, 0.5);
      box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
      background: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  opacity: 0;
  position: relative;
  z-index: 1;
`;

const TaskCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  opacity: 0;
  transform: translateY(30px);
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0.8) 50%, 
      rgba(255, 255, 255, 0.2) 100%);
    border-radius: 12px 12px 0 0;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(26, 35, 126, 0.1);
  }
`;

const TaskHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
`;

const TaskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  max-width: 65%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00;';
      case 'in_progress':
        return 'background-color: rgba(225, 245, 254, 0.8); color: #0288d1;';
      case 'completed':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #388e3c;';
      case 'archived':
        return 'background-color: rgba(243, 232, 255, 0.8); color: #8b5cf6;';
      case 'incomplete':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f;';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161;';
    }
  }}
`;

const TaskBody = styled.div`
  padding: 16px;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
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
    color: var(--color-navy);
    flex-shrink: 0;
  }
`;

const TaskProgress = styled.div`
  margin: 20px 0;
  position: relative;
  
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
    color: var(--color-navy);
    font-weight: 500;
  }
  
  .progress-bar {
    height: 8px;
    background-color: rgba(224, 224, 224, 0.6);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(26, 35, 126, 0.8), rgba(63, 81, 181, 0.9));
    border-radius: 4px;
    width: ${props => props.progress}%;
    position: relative;
    overflow: hidden;
  }
  
  .shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0) 0%, 
      rgba(255, 255, 255, 0.4) 50%, 
      rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    animation: shimmer 2s infinite;
    z-index: 1;
  }
  
  .spark {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    pointer-events: none;
    z-index: 2;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(0%); }
    100% { transform: translateX(200%); }
  }
`;

const TaskActions = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(241, 245, 249, 0.5);
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.3);
  position: relative;
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%);
    transform: scale(0);
    opacity: 0;
    transition: transform 0.5s, opacity 0.3s;
  }
  
  &:active::after {
    transform: scale(3);
    opacity: 0;
    transition: 0s;
  }
  
  ${props => props.primary ? `
    background: rgba(26, 35, 126, 0.9);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 15px rgba(26, 35, 126, 0.2);
    
    &:hover {
      background: rgba(21, 27, 79, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(26, 35, 126, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: rgba(241, 245, 249, 0.6);
    color: #333;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    
    &:hover {
      background: rgba(226, 232, 240, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.2);
  }
`;

const EmptyTasks = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  grid-column: 1 / -1;
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0.8) 50%, 
      rgba(255, 255, 255, 0.2) 100%);
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
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
  flex-wrap: wrap;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  z-index: 1;
  
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
    border: 1px solid rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.3);
    
    &.active {
      background: rgba(26, 35, 126, 0.9);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 10px rgba(26, 35, 126, 0.2);
    }
    
    &:not(.active) {
      color: #333;
      
      &:hover {
        background: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  position: relative;
  z-index: 1;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f;';
      case 'medium':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00;';
      case 'low':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32;';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161;';
    }
  }}
`;

const GlassMorphismBlur = styled.div`
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 35, 126, 0.05) 0%, rgba(26, 35, 126, 0) 70%);
  z-index: 0;
`;

// Add components needed for UserTasksListSkeleton
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const FiltersContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

const TableContainer = styled.div`
  padding: 16px;
  overflow-x: auto;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
  }
  
  th {
    font-weight: 500;
    color: var(--color-navy);
    border-bottom: 1px solid rgba(224, 224, 224, 0.5);
  }
  
  td {
    border-bottom: 1px solid rgba(224, 224, 224, 0.3);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch (status) {
    case 'pending':
      return <Clock size={size} color="#f57c00" />;
    case 'in_progress':
      return <Activity size={size} color="#0288d1" />;
    case 'completed':
      return <CheckCircle size={size} color="#388e3c" />;
    case 'archived':
      return <CheckCircle size={size} color="#8b5cf6" />;
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

// UserTasksListSkeleton component - COMMENTED OUT
/*
const UserTasksListSkeleton = () => (
  <TasksContainer>
    <HeaderContainer>
      <div>
        <Skeleton.Base width="180px" height="32px" margin="0 0 8px 0" />
        <Skeleton.Base width="280px" height="16px" />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton.Button width="120px" height="40px" />
        <Skeleton.Button width="160px" height="40px" />
      </div>
    </HeaderContainer>
    
    <FiltersContainer>
      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
        <Skeleton.Base width="280px" height="40px" radius="8px" />
        <Skeleton.Base width="200px" height="40px" radius="8px" />
      </div>
    </FiltersContainer>
    
    <StatsContainer>
      {Array(4).fill().map((_, i) => (
        <StatCard key={i}>
          <Skeleton.Circle size="40px" margin="0 0 8px 0" />
          <Skeleton.Base width="100px" height="20px" margin="0 0 4px 0" />
          <Skeleton.Base width="60px" height="16px" />
        </StatCard>
      ))}
    </StatsContainer>
    
    <Card>
      <TableContainer>
        <TaskTable>
          <thead>
            <tr>
              <th><Skeleton.Base width="80px" height="16px" /></th>
              <th><Skeleton.Base width="240px" height="16px" /></th>
              <th><Skeleton.Base width="100px" height="16px" /></th>
              <th><Skeleton.Base width="120px" height="16px" /></th>
              <th><Skeleton.Base width="80px" height="16px" /></th>
              <th><Skeleton.Base width="100px" height="16px" /></th>
            </tr>
          </thead>
          <tbody>
            {Array(5).fill().map((_, i) => (
              <tr key={i}>
                <td><Skeleton.Base width="80px" height="16px" /></td>
                <td><Skeleton.Base width="240px" height="16px" /></td>
                <td><Skeleton.Base width="100px" height="16px" radius="12px" /></td>
                <td><Skeleton.Base width="120px" height="16px" /></td>
                <td><Skeleton.Base width="80px" height="16px" /></td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton.Circle size="32px" />
                  <Skeleton.Circle size="32px" />
                </td>
              </tr>
            ))}
          </tbody>
        </TaskTable>
      </TableContainer>
    </Card>
  </TasksContainer>
);
*/

const UserTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  

  const headerRef = useRef(null);
  const filterBarRef = useRef(null);
  const tasksGridRef = useRef(null);
  const emptyTasksRef = useRef(null);
  const paginationRef = useRef(null);
  const cardRefs = useRef([]);
  const sparklesTimeouts = useRef([]);
  
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
  
  useEffect(() => {
    animateElements();
    return () => {
      sparklesTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [tasks]);

  // Auto-update functionality disabled for task list - only enabled in task details
  
  const animateElements = () => {
    gsap.to(headerRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    });
    
    gsap.to(filterBarRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out"
    });
    
    if (tasks.results && tasks.results.length > 0) {
      gsap.to(tasksGridRef.current, {
        opacity: 1,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out"
      });
      
      cardRefs.current.forEach((card, index) => {
        if (card) {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.4 + (index * 0.05),
            ease: "power2.out"
          });
        }
      });
    } else if (emptyTasksRef.current) {
      gsap.to(emptyTasksRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out"
      });
    }
    
    if (tasks.totalPages > 1 && paginationRef.current) {
      gsap.to(paginationRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power2.out"
      });
    }
  };
  
  const createSparkles = (progressBarElement, progress) => {
    if (!progressBarElement) return;
    
    const existingContainer = progressBarElement.querySelector('.sparks-container');
    
    if (existingContainer) {
      return;
    }
    
    const sparksContainer = document.createElement('div');
    sparksContainer.className = 'sparks-container';
    sparksContainer.style.position = 'absolute';
    sparksContainer.style.top = '0';
    sparksContainer.style.left = '0';
    sparksContainer.style.width = '100%';
    sparksContainer.style.height = '100%';
    sparksContainer.style.overflow = 'hidden';
    sparksContainer.style.pointerEvents = 'none';
    sparksContainer.style.zIndex = '2';
    
    progressBarElement.appendChild(sparksContainer);
    
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    progressBarElement.appendChild(shimmer);
    
    const numSparkles = Math.max(3, Math.floor(progress / 10));
    let sparkCount = 0;
    
    const createSpark = () => {
      if (sparkCount >= 20) return;
      
      const spark = document.createElement('div');
      spark.className = 'spark';
      
      const size = Math.random() * 3 + 2;
      const posX = Math.random() * (progress - 10) + 5;
      const posY = Math.random() * 6 + 1;
      
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${posX}%`;
      spark.style.top = `${posY}px`;
      spark.style.opacity = Math.random() * 0.5 + 0.5;
      
      sparksContainer.appendChild(spark);
      sparkCount++;
      
      gsap.to(spark, {
        opacity: 0,
        scale: Math.random() * 2 + 1,
        duration: Math.random() * 2 + 1,
        ease: "power1.out",
        onComplete: () => {
          spark.remove();
          sparkCount--;
          
          if (Math.random() > 0.3 && sparksContainer.isConnected) {
            const timeout = setTimeout(createSpark, Math.random() * 1000 + 500);
            sparklesTimeouts.current.push(timeout);
          }
        }
      });
    };
    
    for (let i = 0; i < numSparkles; i++) {
      const timeout = setTimeout(() => {
        createSpark();
      }, i * 300);
      sparklesTimeouts.current.push(timeout);
    }
  };

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

  const handleSearchSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    dispatch(setFilters({ search }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFilterClick = (status, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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
    dispatch(startUserTask(taskId)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate(`/user-tasks/${taskId}`);
      }
    });
  };
  
  const viewTaskDetails = (taskId) => {
    navigate(`/user-tasks/${taskId}`);
  };

  const isPastDue = (deadline) => {
    return new Date(deadline) < new Date() && true;
  };
  
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, tasks.results ? tasks.results.length : 0);
    
    sparklesTimeouts.current.forEach(timeout => clearTimeout(timeout));
    sparklesTimeouts.current = [];
    
    const timer = setTimeout(() => {
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach((bar) => {
        const progress = parseFloat(bar.style.width);
        if (!isNaN(progress) && progress > 0) {
          createSparkles(bar, progress);
        }
      });
    }, 500);
    
    sparklesTimeouts.current.push(timer);
    
    return () => {
      sparklesTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [tasks]);

  if (loading) {
    return (
      <TasksContainer>
        <LoadingContainer>
          <div style={{ textAlign: 'center' }}>
            <Loader size={40} color="var(--color-navy)" />
            <p style={{ marginTop: '16px', color: 'var(--color-navy)', fontSize: '16px' }}>
              Task loading...
            </p>
          </div>
        </LoadingContainer>
      </TasksContainer>
    );
  }

  if (error) {
    return (
      <TasksContainer>
        <Card>
          <ErrorContainer>
            <AlertTriangle size={40} color="#d32f2f" />
            <div>
              <h3>Error Loading Tasks</h3>
              <p>{error}</p>
            </div>
          </ErrorContainer>
        </Card>
      </TasksContainer>
    );
  }

  return (
    <TasksContainer>
      <GlassMorphismBlur style={{ top: '10%', right: '5%', left: 'auto' }} />
      <GlassMorphismBlur style={{ top: '50%', left: '10%' }} />
      <GlassMorphismBlur style={{ bottom: '20%', right: '20%', left: 'auto' }} />
      
            <PageHeader ref={headerRef}>
        <Title>My Tasks</Title>
        <Description>View and manage all your assigned tasks</Description>
      </PageHeader>
      
      <FilterBar ref={filterBarRef}>
        <SearchInput>
          <Search size={18} />
          <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              style={{ width: '100%' }}
            />
          </form>
        </SearchInput>
        
        <ButtonGroup>
          <FilterButton 
            onClick={(e) => handleFilterClick('all', e)} 
            style={{
              background: activeFilter === 'all' 
                ? 'rgba(227, 242, 253, 0.7)' 
                : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <Filter size={16} />
            All
          </FilterButton>
          <FilterButton 
            onClick={(e) => handleFilterClick('pending', e)}
            style={{
              background: activeFilter === 'pending' 
                ? 'rgba(255, 248, 225, 0.7)' 
                : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <Clock size={16} />
            Pending
          </FilterButton>
          <FilterButton 
            onClick={(e) => handleFilterClick('in_progress', e)}
            style={{
              background: activeFilter === 'in_progress' 
                ? 'rgba(225, 245, 254, 0.7)' 
                : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <Activity size={16} />
            In Progress
          </FilterButton>
          <FilterButton 
            onClick={(e) => handleFilterClick('archived', e)}
            style={{
              background: activeFilter === 'archived' 
                ? 'rgba(243, 232, 255, 0.7)' 
                : 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <CheckCircle size={16} />
            Completed
          </FilterButton>
        </ButtonGroup>
      </FilterBar>
      
      {tasks.results && tasks.results.length > 0 ? (
        <TasksGrid ref={tasksGridRef}>
          {tasks.results.map((task, index) => (
            <TaskCard key={task.id} ref={el => cardRefs.current[index] = el}>
              <TaskHeader>
                <TaskTitle>{task.title}</TaskTitle>
                <StatusBadge status={task.status}>
                  <StatusIcon status={task.status} size={14} />
                  {task.status === 'archived' ? 'Completed' : task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
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
                  Template: {task.inspectionLevel?.name || 'N/A'}
                </TaskDetailRow>

                <TaskProgress progress={task.overallProgress || 0}>
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{task.overallProgress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </TaskProgress>
               
              </TaskBody>
              
              <TaskActions>
                <TaskButton 
                  onClick={() => viewTaskDetails(task.id)}
                >
                  View Details
                </TaskButton>
                
                {task.status === 'pending' && (
                  <TaskButton 
                    primary
                    onClick={() => handleStartTask(task.id)}
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
                    onClick={() => viewTaskDetails(task.id)}
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
        <EmptyTasks ref={emptyTasksRef}>
          <h3>No tasks found</h3>
          <p>No tasks match your current filters. Try adjusting your search criteria.</p>
        </EmptyTasks>
      )}
      
      {tasks.totalPages > 1 && (
        <Pagination ref={paginationRef}>
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