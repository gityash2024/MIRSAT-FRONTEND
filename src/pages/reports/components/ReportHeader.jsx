import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FileText, Filter, Download, Calendar } from 'lucide-react';
import DateRangePicker from '../../../components/ui/date-range-picker';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
    flex-direction: column;
    gap: 8px;
  }
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const PageDescription = styled.p`
  color: #64748b;
  font-size: 14px;
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
  const { t } = useTranslation();
  
  return (
    <Header>
      <TitleSection>
        <PageTitle>
          <FileText size={24} />
          {t('reports.comprehensiveAnalysis')}
        </PageTitle>
        <PageDescription>
          {t('reports.overviewDescription')}
        </PageDescription>
      </TitleSection>

    </Header>
  );
};

export default ReportHeader;