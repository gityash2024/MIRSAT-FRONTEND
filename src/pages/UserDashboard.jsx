import React from 'react';
import styled from 'styled-components';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  ListChecks
} from 'lucide-react';
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

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Sample data - this would come from your API in a real implementation
  const stats = [
    {
      icon: ListChecks,
      value: '5',
      label: 'Assigned Tasks',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      icon: CheckSquare,
      value: '3',
      label: 'Completed Tasks',
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      icon: Clock,
      value: '2',
      label: 'In Progress',
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      icon: AlertCircle,
      value: '1',
      label: 'Upcoming Deadlines',
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const recentTasks = [
    { 
      id: 1, 
      name: 'Beach Safety Inspection', 
      description: 'Inspect the safety equipment at North Beach area', 
      status: 'in_progress',
      deadline: '2025-03-10'
    },
    { 
      id: 2, 
      name: 'Marina Check', 
      description: 'Complete the monthly marina security check', 
      status: 'pending',
      deadline: '2025-03-15'
    }
  ];

  const taskStatusCounts = [
    { status: 'Pending', count: 2, color: '#f97316' },
    { status: 'In Progress', count: 2, color: '#3b82f6' },
    { status: 'Completed', count: 3, color: '#22c55e' },
    { status: 'Overdue', count: 1, color: '#ef4444' },
  ];

  return (
    <DashboardContainer>
      <WelcomeText>
        Welcome back, {user?.name || 'User'}
      </WelcomeText>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <div 
              className="icon-wrapper" 
              style={{ backgroundColor: stat.bgColor }}
            >
              <stat.icon size={24} color={stat.color} />
            </div>
            <div className="value">{stat.value}</div>
            <div className="label">{stat.label}</div>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>
            <Calendar size={20} />
            Recent Tasks
          </CardTitle>
          <div>
            {recentTasks.map((task) => (
              <TaskItem key={task.id}>
                <div className="task-info">
                  <div 
                    className="status-icon" 
                    style={{ 
                      background: task.status === 'in_progress' ? '#e3f2fd' : '#fff3e0',
                      color: task.status === 'in_progress' ? '#1976d2' : '#ed6c02'
                    }}
                  >
                    {task.status === 'in_progress' ? 
                      <Clock size={16} /> : 
                      <AlertCircle size={16} />
                    }
                  </div>
                  <div>
                    <div className="task-name">{task.name}</div>
                    <div className="task-description">{task.description}</div>
                  </div>
                </div>
                <div className="task-actions">
                  <ActionButton variant="primary">View Details</ActionButton>
                </div>
              </TaskItem>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>
            <ListChecks size={20} />
            Task Status
          </CardTitle>
          <div>
            {taskStatusCounts.map((item, index) => (
              <StatusItem key={index} color={item.color}>
                <div className="status-label">{item.status}</div>
                <div className="status-count">{item.count}</div>
              </StatusItem>
            ))}
          </div>
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default UserDashboard;