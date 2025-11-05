import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const useResponsiveHeight = () => {
  const [height, setHeight] = useState(400);
  
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth <= 480) {
        setHeight(250);
      } else if (window.innerWidth <= 768) {
        setHeight(300);
      } else {
        setHeight(400);
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
  height: 100%;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
    flex-direction: column;
    gap: 8px;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;

  @media (max-width: 768px) {
    gap: 6px;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  @media (max-width: 480px) {
    gap: 4px;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
`;

const ToggleButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 5px 8px;
    font-size: 11px;
  }

  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
  }
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
`;

const MetricCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetricLabel = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const MetricValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
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

const CustomTooltip = ({ active, payload, label }) => {
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
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--color-navy)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: '4px 0',
              color: entry.color,
              fontSize: '13px'
            }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

const TaskCompletionChart = ({ dateRange, filters }) => {
  const { t } = useTranslation();
  const chartHeight = useResponsiveHeight();
  const [selectedRange, setSelectedRange] = useState('3M');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 768 && window.innerWidth > 480);

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case 'ALL': return t('common.all');
      case '1Y': return t('common.oneYear');
      case '6M': return t('common.sixMonths');
      case '3M': return t('common.threeMonths');
      case '1M': return t('common.oneMonth');
      case '1W': return t('common.oneWeek');
      default: return range;
    }
  };
  const [chartData, setChartData] = useState({
    data: [],
    summary: {
      totalTasks: 0,
      avgCompletion: 0,
      totalPending: 0,
      avgCompliance: 0
    },
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
    const fetchChartData = async () => {
      try {
        setChartData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          timeRange: selectedRange,
          ...filters
        };
        
        const response = await api.get('/reports/task-completion', { params });
        
        setChartData({
          data: response.data.data || [],
          summary: response.data.summary || {
            totalTasks: 0,
            avgCompletion: 0,
            totalPending: 0,
            avgCompliance: 0
          },
          loading: false,
          error: null
        });
      } catch (error) {
        setChartData({
          data: [],
          summary: {
            totalTasks: 0,
            avgCompletion: 0,
            totalPending: 0,
            avgCompliance: 0
          },
          loading: false,
          error: error.message || 'Failed to fetch task completion data'
        });
      }
    };

    fetchChartData();
  }, [dateRange, filters, selectedRange]);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <HeaderLeft>
          <Title>{t('common.taskCompletionTrends')}</Title>
          <Subtitle>{t('common.analysisOfTaskCompletion')}</Subtitle>
        </HeaderLeft>
        <ToggleGroup>
          {timeRanges.map(range => (
            <ToggleButton
              key={range}
              active={selectedRange === range}
              onClick={() => setSelectedRange(range)}
            >
              {getTimeRangeLabel(range)}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </ChartHeader>

      <MetricsContainer>
        <MetricCard>
          <MetricLabel>{t('common.totalTasks')}</MetricLabel>
          <MetricValue>{chartData.summary.totalTasks.toLocaleString()}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>{t('common.avgCompletionRate')}</MetricLabel>
          <MetricValue>{chartData.summary.avgCompletion}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>{t('common.pendingTasks')}</MetricLabel>
          <MetricValue>{chartData.summary.totalPending.toLocaleString()}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>{t('common.avgCompliance')}</MetricLabel>
          <MetricValue>{chartData.summary.avgCompliance}%</MetricValue>
        </MetricCard>
      </MetricsContainer>

      {chartData.loading ? (
        <LoadingContainer>Loading task completion data...</LoadingContainer>
      ) : chartData.error ? (
        <LoadingContainer>Error: {chartData.error}</LoadingContainer>
      ) : chartData.data.length === 0 ? (
        <LoadingContainer>No task completion data available</LoadingContainer>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart
            data={chartData.data}
            margin={{ 
              top: 10, 
              right: 10, 
              left: isMobile ? 5 : isTablet ? 10 : 0, 
              bottom: isMobile ? 30 : isTablet ? 25 : 20 
            }}
          >
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-navy)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--color-navy)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9800" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ff9800" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              tick={{ 
                fill: '#64748b',
                fontSize: isMobile ? 10 : 12,
                angle: isMobile ? -45 : 0,
                textAnchor: isMobile ? 'end' : 'middle'
              }} 
              axisLine={{ stroke: '#e2e8f0' }}
              height={isMobile ? 50 : 30}
            />
            <YAxis 
              tick={{ 
                fill: '#64748b',
                fontSize: isMobile ? 10 : 12
              }} 
              axisLine={{ stroke: '#e2e8f0' }}
              width={isMobile ? 40 : 50}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name={t('common.totalTasks')}
              stroke="var(--color-navy)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#totalGradient)"
            />
            <Area
              type="monotone"
              dataKey="completed"
              name={t('common.completed')}
              stroke="#4caf50"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#completedGradient)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              name={t('common.pending')}
              stroke="#ff9800"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#pendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default TaskCompletionChart;