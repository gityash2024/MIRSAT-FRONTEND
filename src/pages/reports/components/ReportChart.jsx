import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BarChart, Activity, PieChart, LineChart } from 'lucide-react';

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const Description = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const ChartTypeSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ChartTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.active ? 'var(--color-navy)' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
  }
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
`;

const ReportChart = ({ title, description, type = 'bar' }) => {
  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <Title>
          {type === 'bar' && <BarChart size={20} />}
          {type === 'line' && <Activity size={20} />}
          {type === 'pie' && <PieChart size={20} />}
          {title || 'Report Chart'}
        </Title>
        <Description>{description || 'Visualization of report data'}</Description>
      </div>

      <ChartTypeSelector>
        <ChartTypeButton active={type === 'bar'}>
          <BarChart size={16} />
          Bar Chart
        </ChartTypeButton>
        <ChartTypeButton active={type === 'line'}>
          <LineChart size={16} />
          Line Chart
        </ChartTypeButton>
        <ChartTypeButton active={type === 'pie'}>
          <PieChart size={16} />
          Pie Chart
        </ChartTypeButton>
      </ChartTypeSelector>

      <Placeholder>
        Select data sources and apply filters to generate a visualization of your report data.
      </Placeholder>
    </ChartContainer>
  );
};

export default ReportChart;