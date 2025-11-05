import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  ListChecks,
  Loader,
  TrendingUp,
  Award
} from 'lucide-react';
import { fetchUserDashboardStats } from '../store/slices/userTasksSlice';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f7fb;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const WelcomeText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 32px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-navy);
    margin: 8px 0;
    word-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 24px;
    }
  }

  .label {
    font-size: 14px;
    color: #666;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 20px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 16px;
  }
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  min-width: 0;
  gap: 12px;
  
  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .task-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;

    @media (max-width: 480px) {
      gap: 8px;
      width: 100%;
    }
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 28px;
      height: 28px;
    }
  }

  .task-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  .task-description {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  .task-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 100%;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
    gap: 4px;
  }
  
  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    
    &:hover {
      background: #151b4f;
    }
  ` : `
    background: #f1f5f9;
    color: #333;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => props.color};
  background: #f8fafc;
  min-width: 0;
  
  @media (max-width: 480px) {
    padding: 10px;
    gap: 6px;
  }
  
  .status-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    word-wrap: break-word;
    overflow-wrap: break-word;
    flex: 1;
    min-width: 0;

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }
  
  .status-count {
    margin-left: auto;
    background: ${props => props.color};
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 24px;
      height: 24px;
      font-size: 12px;
    }
  }
`;

const PerformanceCard = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 12px;
  }
  
  .metric-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 13px;
      margin-bottom: 6px;
    }
  }
  
  .metric-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-navy);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    word-wrap: break-word;

    @media (max-width: 480px) {
      font-size: 18px;
      gap: 6px;
    }
  }
`;

