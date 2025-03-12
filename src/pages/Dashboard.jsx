import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #1a237e;
`;

const EmptyState = styled.div`
  padding: 16px;
  text-align: center;
  color: #64748b;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    taskProgress: [],
    teamPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Direct API call to avoid any Redux issues
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await api.get(`/dashboard/stats?_=${timestamp}`);
      
      console.log("Dashboard data received:", response.data);
      
      if (response.data && response.data.success) {
        setDashboardData({
          stats: response.data.stats || [],
          taskProgress: response.data.taskProgress || [],
          teamPerformance: response.data.teamPerformance || []
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const renderStatCards = () => {
    const { stats } = dashboardData;
    
    if (!stats || stats.length === 0) {
      return [...Array(4)].map((_, index) => (
        <StatCard key={index}>
          <div className="icon-wrapper" style={{ backgroundColor: '#f5f7fb' }}>
            {index === 0 && <Calendar size={24} color="#1976d2" />}
            {index === 1 && <CheckSquare size={24} color="#2e7d32" />}
            {index === 2 && <Clock size={24} color="#ed6c02" />}
            {index === 3 && <ShieldCheck size={24} color="#9c27b0" />}
          </div>
          <div className="value">0</div>
          <div className="label">
            {index === 0 && 'Total Tasks'}
            {index === 1 && 'Completed Tasks'}
            {index === 2 && 'Pending Reviews'}
            {index === 3 && 'Compliance Score'}
          </div>
        </StatCard>
      ));
    }

    return stats.map((stat, index) => {
      let Icon;
      switch (stat.icon) {
        case 'Calendar':
          Icon = Calendar;
          break;
        case 'CheckSquare':
          Icon = CheckSquare;
          break;
        case 'Clock':
          Icon = Clock;
          break;
        case 'ShieldCheck':
          Icon = ShieldCheck;
          break;
        default:
          Icon = Calendar;
      }

      return (
        <StatCard key={index}>
          <div className="icon-wrapper" style={{ backgroundColor: stat.bgColor }}>
            <Icon size={24} color={stat.color} />
          </div>
          <div className="value">{stat.value}</div>
          <div className="label">{stat.label}</div>
        </StatCard>
      );
    });
  };

  return (
    <DashboardContainer>
      <WelcomeText>
        Welcome back, {user?.name || 'Super Admin'}
      </WelcomeText>

      <StatsGrid>
        {loading && dashboardData.stats.length === 0 ? (
          <LoadingSpinner>Loading dashboard statistics...</LoadingSpinner>
        ) : (
          renderStatCards()
        )}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardTitle>Task Progress</CardTitle>
          {loading && dashboardData.taskProgress.length === 0 ? (
            <LoadingSpinner>Loading task progress...</LoadingSpinner>
          ) : dashboardData.taskProgress && dashboardData.taskProgress.length > 0 ? (
            <div>
              {dashboardData.taskProgress.map((task, index) => (
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
          ) : (
            <EmptyState>No task progress data available</EmptyState>
          )}
        </Card>

        <Card>
          <CardTitle>Inspector Performance</CardTitle>
          {loading && dashboardData.teamPerformance.length === 0 ? (
            <LoadingSpinner>Loading inspector performance...</LoadingSpinner>
          ) : dashboardData.teamPerformance && dashboardData.teamPerformance.length > 0 ? (
            <div>
              {dashboardData.teamPerformance.map((member, index) => (
                <TeamMemberItem key={index}>
                  <div className="member-info">
                    <div className="avatar">
                      {member.name ? member.name.charAt(0) : 'U'}
                    </div>
                    <span className="name">{member.name}</span>
                  </div>
                  <div className="performance">
                    {member.performance}
                  </div>
                </TeamMemberItem>
              ))}
            </div>
          ) : (
            <EmptyState>No inspector performance data available</EmptyState>
          )}
        </Card>
      </ContentGrid>
      
      <Reports/>
    </DashboardContainer>
  );
};

export default Dashboard;