import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Map, AlertTriangle, Activity } from 'lucide-react';
import api from '../../../services/api';

const MapContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || 'var(--color-navy)'};
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MetricName = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const MetricValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const MetricUnit = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const IssuesList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IssueItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const IssueInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IssueIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IssueDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const IssueName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-navy);
`;

const IssueLocation = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const IssueCount = styled.span`
  padding: 4px 8px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  font-size: 16px;
  color: #64748b;
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'white',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <p style={{ 
          margin: '0 0 8px', 
          fontWeight: 600, 
          color: 'var(--color-navy)' 
        }}>
          {payload[0].payload.region}
        </p>
        <p style={{ margin: '4px 0', color: '#64748b' }}>
          Templates: {payload[0].value}
        </p>
        <p style={{ margin: '4px 0', color: '#64748b' }}>
          Compliance: {payload[0].payload.compliance}%
        </p>
        <p style={{ margin: '4px 0', color: '#64748b' }}>
          Issues: {payload[0].payload.issues}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['var(--color-navy)', '#1565c0', '#1976d2', '#1e88e5', '#2196f3'];

const RegionalDistributionMap = ({ dateRange, filters }) => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionalData, setRegionalData] = useState({
    data: [],
    criticalIssues: [],
    metrics: {
      totalInspections: 0,
      avgCompliance: 0,
      totalIssues: 0
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchRegionalData = async () => {
      try {
        setRegionalData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          ...filters
        };
        
        const response = await api.get('/reports/regional-distribution', { params });
        
        setRegionalData({
          data: response.data.data || [],
          criticalIssues: response.data.criticalIssues || [],
          metrics: response.data.metrics || {
            totalInspections: 0,
            avgCompliance: 0,
            totalIssues: 0
          },
          loading: false,
          error: null
        });
      } catch (error) {
        setRegionalData({
          data: [],
          criticalIssues: [],
          metrics: {
            totalInspections: 0,
            avgCompliance: 0,
            totalIssues: 0
          },
          loading: false,
          error: error.message || 'Failed to fetch regional data'
        });
      }
    };

    fetchRegionalData();
  }, [dateRange, filters]);

  return (
    <MapContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Map size={20} />
          Regional Distribution
        </Title>
        <Subtitle>Distribution of templates and compliance across regions</Subtitle>
      </Header>

      {regionalData.loading ? (
        <LoadingContainer>Loading regional data...</LoadingContainer>
      ) : regionalData.error ? (
        <LoadingContainer>Error: {regionalData.error}</LoadingContainer>
      ) : regionalData.data.length === 0 ? (
        <LoadingContainer>No regional data available</LoadingContainer>
      ) : (
        <ContentGrid>
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionalData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--color-navy)">
                  {regionalData.data.map((entry, index) => (
                    <Cell 
                      key={entry.region}
                      fill={COLORS[index % COLORS.length]}
                      opacity={selectedRegion === entry.region || !selectedRegion ? 1 : 0.5}
                      onMouseEnter={() => setSelectedRegion(entry.region)}
                      onMouseLeave={() => setSelectedRegion(null)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <IssuesList>
              {regionalData.criticalIssues.map((issue, index) => (
                <IssueItem key={index}>
                  <IssueInfo>
                    <IssueIcon color={issue.color}>
                      <AlertTriangle size={16} />
                    </IssueIcon>
                    <IssueDetails>
                      <IssueName>{issue.name}</IssueName>
                      <IssueLocation>{issue.location}</IssueLocation>
                    </IssueDetails>
                  </IssueInfo>
                  <IssueCount color={issue.color}>
                    {issue.count} issues
                  </IssueCount>
                </IssueItem>
              ))}
            </IssuesList>
          </div>

          <MetricsList>
            <MetricCard color="var(--color-navy)">
              <MetricHeader>
                <MetricName>Total Templates</MetricName>
                <Activity size={16} color="var(--color-navy)" />
              </MetricHeader>
              <MetricValue>
                {regionalData.metrics.totalInspections.toLocaleString()}
                <MetricUnit>templates</MetricUnit>
              </MetricValue>
            </MetricCard>

            <MetricCard color="#2196f3">
              <MetricHeader>
                <MetricName>Average Compliance</MetricName>
                <Activity size={16} color="#2196f3" />
              </MetricHeader>
              <MetricValue>
                {regionalData.metrics.avgCompliance}
                <MetricUnit>%</MetricUnit>
              </MetricValue>
            </MetricCard>

            <MetricCard color="#f59e0b">
              <MetricHeader>
                <MetricName>Total Issues</MetricName>
                <AlertTriangle size={16} color="#f59e0b" />
              </MetricHeader>
              <MetricValue>
                {regionalData.metrics.totalIssues}
                <MetricUnit>issues</MetricUnit>
              </MetricValue>
            </MetricCard>
          </MetricsList>
        </ContentGrid>
      )}
    </MapContainer>
  );
};

export default RegionalDistributionMap;