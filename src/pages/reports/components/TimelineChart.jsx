import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  MoreVertical 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

const TimelineContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 6px 12px;
  border: none;
  background: ${props => props.active ? 'var(--color-navy)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f1f5f9'};
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 16px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 32px;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
`;

const TimelineIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.background};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TimelineTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  margin: 0;
`;

const TimelineTime = styled.span`
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimelineDescription = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const TimelineTags = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const Tag = styled.span`
  padding: 4px 8px;
  background: ${props => props.background};
  color: ${props => props.color};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const TimelineActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  color: ${props => props.variant === 'danger' ? '#dc2626' : 'var(--color-navy)'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  font-size: 16px;
  color: #64748b;
`;

const TimelineChart = ({ dateRange, filters }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [timelineData, setTimelineData] = useState({
    data: [],
    loading: true,
    error: null
  });

  const translateActivityStatus = (status) => {
    switch (status) {
      case 'Task created': return t('common.taskCreated');
      case 'Task completed and archived by inspector': return t('common.taskCompletedAndArchived');
      case 'Task started': return t('common.taskStarted');
      default: return status;
    }
  };

  const translateStatusTag = (tag) => {
    switch (tag) {
      case 'MEDIUM': return t('common.medium');
      case 'PENDING': return t('common.pending');
      case 'ARCHIVED': return t('common.archived');
      case 'IN_PROGRESS': return t('common.inProgress');
      default: return tag;
    }
  };

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setTimelineData(prev => ({ ...prev, loading: true, error: null }));
        
        const params = {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          status: filter !== 'all' ? filter : undefined,
          ...filters
        };
        
        const response = await api.get('/reports/activity-timeline', { params });
        
        setTimelineData({
          data: response.data || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setTimelineData({
          data: [],
          loading: false,
          error: error.message || 'Failed to fetch timeline data'
        });
      }
    };

    fetchTimelineData();
  }, [dateRange, filter, filters]);

  return (
    <TimelineContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <Clock size={20} />
          {t('common.activityTimeline')}
        </Title>
        <Subtitle>{t('common.recentTemplateActivities')}</Subtitle>
      </Header>

      <FilterTabs>
        <Tab active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('common.allActivities')}
        </Tab>
        {/* <Tab active={filter === 'critical'} onClick={() => setFilter('critical')}>
          Critical Issues
        </Tab>
        <Tab active={filter === 'completed'} onClick={() => setFilter('completed')}>
          Completed
        </Tab> */}
      </FilterTabs>

      {timelineData.loading ? (
        <LoadingContainer>Loading timeline data...</LoadingContainer>
      ) : timelineData.error ? (
        <LoadingContainer>Error: {timelineData.error}</LoadingContainer>
      ) : timelineData.data.length === 0 ? (
        <LoadingContainer>No timeline data available</LoadingContainer>
      ) : (
        <Timeline>
          {timelineData.data.map((item, index) => (
            <TimelineItem
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TimelineIcon 
                background={item.status === 'critical' ? '#fee2e2' : '#f0fdf4'}
                color={item.status === 'critical' ? '#dc2626' : '#16a34a'}
              >
                {item.status === 'critical' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
              </TimelineIcon>
              <TimelineContent>
                <TimelineHeader>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <TimelineTime>
                    <Clock size={12} />
                    {new Date(item.timestamp).toLocaleString()}
                  </TimelineTime>
                </TimelineHeader>
                <TimelineDescription>{translateActivityStatus(item.description)}</TimelineDescription>
                {item.tags && (
                  <TimelineTags>
                    {item.tags.map((tag, i) => (
                      <Tag key={i} background={tag.background} color={tag.color}>
                        {translateStatusTag(tag.label)}
                      </Tag>
                    ))}
                  </TimelineTags>
                )}
                {/* <TimelineActions>
                  <ActionButton>
                    View Details
                    <ChevronRight size={14} />
                  </ActionButton>
                </TimelineActions> */}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </TimelineContainer>
  );
};

export default TimelineChart;