import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  ShieldCheck,
  Loader
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Reports from './reports';
import ScrollAnimation from '../components/common/ScrollAnimation';
import Skeleton from '../components/ui/Skeleton';
import axios from 'axios';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 24px;
  background-color: var(--color-offwhite);
`;

const WelcomeText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
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
    color: var(--color-navy);
    margin: 8px 0;
  }

  .label {
    font-size: 14px;
    color: var(--color-gray-medium);
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
  color: var(--color-navy);
  margin-bottom: 24px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--color-gray-light);
  border-radius: 4px;
  overflow: hidden;

  .fill {
    height: 100%;
    background-color: var(--color-navy);
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
    color: var(--color-gray-medium);
  }

  .percentage {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-navy);
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
    background-color: var(--color-offwhite);
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--color-skyblue);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-navy);
      font-weight: 600;
    }

    .name {
      font-size: 14px;
      color: var(--color-gray-dark);
    }
  }

  .performance {
    padding: 4px 12px;
    border-radius: 16px;
    background-color: var(--color-skyblue);
    color: var(--color-navy);
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
  color: var(--color-navy);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  flex-direction: column;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--color-gray-medium);
`;

// Test Notification Button
const TestButton = styled.button`
  background-color: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--color-navy-dark);
  }
`;

const TestNotificationButton = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    if (!user || !token) return;
    
    setIsLoading(true);
    try {
      await axios.post('/notifications/test', 
        { userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <></>
    // <TestButton onClick={sendTestNotification} disabled={isLoading}>
    //   {isLoading ? 'Sending...' : 'Send Test Notification'}
    // </TestButton>
  );
};

// Create DashboardSkeleton component - COMMENTED OUT
/*
const DashboardSkeleton = () => (
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
    <ContentGrid>
      {/* Task Progress Card *//*
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
      
      {/* Inspector Performance Card *//*
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="160px" height="24px" />
        </Skeleton.Card.Header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Array(4).fill().map((_, i) => (
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
    </ContentGrid>
    
    {/* Reports Section *//*
    <div style={{ marginTop: '24px' }}>
      <Skeleton.Card.Wrapper>
        <Skeleton.Card.Header>
          <Skeleton.Base width="200px" height="24px" />
        </Skeleton.Card.Header>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton.Base width="100%" height="300px" />
        </div>
      </Skeleton.Card.Wrapper>
    </div>
  </DashboardContainer>
);
*/

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    taskProgress: [],
    teamPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <ScrollAnimation key={index} animation="fadeIn" delay={index * 0.1}>
          <StatCard>
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-offwhite)' }}>
              {index === 0 && <Calendar size={24} color="var(--color-info)" />}
              {index === 1 && <CheckSquare size={24} color="var(--color-success)" />}
              {index === 2 && <Clock size={24} color="var(--color-warning)" />}
              {index === 3 && <ShieldCheck size={24} color="var(--color-teal)" />}
            </div>
            <div className="value">0</div>
            <div className="label">
              {index === 0 && 'Total Tasks'}
              {index === 1 && 'Completed Tasks'}
              {index === 2 && 'Pending Reviews'}
              {index === 3 && 'Compliance Score'}
            </div>
          </StatCard>
        </ScrollAnimation>
      ));
    }

    return stats.map((stat, index) => {
      let Icon;
      let iconColor;
      
      switch (stat.icon) {
        case 'clipboard':
        case 'Calendar':
          Icon = Calendar;
          iconColor = 'var(--color-info)';
          break;
        case 'check-circle':
        case 'CheckSquare':
          Icon = CheckSquare;
          iconColor = 'var(--color-success)';
          break;
        case 'clock':
        case 'Clock':
          Icon = Clock;
          iconColor = 'var(--color-warning)';
          break;
        case 'shield-check':
        case 'ShieldCheck':
          Icon = ShieldCheck;
          iconColor = 'var(--color-teal)';
          break;
        default:
          Icon = Calendar;
          iconColor = 'var(--color-info)';
      }

      return (
        <ScrollAnimation key={index} animation="fadeIn" delay={index * 0.1}>
          <StatCard>
            <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-skyblue)' }}>
              <Icon size={24} color={iconColor} />
            </div>
            <div className="value">{stat.value}</div>
            <div className="label">{stat.title}</div>
          </StatCard>
        </ScrollAnimation>
      );
    });
  };

  if (loading && dashboardData.stats.length === 0 && dashboardData.taskProgress.length === 0 && dashboardData.teamPerformance.length === 0) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <Loader size={40} color="var(--color-navy)" />
          <p style={{ marginTop: '16px', color: 'var(--color-navy)', fontSize: '16px' }}>
            Dashboard loading...
          </p>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <ScrollAnimation animation="slideUp">
        <WelcomeText>
          Welcome back, {user?.name || 'Super Admin'}
        </WelcomeText>
      </ScrollAnimation>

      {/* Test Notification Button for Development */}
      <TestNotificationButton />

      {/* <StatsGrid>
        {loading && dashboardData.stats.length === 0 ? (
          <LoadingSpinner>Loading dashboard statistics...</LoadingSpinner>
        ) : (
          renderStatCards()
        )}
      </StatsGrid> */}

      <ContentGrid>
        <ScrollAnimation animation="slideIn" delay={0.3}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Total Tasks Card */}
            <StatCard style={{ padding: '16px', margin: 0 }}>
              <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-skyblue)', width: '40px', height: '40px' }}>
                <Calendar size={20} color="var(--color-info)" />
              </div>
              <div className="value" style={{ fontSize: '24px', margin: '8px 0' }}>
                {dashboardData.stats && dashboardData.stats.length > 0 
                  ? dashboardData.stats.find(s => s.title === 'Total Tasks')?.value || 0 
                  : 0}
              </div>
              <div className="label">Total Tasks</div>
            </StatCard>

            {/* Completed Tasks Card */}
            <StatCard style={{ padding: '16px', margin: 0 }}>
              <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-skyblue)', width: '40px', height: '40px' }}>
                <CheckSquare size={20} color="var(--color-success)" />
              </div>
              <div className="value" style={{ fontSize: '24px', margin: '8px 0' }}>
                {dashboardData.stats && dashboardData.stats.length > 0 
                  ? dashboardData.stats.find(s => s.title === 'Completed Tasks')?.value || 0 
                  : 0}
              </div>
              <div className="label">Completed Tasks</div>
            </StatCard>

            {/* Pending Reviews Card */}
            <StatCard style={{ padding: '16px', margin: 0 }}>
              <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-skyblue)', width: '40px', height: '40px' }}>
                <Clock size={20} color="var(--color-warning)" />
              </div>
              <div className="value" style={{ fontSize: '24px', margin: '8px 0' }}>
                {dashboardData.stats && dashboardData.stats.length > 0 
                  ? dashboardData.stats.find(s => s.title === 'Pending Reviews')?.value || 0 
                  : 0}
              </div>
              <div className="label">Pending Reviews</div>
            </StatCard>

            {/* Compliance Score Card */}
            <StatCard style={{ padding: '16px', margin: 0 }}>
              <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-skyblue)', width: '40px', height: '40px' }}>
                <ShieldCheck size={20} color="var(--color-teal)" />
              </div>
              <div className="value" style={{ fontSize: '24px', margin: '8px 0' }}>
                {dashboardData.stats && dashboardData.stats.length > 0 
                  ? dashboardData.stats.find(s => s.title === 'Compliance Score')?.value || '0%' 
                  : '0%'}
              </div>
              <div className="label">Compliance Score</div>
            </StatCard>
          </div>
        </ScrollAnimation>

        <ScrollAnimation animation="slideIn" delay={0.4}>
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
        </ScrollAnimation>
      </ContentGrid>
      
      <ScrollAnimation animation="fadeIn" delay={0.5}>
        <Reports/>
      </ScrollAnimation>
    </DashboardContainer>
  );
};

export default Dashboard;