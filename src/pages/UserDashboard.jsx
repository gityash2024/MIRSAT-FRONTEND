import React, { useEffect } from 'react';
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

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 24px;
  background-color: #f5f7fb;
`;

const WelcomeText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: #1a237e;
    margin: 8px 0;
  }

  .label {
    font-size: 14px;
    color: #666;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
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
  
  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .task-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .task-name {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }

  .task-description {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }

  .task-actions {
    display: flex;
    gap: 8px;
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
  
  ${props => props.variant === 'primary' ? `
    background: #1a237e;
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
  
  .status-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
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
  }
`;

const PerformanceCard = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  
  .metric-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .metric-value {
    font-size: 20px;
    font-weight: 600;
    color: #1a237e;
    display: flex;
    align-items: center;
    gap: 8px;
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
    color: #1a237e;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const UserDashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { dashboardStats, dashboardLoading, error } = useSelector((state) => state.userTasks);
  const { stats, recentTasks, statusCounts, performance } = dashboardStats;

  useEffect(() => {
    dispatch(fetchUserDashboardStats());
  }, [dispatch]);

  const handleViewTask = (taskId) => {
    navigate(`/user-tasks/${taskId}`);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return <Clock size={16} />;
      case 'completed':
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
        return '#2e7d32';
      case 'pending':
        return '#ed6c02';
      default:
        return '#666';
    }
  };

  if (dashboardLoading) {
    return (
      <DashboardContainer>
        <WelcomeText>
          Welcome back, {user?.name || 'User'}
        </WelcomeText>
        <LoadingContainer>
          <Loader size={30} color="#1a237e" />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <WelcomeText>
          Welcome back, {user?.name || 'User'}
        </WelcomeText>
        <Card>
          <EmptyState>
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
            <ActionButton 
              variant="primary"
              onClick={() => dispatch(fetchUserDashboardStats())}
            >
              Try Again
            </ActionButton>
          </EmptyState>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeText>
        Welcome back, {user?.name || 'User'}
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
              <div className="label">{stat.label}</div>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <Calendar size={20} />
            Recent Tasks
          </CardTitle>
          {recentTasks?.length > 0 ? (
            <div>
              {recentTasks.map((task) => (
                <TaskItem key={task._id}>
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
                    <div>
                      <div className="task-name">{task.title}</div>
                      <div className="task-description">
                        {task.description.length > 60 
                          ? `${task.description.substring(0, 60)}...` 
                          : task.description}
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <ActionButton 
                      variant="primary"
                      onClick={() => handleViewTask(task._id)}
                    >
                      View Details
                    </ActionButton>
                  </div>
                </TaskItem>
              ))}
            </div>
          ) : (
            <EmptyState>
              <h3>No recent tasks</h3>
              <p>You don't have any recent tasks assigned to you.</p>
            </EmptyState>
          )}
        </Card>

        <div>
          <Card>
            <CardTitle>
              <ListChecks size={20} />
              Task Status
            </CardTitle>
            {statusCounts?.length > 0 ? (
              <div>
                {statusCounts.map((item, index) => (
                  <StatusItem key={index} color={item.color}>
                    <div className="status-label">{item.status}</div>
                    <div className="status-count">{item.count}</div>
                  </StatusItem>
                ))}
              </div>
            ) : (
              <EmptyState>
                <h3>No task status</h3>
                <p>Status information is not available yet.</p>
              </EmptyState>
            )}
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardTitle>
              <TrendingUp size={20} />
              Performance Metrics
            </CardTitle>
            {performance ? (
              <div>
                <PerformanceCard>
                  <div className="metric-title">Tasks Completed This Month</div>
                  <div className="metric-value">
                    <CheckSquare size={18} color="#2e7d32" />
                    {performance.completedThisMonth}
                  </div>
                </PerformanceCard>
                
                <PerformanceCard>
                  <div className="metric-title">Average Completion Time</div>
                  <div className="metric-value">
                    <Clock size={18} color="#1976d2" />
                    {performance.avgCompletionTime} days
                  </div>
                </PerformanceCard>
                
                <PerformanceCard>
                  <div className="metric-title">Completion Rate</div>
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
                <h3>No performance data</h3>
                <p>Performance metrics will be available as you complete tasks.</p>
              </EmptyState>
            )}
          </Card>
        </div>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default UserDashboard;