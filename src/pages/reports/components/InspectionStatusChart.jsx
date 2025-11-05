import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const useResponsiveHeight = () => {
  const [height, setHeight] = useState(250);
  
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth <= 480) {
        setHeight(280);
      } else if (window.innerWidth <= 768) {
        setHeight(300);
      } else {
        setHeight(300);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  return height;
};

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  min-height: auto;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 8px;
    overflow: visible;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
    overflow: visible;
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    gap: 4px;
  }

  span {
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: nowrap;
  }
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${props => props.color};
`;

const StatusList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  padding-bottom: 8px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 20px;
    padding-bottom: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 20px;
    padding-bottom: 16px;
  }
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    gap: 8px;
    overflow: visible;
  }
`;

const StatusLabel = styled.span`
  font-size: 13px;
  color: #64748b;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  overflow: visible;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    line-height: 1.4;
  }
`;

const StatusValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  overflow: visible;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 0;
  min-width: 0;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    gap: 16px;
    padding: 16px 0;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 12px;
    margin-bottom: 20px;
    justify-content: flex-start;
  }
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

const COLORS = ['var(--color-navy)', '#4caf50', '#ff9800', '#f44336'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        padding: '8px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, color: 'var(--color-navy)', fontWeight: 500 }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
          {payload[0].value} templates
        </p>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
          {payload[0].payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, t }) => {
  const translateStatus = (status) => {
    switch (status) {
      case 'Delayed': return t('common.delayed');
      case 'Pending': return t('common.pending');
      case 'In Progress': return t('common.inProgress');
      case 'Completed': return t('common.completed');
      default: return status;
    }
  };

  if (!payload || payload.length === 0) return null;

  return (
    <LegendContainer>
      {payload.map((entry, index) => (
        <LegendItem key={entry.value || index}>
          <LegendColor color={entry.color || COLORS[index % COLORS.length]} />
          <span>{translateStatus(entry.value)}</span>
        </LegendItem>
      ))}
    </LegendContainer>
  );
};

const InspectionStatusChart = ({ dateRange, filters }) => {
  const { t } = useTranslation();
  const chartHeight = useResponsiveHeight();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 768 && window.innerWidth > 480);
  const [statusData, setStatusData] = useState({
    data: [],
    loading: true,
    error: null
  });
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth <= 768 && window.innerWidth > 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setStatusData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          ...filters
        };
        
        const response = await api.get('/reports/status-distribution', { params });
        
        setStatusData({
          data: response.data || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setStatusData({
          data: [],
          loading: false,
          error: error.message || 'Failed to fetch status data'
        });
      }
    };

    fetchStatusData();
  }, [dateRange, filters]);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <Title>{t('common.templateStatusDistribution')}</Title>
        <Subtitle>{t('common.currentStatusBreakdown')}</Subtitle>
      </ChartHeader>

      {statusData.loading ? (
        <LoadingContainer>Loading status data...</LoadingContainer>
      ) : statusData.error ? (
        <LoadingContainer>Error: {statusData.error}</LoadingContainer>
      ) : statusData.data.length === 0 ? (
        <LoadingContainer>No status data available</LoadingContainer>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={statusData.data}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 45 : isTablet ? 55 : 60}
                outerRadius={isMobile ? 65 : isTablet ? 75 : 80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                content={<CustomLegend payload={statusData.data.map((entry, index) => ({ value: entry.name, color: COLORS[index % COLORS.length] }))} t={t} />}
                verticalAlign="bottom" 
                height={isMobile ? 100 : isTablet ? 60 : 36}
                wrapperStyle={{ paddingBottom: isMobile ? '12px' : '4px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <StatusList>
            {statusData.data.map((status, index) => {
              const translateStatus = (statusName) => {
                switch (statusName) {
                  case 'Delayed': return t('common.delayed');
                  case 'Pending': return t('common.pending');
                  case 'In Progress': return t('common.inProgress');
                  case 'Completed': return t('common.completed');
                  default: return statusName;
                }
              };
              
              return (
                <StatusItem key={status.name}>
                  <StatusLabel>{translateStatus(status.name)}</StatusLabel>
                  <StatusValue style={{ color: COLORS[index % COLORS.length] }}>
                    {status.value.toLocaleString()}
                  </StatusValue>
                </StatusItem>
              );
            })}
          </StatusList>
        </>
      )}
    </ChartContainer>
  );
};

export default InspectionStatusChart;