import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 400px;
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
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusLabel = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const StatusValue = styled.span`
  font-size: 16px;
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

const CustomLegend = ({ payload }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
      {payload.map((entry, index) => (
        <LegendItem key={entry.value}>
          <LegendColor color={COLORS[index % COLORS.length]} />
          <span>{entry.value}</span>
        </LegendItem>
      ))}
    </div>
  );
};

const InspectionStatusChart = ({ dateRange, filters }) => {
  const [statusData, setStatusData] = useState({
    data: [],
    loading: true,
    error: null
  });

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
        <Title>Template Status Distribution</Title>
        <Subtitle>Current status breakdown of all templates</Subtitle>
      </ChartHeader>

      {statusData.loading ? (
        <LoadingContainer>Loading status data...</LoadingContainer>
      ) : statusData.error ? (
        <LoadingContainer>Error: {statusData.error}</LoadingContainer>
      ) : statusData.data.length === 0 ? (
        <LoadingContainer>No status data available</LoadingContainer>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
                content={<CustomLegend />}
                verticalAlign="bottom" 
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>

          <StatusList>
            {statusData.data.map((status, index) => (
              <StatusItem key={status.name}>
                <StatusLabel>{status.name}</StatusLabel>
                <StatusValue style={{ color: COLORS[index % COLORS.length] }}>
                  {status.value.toLocaleString()}
                </StatusValue>
              </StatusItem>
            ))}
          </StatusList>
        </>
      )}
    </ChartContainer>
  );
};

export default InspectionStatusChart;