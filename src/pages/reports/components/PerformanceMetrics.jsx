import React, { useEffect, useState } from 'react';
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
import api from '../../../services/api';

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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  font-size: 16px;
  color: #64748b;
  grid-column: 1 / -1;
`;

const MetricBreakdown = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  
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

const PerformanceMetrics = ({ dateRange, filters }) => {
  const [metrics, setMetrics] = useState({
    data: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          ...filters
        };
        
        const response = await api.get('/reports/performance-metrics', { params });
        
        setMetrics({
          data: response.data || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setMetrics({
          data: [],
          loading: false,
          error: error.message || 'Failed to fetch metrics data'
        });
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  const renderIcon = (iconName, size = 24) => {
    switch (iconName) {
      case 'ClipboardCheck': return <ClipboardCheck size={size} />;
      case 'TrendingUp': return <TrendingUp size={size} />;
      case 'Clock': return <Clock size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'AlertTriangle': return <AlertTriangle size={size} />;
      case 'Users': return <Users size={size} />;
      default: return <ClipboardCheck size={size} />;
    }
  };

  return (
    <MetricsGrid>
      {metrics.loading ? (
        <LoadingContainer>Loading metrics data...</LoadingContainer>
      ) : metrics.error ? (
        <LoadingContainer>Error: {metrics.error}</LoadingContainer>
      ) : metrics.data.length === 0 ? (
        <LoadingContainer>No metrics data available</LoadingContainer>
      ) : (
        metrics.data.map((metric, index) => (
          <MetricCard
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <MetricHeader>
              <IconWrapper background={metric.background} color={metric.color}>
                {renderIcon(metric.icon)}
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
        ))
      )}
    </MetricsGrid>
  );
};

export default PerformanceMetrics;