import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { 
  Card, 
  Typography,
  LinearProgress,
  Box
} from '@mui/material';
import {
  Calendar,
  CheckSquare,
  Clock,
  Activity
} from 'lucide-react';

const DashboardContainer = styled.div`
  padding: 24px;
  background-color: #f5f7fb;
  min-height: 100vh;
  width: 100vw;
`;

const PageTitle = styled(Typography)`
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 500;
  color: #333;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Card)`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .icon {
    color: ${props => props.iconColor || '#1976d2'};
    margin-bottom: 16px;
  }

  .value {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 8px 0;
  }

  .label {
    font-size: 14px;
    color: #666;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled(Card)`
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .card-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin-bottom: 24px;
  }
`;

const ProgressItem = styled.div`
  margin-bottom: 20px;

  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .progress-title {
    font-size: 14px;
    color: #666;
  }

  .progress-value {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
`;

const TeamPerformanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TeamMemberName = styled.span`
  font-size: 14px;
  color: #333;
`;

const TeamMemberPerformance = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: Calendar,
      value: '24',
      label: 'Total Tasks',
      iconColor: '#1976d2'
    },
    {
      icon: CheckSquare,
      value: '16',
      label: 'Completed Tasks',
      iconColor: '#2e7d32'
    },
    {
      icon: Clock,
      value: '8',
      label: 'Pending Reviews',
      iconColor: '#ed6c02'
    },
    {
      icon: Activity,
      value: '92%',
      label: 'Team Performance',
      iconColor: '#9c27b0'
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
      <PageTitle>Welcome back, {user?.name}</PageTitle>

      <StatsContainer>
        {stats.map((stat, index) => (
          <StatCard key={index} iconColor={stat.iconColor}>
            <stat.icon className="icon" size={24} />
            <div className="value">{stat.value}</div>
            <div className="label">{stat.label}</div>
          </StatCard>
        ))}
      </StatsContainer>

      <ContentGrid>
        <ContentCard>
          <Typography className="card-title">Task Progress</Typography>
          <Box>
            {taskProgress.map((task, index) => (
              <ProgressItem key={index}>
                <div className="progress-header">
                  <span className="progress-title">{task.name}</span>
                  <span className="progress-value">{task.progress}%</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: '#1976d2'
                    }
                  }}
                />
              </ProgressItem>
            ))}
          </Box>
        </ContentCard>

        <ContentCard>
          <Typography className="card-title">Team Performance</Typography>
          <Box>
            {teamPerformance.map((member, index) => (
              <TeamPerformanceItem key={index}>
                <TeamMemberName>{member.name}</TeamMemberName>
                <TeamMemberPerformance>{member.performance}</TeamMemberPerformance>
              </TeamPerformanceItem>
            ))}
          </Box>
        </ContentCard>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;