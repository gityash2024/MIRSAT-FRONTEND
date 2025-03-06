/* This code snippet is a React component named `Dashboard` that represents a dashboard interface. It
includes styled components for various elements like the dashboard container, welcome text, stat
cards, progress bars, team member items, etc. */
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Activity 
} from 'lucide-react';
import Reports from './reports';

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
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;

  .fill {
    height: 100%;
    background-color: #1a237e;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const ProgressItem = styled.div`
  margin-bottom: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .task-name {
    font-size: 14px;
    color: #666;
  }

  .percentage {
    font-size: 14px;
    font-weight: 500;
    color: #1a237e;
  }
`;

const TeamMemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fb;
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a237e;
      font-weight: 600;
    }

    .name {
      font-size: 14px;
      color: #333;
    }
  }

  .performance {
    padding: 4px 12px;
    border-radius: 16px;
    background-color: #e3f2fd;
    color: #1a237e;
    font-weight: 500;
    font-size: 14px;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: Calendar,
      value: '24',
      label: 'Total Tasks',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      icon: CheckSquare,
      value: '16',
      label: 'Completed Tasks',
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      icon: Clock,
      value: '8',
      label: 'Pending Reviews',
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      icon: Activity,
      value: '92%',
      label: 'Team Performance',
      color: '#9c27b0',
      bgColor: '#f3e5f5'
    }
  ];

  const taskProgress = [
    { name: 'Beach Inspections', progress: 75 },
    { name: 'Marina Safety Checks', progress: 60 },
    { name: 'Equipment Verification', progress: 90 },
    { name: 'Documentation Review', progress: 45 }
  ];

  const teamPerformance = [
    { name: 'John Doe', performance: '95%' },
    { name: 'Jane Smith', performance: '88%' },
    { name: 'Mike Johnson', performance: '82%' },
    { name: 'Sarah Williams', performance: '90%' }
  ];

  return (
    <DashboardContainer>
      <WelcomeText>
        Welcome back, {user?.name || 'Super Admin'}
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
          <CardTitle>Task Progress</CardTitle>
          <div>
            {taskProgress.map((task, index) => (
              <ProgressItem key={index}>
                <div className="header">
                  <span className="task-name">{task.name}</span>
                  <span className="percentage">{task.progress}%</span>
                </div>
                <ProgressBar>
                  <div 
                    className="fill" 
                    style={{ width: `${task.progress}%` }} 
                  />
                </ProgressBar>
              </ProgressItem>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Team Performance</CardTitle>
          <div>
            {teamPerformance.map((member, index) => (
              <TeamMemberItem key={index}>
                <div className="member-info">
                  <div className="avatar">
                    {member.name.charAt(0)}
                  </div>
                  <span className="name">{member.name}</span>
                </div>
                <div className="performance">
                  {member.performance}
                </div>
              </TeamMemberItem>
            ))}
          </div>
        </Card>
      </ContentGrid>
      <Reports/>
    </DashboardContainer>
  );
};

export default Dashboard;