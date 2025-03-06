import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { motion } from 'framer-motion';
import { complianceData } from '../mockData';

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
  color: #1a237e;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const CategorySelect = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#1a237e' : '#f8fafc'};
  }
`;

const SummaryMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const MetricCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.highlight ? '#f1f5f9' : '#f8fafc'};
  border: ${props => props.highlight ? '1px solid #1a237e' : '1px solid transparent'};
`;

const MetricLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const MetricTrend = styled.div`
  font-size: 12px;
  color: ${props => props.value >= 0 ? '#16a34a' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
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
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a237e' }}>{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: '4px 0',
              color: entry.color,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: entry.color
            }} />
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const categories = ['overall', 'safety', 'procedures'];

const TrendAnalysisChart = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  
  // Calculate metrics
  const currentValue = complianceData.trends[complianceData.trends.length - 1][selectedCategory];
  const previousValue = complianceData.trends[complianceData.trends.length - 2][selectedCategory];
  const trend = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
  
  const average = (complianceData.trends.reduce((acc, curr) => acc + curr[selectedCategory], 0) / complianceData.trends.length).toFixed(1);
  const min = Math.min(...complianceData.trends.map(d => d[selectedCategory]));
  const max = Math.max(...complianceData.trends.map(d => d[selectedCategory]));

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <HeaderLeft>
          <Title>Performance Trend Analysis</Title>
          <Subtitle>Long-term performance trends and patterns</Subtitle>
        </HeaderLeft>
        <CategorySelect>
          {categories.map(category => (
            <CategoryButton
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </CategoryButton>
            ))}
            </CategorySelect>
          </ChartHeader>
    
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={complianceData.trends}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[dataMin => Math.floor(dataMin - 5), dataMax => Math.ceil(dataMax + 5)]}
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={90} stroke="#dc2626" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey={selectedCategory}
                name={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                stroke="#1a237e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
    
          <SummaryMetrics>
            <MetricCard highlight={true}>
              <MetricLabel>Current Performance</MetricLabel>
              <MetricValue>{currentValue}%</MetricValue>
              <MetricTrend value={trend}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs previous
              </MetricTrend>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Average Performance</MetricLabel>
              <MetricValue>{average}%</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>Range</MetricLabel>
              <MetricValue>{min}% - {max}%</MetricValue>
            </MetricCard>
          </SummaryMetrics>
        </ChartContainer>
      );
    };
    
    export default TrendAnalysisChart;