import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const ChartContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const ChartHeader = styled.div`
  margin-bottom: 24px;
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

const MetricsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const MetricCard = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
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

const MetricScore = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => getScoreColor(props.score)};
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => getScoreColor(props.score)};
  width: ${props => props.score}%;
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
          margin: '0 0 4px', 
          fontWeight: 600, 
          color: 'var(--color-navy)',
          fontSize: '13px'
        }}>
          {payload[0].payload.name}
        </p>
        <p style={{ 
          margin: '0', 
          color: getScoreColor(payload[0].value),
          fontSize: '12px' 
        }}>
          Score: {payload[0].value}%
        </p>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#64748b',
          fontSize: '12px' 
        }}>
          Weight: {payload[0].payload.weight}%
        </p>
      </div>
    );
  }
  return null;
};

const getScoreColor = (score) => {
  if (score >= 90) return '#16a34a';
  if (score >= 80) return '#2563eb';
  if (score >= 70) return '#f59e0b';
  return '#dc2626';
};

const ComplianceChart = ({ dateRange, filters }) => {
  const { t } = useTranslation();
  const [complianceData, setComplianceData] = useState({
    categories: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setComplianceData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          ...filters
        };
        
        const response = await api.get('/reports/compliance', { params });
        
        setComplianceData({
          categories: response.data.categories || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setComplianceData({
          categories: [],
          loading: false,
          error: error.message || 'Failed to fetch compliance data'
        });
      }
    };

    fetchComplianceData();
  }, [dateRange, filters]);

  const translateCategoryName = (name) => {
    switch (name) {
      case 'Safety Protocols': return t('common.safetyProtocols');
      case 'Documentation': return t('common.documentation');
      case 'Equipment Standards': return t('common.equipmentStandards');
      case 'Staff Training': return t('common.staffTraining');
      case 'Environmental': return t('common.environmental');
      case 'Procedural': return t('common.procedural');
      default: return name;
    }
  };

  const totalScore = complianceData.categories.length > 0 
    ? complianceData.categories.reduce(
        (acc, curr) => acc + (curr.score * curr.weight) / 100,
        0
      ).toFixed(1)
    : 0;

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <Title>{t('common.complianceOverview')}</Title>
        <Subtitle>{t('common.overallComplianceScore')}: {totalScore}%</Subtitle>
      </ChartHeader>

      {complianceData.loading ? (
        <LoadingContainer>Loading compliance data...</LoadingContainer>
      ) : complianceData.error ? (
        <LoadingContainer>Error: {complianceData.error}</LoadingContainer>
      ) : complianceData.categories.length === 0 ? (
        <LoadingContainer>No compliance data available</LoadingContainer>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={complianceData.categories} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => translateCategoryName(value)}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="var(--color-navy)"
                fill="var(--color-navy)"
                fillOpacity={0.2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          <MetricsList>
            {complianceData.categories.map(category => (
              <MetricCard key={category.name}>
                <MetricHeader>
                  <MetricName>{translateCategoryName(category.name)}</MetricName>
                  <MetricScore score={category.score}>{category.score}%</MetricScore>
                </MetricHeader>
                <ProgressBar>
                  <ProgressFill
                    score={category.score}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </ProgressBar>
              </MetricCard>
            ))}
          </MetricsList>
        </>
      )}
    </ChartContainer>
  );
};

export default ComplianceChart;