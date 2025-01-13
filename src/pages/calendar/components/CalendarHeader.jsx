// src/pages/calendar/components/CalendarHeader.jsx
import React from 'react';
import styled from 'styled-components';
import { Plus, Filter, Download, Calendar } from 'lucide-react';

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

const CalendarHeader = ({ onAddEvent, onToggleFilters }) => {
  return (
    <Header>
      <TitleSection>
        <PageTitle>
          <Calendar size={24} />
          Calendar
        </PageTitle>
        <PageDescription>Schedule and manage inspection tasks</PageDescription>
      </TitleSection>

      <ActionButtons>
        <Button onClick={onToggleFilters}>
          <Filter size={16} />
          Filters
        </Button>
        <Button>
          <Download size={16} />
          Export
        </Button>
        <Button variant="primary" onClick={onAddEvent}>
          <Plus size={16} />
          Add Event
        </Button>
      </ActionButtons>
    </Header>
  );
};

export default CalendarHeader;