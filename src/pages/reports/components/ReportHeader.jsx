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
  color: var(--color-navy);
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
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

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
          Overview of task completion, template status, and team performance
        </PageDescription>
      </TitleSection>

    </Header>
  );
};

export default ReportHeader;