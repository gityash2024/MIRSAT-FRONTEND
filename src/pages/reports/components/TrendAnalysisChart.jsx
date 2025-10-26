import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
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
  background: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
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
  border: ${props => props.highlight ? '1px solid var(--color-navy)' : '1px solid transparent'};
`;

const MetricLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
`;

const MetricTrend = styled.div`
  font-size: 12px;
  color: ${props => props.value >= 0 ? '#16a34a' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
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

const TrendAnalysisChart = ({ dateRange, filters }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(['overall', 'safety', 'procedures']);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [trendData, setTrendData] = useState({
    data: [],
    metrics: {
      currentValue: 0,
      previousValue: 0,
      trend: 0,
      average: 0,
      min: 0,
      max: 0
    },
    loading: true,
    error: null
  });

  const translateMonth = (month) => {
    switch (month) {
      case 'May': return t('common.may');
      case 'Jun': return t('common.jun');
      case 'Jul': return t('common.jul');
      case 'Aug': return t('common.aug');
      case 'Sep': return t('common.sep');
      case 'Oct': return t('common.oct');
      default: return month;
    }
  };

  const translateCategory = (category) => {
    switch (category) {
      case 'overall': return t('common.overall');
      case 'safety': return t('common.safety');
      case 'procedures': return t('common.procedural');
      default: return category;
    }
  };
  
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setTrendData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          category: selectedCategory,
          ...filters
        };
        
        const response = await api.get('/reports/trend-analysis', { params });
        
        setTrendData({
          data: response.data.data || [],
          metrics: response.data.metrics || {
            currentValue: 0,
            previousValue: 0,
            trend: 0,
            average: 0,
            min: 0,
            max: 0
          },
          loading: false,
          error: null
        });
        
        if (response.data.categories && response.data.categories.length > 0) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        setTrendData({
          data: [],
          metrics: {
            currentValue: 0,
            previousValue: 0,
            trend: 0,
            average: 0,
            min: 0,
            max: 0
          },
          loading: false,
          error: error.message || 'Failed to fetch trend data'
        });
      }
    };

    fetchTrendData();
  }, [dateRange, selectedCategory, filters]);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartHeader>
        <HeaderLeft>
          <Title>{t('common.performanceTrendAnalysis')}</Title>
          <Subtitle>{t('common.longTermPerformanceTrends')}</Subtitle>
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

      {trendData.loading ? (
        <LoadingContainer>Loading trend data...</LoadingContainer>
      ) : trendData.error ? (
        <LoadingContainer>Error: {trendData.error}</LoadingContainer>
      ) : trendData.data.length === 0 ? (
        <LoadingContainer>No trend data available</LoadingContainer>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendData.data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => translateMonth(value)}
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
                name={translateCategory(selectedCategory)}
                stroke="var(--color-navy)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <SummaryMetrics>
            <MetricCard highlight={true}>
              <MetricLabel>{t('common.currentPerformance')}</MetricLabel>
              <MetricValue>{trendData.metrics.currentValue}%</MetricValue>
              <MetricTrend value={trendData.metrics.trend}>
                {trendData.metrics.trend > 0 ? '↑' : '↓'} {Math.abs(trendData.metrics.trend)}% {t('common.vsPrevious')}
              </MetricTrend>
            </MetricCard>
            <MetricCard>
              <MetricLabel>{t('common.averagePerformance')}</MetricLabel>
              <MetricValue>{trendData.metrics.average}%</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricLabel>{t('common.range')}</MetricLabel>
              <MetricValue>{trendData.metrics.min}% - {trendData.metrics.max}%</MetricValue>
            </MetricCard>
          </SummaryMetrics>
        </>
      )}
    </ChartContainer>
  );
};

export default TrendAnalysisChart;