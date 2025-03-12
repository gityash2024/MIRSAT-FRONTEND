import React from 'react';
import styled from 'styled-components';
import { FileText, Filter, Download, Calendar } from 'lucide-react';
import DateRangePicker from '../../../components/ui/date-range-picker';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageDescription = styled.p`
  color: #64748b;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;

    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const DateRangeContainer = styled.div`
  margin-right: 16px;
`;

const ReportHeader = ({ onToggleFilters, dateRange, onDateRangeChange }) => {
  return (
    <Header>
      <TitleSection>
        <PageTitle>
          <FileText size={24} />
          Comprehensive Analysis and Performance Metrics
        </PageTitle>
        <PageDescription>
          Overview of task completion, inspection status, and team performance
        </PageDescription>
      </TitleSection>

      <ActionButtons>
        <DateRangeContainer>
          <DateRangePicker
            from={dateRange.start}
            to={dateRange.end}
            onSelect={(range) => {
              onDateRangeChange({
                start: range.from,
                end: range.to
              });
            }}
          />
        </DateRangeContainer>

        <Button onClick={onToggleFilters}>
          <Filter size={16} />
          Filters
        </Button>

        <Button>
          <Download size={16} />
          Export PDF
        </Button>

        <Button variant="primary">
          <Calendar size={16} />
          Schedule Report
        </Button>
      </ActionButtons>
    </Header>
  );
};

export default ReportHeader;