const PerformanceCardWrapper = styled.div`
  margin-top: 24px;

  @media (max-width: 768px) {
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    margin-top: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  
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

// Create UserDashboardSkeleton component - COMMENTED OUT
/*
const UserDashboardSkeleton = () => (
  <DashboardContainer>
    <Skeleton.Base width="250px" height="28px" margin="0 0 32px 0" />
    
    {/* Stats Grid Section *//*
    <StatsGrid>
      {Array(4).fill().map((_, i) => (
        <div key={i}>
          <Skeleton.Card.Wrapper>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton.Circle size="48px" />
              <Skeleton.Base width="80px" height="28px" margin="8px 0" />
              <Skeleton.Base width="120px" height="14px" />
            </div>
          </Skeleton.Card.Wrapper>
        </div>
      ))}
    </StatsGrid>
    
    {/* Content Grid Section *//*
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
      gap: '24px' 
    }}>
      {/* First card - Tasks Progress *//*
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="160px" height="24px" />
        </Skeleton.Card.Header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Array(3).fill().map((_, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Skeleton.Base width={`${180 + Math.random() * 100}px`} height="16px" />
                <Skeleton.Base width="40px" height="16px" />
              </div>
              <Skeleton.Base width="100%" height="8px" radius="4px" />
            </div>
          ))}
        </div>
      </Skeleton.Card.Wrapper>
      
      {/* Second card - Performance *//*
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="160px" height="24px" />
        </Skeleton.Card.Header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Array(3).fill().map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Skeleton.Circle size="32px" />
                <Skeleton.Base width="120px" height="16px" />
              </div>
              <Skeleton.Base width="80px" height="24px" radius="12px" />
            </div>
          ))}
        </div>
      </Skeleton.Card.Wrapper>
    </div>
    
    {/* Recent tasks section *//*
    <div style={{ marginTop: '24px' }}>
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="160px" height="24px" />
        </Skeleton.Card.Header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array(5).fill().map((_, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px',
              borderBottom: i < 4 ? '1px solid #edf2f7' : 'none'
            }}>
              <Skeleton.Circle size="36px" />
              <div style={{ flex: 1 }}>
                <Skeleton.Base width={`${200 + Math.random() * 150}px`} height="18px" margin="0 0 8px 0" />
                <Skeleton.Base width={`${150 + Math.random() * 100}px`} height="14px" />
              </div>
              <Skeleton.Base width="80px" height="26px" radius="13px" />
            </div>
          ))}
        </div>
      </Skeleton.Card.Wrapper>
    </div>
  </DashboardContainer>
);
*/

const UserDashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { dashboardStats, dashboardLoading, error } = useSelector((state) => state.userTasks);
  const { stats, recentTasks, statusCounts, performance } = dashboardStats;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    dispatch(fetchUserDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewTask = (taskId) => {
    navigate(`/user-tasks/${taskId}`);
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    const truncateLength = isMobile ? 40 : maxLength;
    return text.length > truncateLength 
      ? `${text.substring(0, truncateLength)}...` 
      : text;
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return <Clock size={16} />;
      case 'completed':
      case 'archived':
        return <CheckSquare size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return '#e3f2fd';
      case 'completed':
      case 'archived':
        return '#e8f5e9';
      case 'pending':
        return '#fff3e0';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return '#1976d2';
      case 'completed':
      case 'archived':
        return '#2e7d32';
      case 'pending':
        return '#ed6c02';
      default:
        return '#666';
    }
  };

  const transformStatusLabel = (status) => {
    // Transform backend status to user-friendly labels
    switch (status.toLowerCase()) {
      case 'archived':
        return t('tasks.completed');
      case 'in_progress':
      case 'in progress':
        return t('tasks.inProgress');
      case 'pending':
        return t('tasks.pending');
      case 'completed':
        return t('tasks.completed');
      case 'overdue':
        return t('dashboard.overdue');
      default:
        // Check for exact matches first
        if (status === 'In Progress') {
          return t('tasks.inProgress');
        }
        if (status === 'Overdue') {
          return t('dashboard.overdue');
        }
        if (status === 'Completed') {
          return t('tasks.completed');
        }
        if (status === 'Pending') {
          return t('tasks.pending');
        }
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const translateStatLabel = (label) => {
    // Translate stat labels from backend
    switch (label) {
      case 'Overdue Tasks':
        return t('dashboard.overdueTasks');
      case 'In Progress':
        return t('dashboard.inProgress');
      case 'Completed Tasks':
        return t('dashboard.completedTasks');
      case 'Assigned Tasks':
        return t('dashboard.assignedTasks');
      case 'Overdue':
        return t('dashboard.overdueTasks');
      case 'Completed':
        return t('dashboard.completedTasks');
      case 'Pending':
        return t('tasks.pending');
      default:
        return label;
    }
  };

  if (dashboardLoading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <div style={{ textAlign: 'center' }}>
            <Loader size={40} color="var(--color-navy)" />
            <p style={{ marginTop: '16px', color: 'var(--color-navy)', fontSize: '16px' }}>
              {t('dashboard.loadingInspectorPerformance')}
            </p>
          </div>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <WelcomeText>
          {t('dashboard.welcome')}, {user?.name || t('common.inspector')}
        </WelcomeText>
        <Card>
          <EmptyState>
            <h3>{t('dashboard.unableToLoad')}</h3>
            <p>{error}</p>
            <ActionButton 
              variant="primary"
              onClick={() => dispatch(fetchUserDashboardStats())}
            >
              {t('common.tryAgain')}
            </ActionButton>
          </EmptyState>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeText>
        {t('dashboard.welcome')}, {user?.name || t('common.inspector')}
      </WelcomeText>

      <StatsGrid>
        {stats?.map((stat, index) => {
          const Icon = 
            stat.icon === 'ListChecks' ? ListChecks :
            stat.icon === 'CheckSquare' ? CheckSquare :
            stat.icon === 'Clock' ? Clock :
            stat.icon === 'AlertCircle' ? AlertCircle : 
            Calendar;
            
          return (
            <StatCard key={index}>
              <div 
                className="icon-wrapper" 
                style={{ backgroundColor: stat.bgColor }}
              >
                <Icon size={24} color={stat.color} />
              </div>
              <div className="value">{stat.value}</div>
              <div className="label">{translateStatLabel(stat.label)}</div>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <Calendar size={20} />
            {t('tasks.recentTasks')}
          </CardTitle>
          {recentTasks?.length > 0 ? (
            <div>
              {recentTasks.map((task) => (
                <TaskItem key={task.id}>
                  <div className="task-info">
                    <div 
                      className="status-icon" 
                      style={{ 
                        background: getStatusColor(task.status),
                        color: getStatusTextColor(task.status)
                      }}
                    >
                      {getStatusIcon(task.status)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="task-name">{task.title}</div>
                      <div className="task-description">
                        {truncateText(task.description)}
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <ActionButton 
                      variant="primary"
                      onClick={() => handleViewTask(task.id)}
                    >
                      {t('common.view')}
                    </ActionButton>
                  </div>
                </TaskItem>
              ))}
            </div>
          ) : (
            <EmptyState>
              <h3>{t('dashboard.noRecentTasks')}</h3>
              <p>{t('dashboard.noRecentTasksDescription')}</p>
            </EmptyState>
          )}
        </Card>

        <div>
          <Card>
            <CardTitle>
              <ListChecks size={20} />
              {t('tasks.taskStatus')}
            </CardTitle>
            {statusCounts?.length > 0 ? (
              <div>
                {statusCounts.map((item, index) => (
                  <StatusItem key={index} color={item.color}>
                    <div className="status-label">{transformStatusLabel(item.status)}</div>
                    <div className="status-count">{item.count}</div>
                  </StatusItem>
                ))}
              </div>
            ) : (
              <EmptyState>
                <h3>{t('dashboard.noTaskStatus')}</h3>
                <p>{t('dashboard.noTaskStatusDescription')}</p>
              </EmptyState>
            )}
          </Card>

          <PerformanceCardWrapper>
            <Card className="performance-card">
            <CardTitle>
              <TrendingUp size={20} />
              {t('dashboard.performanceMetrics')}
            </CardTitle>
            {performance ? (
              <div>
                <PerformanceCard>
                  <div className="metric-title">{t('dashboard.tasksCompletedThisMonth')}</div>
                  <div className="metric-value">
                    <CheckSquare size={18} color="#2e7d32" />
                    {performance.completedThisMonth}
                  </div>
                </PerformanceCard>
                
                <PerformanceCard>
                  <div className="metric-title">{t('dashboard.averageCompletionTime')}</div>
                  <div className="metric-value">
                    <Clock size={18} color="#1976d2" />
                    {performance.avgCompletionTime} {t('common.days')}
                  </div>
                </PerformanceCard>
                
                <PerformanceCard>
                  <div className="metric-title">{t('dashboard.completionRate')}</div>
                  <div className="metric-value">
                    <Award size={18} color="#f57c00" />
                    {performance.totalAssigned > 0 
                      ? Math.round((performance.completedThisMonth / performance.totalAssigned) * 100) 
                      : 0}%
                  </div>
                </PerformanceCard>
              </div>
            ) : (
              <EmptyState>
                <h3>{t('dashboard.noPerformanceData')}</h3>
                <p>{t('dashboard.noPerformanceDataDescription')}</p>
              </EmptyState>
            )}
          </Card>
          </PerformanceCardWrapper>
        </div>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default UserDashboard;