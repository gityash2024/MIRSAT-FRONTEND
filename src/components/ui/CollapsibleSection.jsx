import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const SectionContainer = styled.div`
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: white;
  border: 1px solid var(--color-gray-light);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.isActive ? 'var(--color-teal)' : props.hasIssues ? 'var(--color-coral)' : 'var(--color-navy)'};
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--color-teal)' : props.hasIssues ? 'var(--color-coral)' : 'var(--color-navy)'};
    opacity: 0.9;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionNumber = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SectionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
`;

const SectionContent = styled.div`
  padding: ${props => (props.isExpanded ? '16px' : '0')};
  max-height: ${props => (props.isExpanded ? '2000px' : '0')};
  opacity: ${props => (props.isExpanded ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return 'var(--color-compliance-full)';
      case 'in_progress':
        return 'var(--color-compliance-partial)';
      case 'pending':
        return 'var(--color-gray-medium)';
      case 'issues':
        return 'var(--color-compliance-non)';
      default:
        return 'var(--color-gray-light)';
    }
  }};
  color: white;
`;

const CollapsibleSection = ({
  title,
  number,
  children,
  isActive = false,
  status = 'pending',
  questionsCount = 0,
  completedCount = 0,
  isInitiallyExpanded = false,
  hasIssues = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'issues':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const renderStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'issues':
        return 'Has Issues';
      default:
        return 'Pending';
    }
  };

  return (
    <SectionContainer>
      <SectionHeader onClick={toggleExpand} isActive={isActive} hasIssues={hasIssues}>
        <HeaderLeft>
          <SectionNumber>{number}</SectionNumber>
          <SectionTitle>{title}</SectionTitle>
        </HeaderLeft>

        <HeaderRight>
          <SectionStats>
            {completedCount} / {questionsCount} Questions
          </SectionStats>
          
          <StatusIndicator status={status}>
            {renderStatusIcon()}
            <span>{renderStatusText()}</span>
          </StatusIndicator>
          
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </HeaderRight>
      </SectionHeader>

      <SectionContent isExpanded={isExpanded}>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};

export default CollapsibleSection; 