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
import api from '../../../services/api';

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div``;

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

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
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

  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
  }
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
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
  const [selectedRange, setSelectedRange] = useState('3M');
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
          <Title>Task Completion Trends</Title>
          <Subtitle>Analysis of task completion rates over time</Subtitle>
        </HeaderLeft>
        <ToggleGroup>
          {timeRanges.map(range => (
            <ToggleButton
              key={range}
              active={selectedRange === range}
              onClick={() => setSelectedRange(range)}
            >
              {range}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </ChartHeader>

      <MetricsContainer>
        <MetricCard>
          <MetricLabel>Total Tasks</MetricLabel>
          <MetricValue>{chartData.summary.totalTasks.toLocaleString()}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Avg. Completion Rate</MetricLabel>
          <MetricValue>{chartData.summary.avgCompletion}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Pending Tasks</MetricLabel>
          <MetricValue>{chartData.summary.totalPending.toLocaleString()}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Avg. Compliance</MetricLabel>
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
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData.data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
              tick={{ fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Tasks"
              stroke="var(--color-navy)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#totalGradient)"
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#4caf50"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#completedGradient)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
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