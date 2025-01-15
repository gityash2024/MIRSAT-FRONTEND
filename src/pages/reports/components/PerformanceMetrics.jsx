import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  Users
} from 'lucide-react';
import { performanceData } from '../mockData';

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.background};
  color: ${props => props.color};
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
`;

const MetricValue = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Value = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
`;

const Unit = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.trend > 0 ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.trend > 0 ? '#16a34a' : '#dc2626'};
`;

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const BreakdownLabel = styled.span`
  color: #64748b;
`;

const BreakdownValue = styled.span`
  color: #1a237e;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.color || '#1a237e'};
  width: ${props => props.value}%;
`;

const metrics = [
  {
    title: 'Total Inspections',
    icon: ClipboardCheck,
    background: '#e3f2fd',
    color: '#1565c0',
    value: performanceData.totalInspections.current,
    unit: 'inspections',
    trend: performanceData.totalInspections.trend,
    breakdown: performanceData.totalInspections.breakdown
  },
  {
    title: 'Completion Rate',
    icon: TrendingUp,
    background: '#e8f5e9',
    color: '#2e7d32',
    value: performanceData.completionRate.current,
    unit: '%',
    trend: performanceData.completionRate.trend,
    breakdown: performanceData.completionRate.breakdown
  },
  {
    title: 'Avg. Completion Time',
    icon: Clock,
    background: '#fff3e0',
    color: '#ed6c02',
    value: performanceData.avgCompletionTime.current,
    unit: 'hours',
    trend: performanceData.avgCompletionTime.trend,
    breakdown: performanceData.avgCompletionTime.breakdown
  },
  {
    title: 'Compliance Score',
    icon: ShieldCheck,
    background: '#f3e5f5',
    color: '#9c27b0',
    value: performanceData.complianceScore.current,
    unit: '%',
    trend: performanceData.complianceScore.trend,
    breakdown: performanceData.complianceScore.breakdown
  },
  {
    title: 'Critical Issues',
    icon: AlertTriangle,
    background: '#ffebee',
    color: '#d32f2f',
    value: performanceData.criticalIssues.current,
    unit: 'issues',
    trend: performanceData.criticalIssues.trend,
    breakdown: performanceData.criticalIssues.breakdown
  },
  {
    title: 'Active Inspectors',
    icon: Users,
    background: '#e8eaf6',
    color: '#3f51b5',
    value: performanceData.activeInspectors.current,
    unit: 'inspectors',
    trend: performanceData.activeInspectors.trend,
    breakdown: performanceData.activeInspectors.breakdown
  }
];

const MetricBreakdown = ({ data }) => {
  const total = Object.values(data).reduce((acc, val) => acc + val, 0);
  
  return (
    <BreakdownList>
      {Object.entries(data).map(([key, value]) => (
        <BreakdownItem key={key}>
          <BreakdownLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</BreakdownLabel>
          <BreakdownValue>
            {typeof value === 'number' && value % 1 === 0 ? value : value.toFixed(1)}
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: `${(value / total) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBar>
          </BreakdownValue>
        </BreakdownItem>
      ))}
    </BreakdownList>
  );
};

const PerformanceMetrics = () => {
  return (
    <MetricsGrid>
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <MetricCard
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <MetricHeader>
              <IconWrapper background={metric.background} color={metric.color}>
                <IconComponent size={24} />
              </IconWrapper>
              <MetricTitle>{metric.title}</MetricTitle>
            </MetricHeader>

            <MetricValue>
              <Value>
                {typeof metric.value === 'number' && metric.value % 1 === 0
                  ? metric.value.toLocaleString()
                  : metric.value.toFixed(1)}
              </Value>
              <Unit>{metric.unit}</Unit>
              <TrendIndicator trend={metric.trend}>
                <TrendingUp size={14} />
                {metric.trend > 0 ? '+' : ''}{metric.trend}%
              </TrendIndicator>
            </MetricValue>

            {metric.breakdown && <MetricBreakdown data={metric.breakdown} />}
          </MetricCard>
        );
      })}
    </MetricsGrid>
  );
};

export default PerformanceMetrics;