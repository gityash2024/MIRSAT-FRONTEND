import React, { useState } from 'react';
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
import { regionalData } from '../mockData';

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
  color: #1a237e;
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
  border-left: 4px solid ${props => props.color || '#1a237e'};
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
  color: #1a237e;
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
  color: #1a237e;
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
          color: '#1a237e' 
        }}>
          {payload[0].payload.region}
        </p>
        <p style={{ margin: '4px 0', color: '#64748b' }}>
          Inspections: {payload[0].value}
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

const COLORS = ['#1a237e', '#1565c0', '#1976d2', '#1e88e5', '#2196f3'];

const RegionalDistributionMap = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const totalInspections = regionalData.reduce((acc, curr) => acc + curr.count, 0);
  const avgCompliance = (regionalData.reduce((acc, curr) => acc + curr.compliance, 0) / regionalData.length).toFixed(1);
  const totalIssues = regionalData.reduce((acc, curr) => acc + curr.issues, 0);

  const criticalIssues = [
    {
      name: 'Equipment Malfunction',
      location: 'South Marina',
      count: 3,
      color: '#dc2626'
    },
    {
      name: 'Safety Protocol Breach',
      location: 'North Beach',
      count: 2,
      color: '#f59e0b'
    },
    {
      name: 'Documentation Missing',
      location: 'East Coast',
      count: 4,
      color: '#2563eb'
    }
  ];

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
        <Subtitle>Distribution of inspections and compliance across regions</Subtitle>
      </Header>

      <ContentGrid>
        <div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionalData}>
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
              <Bar dataKey="count" fill="#1a237e">
                {regionalData.map((entry, index) => (
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
            {criticalIssues.map((issue, index) => (
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
          <MetricCard color="#1a237e">
            <MetricHeader>
              <MetricName>Total Inspections</MetricName>
              <Activity size={16} color="#1a237e" />
            </MetricHeader>
            <MetricValue>
              {totalInspections.toLocaleString()}
              <MetricUnit>inspections</MetricUnit>
            </MetricValue>
          </MetricCard>

          <MetricCard color="#2196f3">
            <MetricHeader>
              <MetricName>Average Compliance</MetricName>
              <Activity size={16} color="#2196f3" />
            </MetricHeader>
            <MetricValue>
              {avgCompliance}
              <MetricUnit>%</MetricUnit>
            </MetricValue>
          </MetricCard>

          <MetricCard color="#f59e0b">
            <MetricHeader>
              <MetricName>Total Issues</MetricName>
              <AlertTriangle size={16} color="#f59e0b" />
            </MetricHeader>
            <MetricValue>
              {totalIssues}
              <MetricUnit>issues</MetricUnit>
            </MetricValue>
          </MetricCard>
        </MetricsList>
      </ContentGrid>
    </MapContainer>
  );
};

export default RegionalDistributionMap;