import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, XCircle, Slash } from 'lucide-react';

const StatusContainer = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;
`;

const SectionStatusCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
  border-left: 3px solid ${props => {
    switch(props.status) {
      case 'full_compliance': return 'var(--color-compliance-full)';
      case 'partial_compliance': return 'var(--color-compliance-partial)';
      case 'non_compliance': return 'var(--color-compliance-non)';
      case 'not_applicable': return 'var(--color-compliance-na)';
      default: return 'var(--color-gray-light)';
    }
  }};
`;

const SectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
`;

const SectionDetails = styled.div`
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch(props.status) {
      case 'full_compliance': return 'var(--color-compliance-full)';
      case 'partial_compliance': return 'var(--color-compliance-partial)';
      case 'non_compliance': return 'var(--color-compliance-non)';
      case 'not_applicable': return 'var(--color-compliance-na)';
      default: return 'var(--color-gray-light)';
    }
  }};
  color: white;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: var(--color-gray-light);
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.percentage >= 80) return 'var(--color-compliance-full)';
    if (props.percentage >= 40) return 'var(--color-compliance-partial)';
    return 'var(--color-compliance-non)';
  }};
  width: ${props => `${props.percentage}%`};
  transition: width 0.3s ease;
`;

const StatusIcon = ({ status, size = 16 }) => {
  switch (status) {
    case 'full_compliance':
      return <CheckCircle size={size} />;
    case 'partial_compliance':
      return <AlertCircle size={size} />;
    case 'non_compliance':
      return <XCircle size={size} />;
    case 'not_applicable':
      return <Slash size={size} />;
    default:
      return null;
  }
};

const StatusText = ({ status }) => {
  switch (status) {
    case 'full_compliance':
      return 'Full Compliance - نعم';
    case 'partial_compliance':
      return 'Partial Compliance - جزئي';
    case 'non_compliance':
      return 'Non Compliant - لا';
    case 'not_applicable':
      return 'Not Applicable - لا ينطبق';
    default:
      return 'Not Assessed';
  }
};

const SectionComplianceStatus = ({ 
  sections, 
  totalScore,
  totalMaxScore,
  onClick
}) => {
  // Calculate total percentage
  const totalPercentage = totalMaxScore > 0 
    ? Math.round((totalScore / totalMaxScore) * 100) 
    : 0;

  // Determine overall status
  const getOverallStatus = (percentage) => {
    if (percentage >= 80) return 'full_compliance';
    if (percentage >= 40) return 'partial_compliance';
    return 'non_compliance';
  };
  
  const overall = getOverallStatus(totalPercentage);
    
  return (
    <StatusContainer>
      {sections.map((section) => {
        // Calculate section percentage
        const sectionPercentage = section.maxScore > 0 
          ? Math.round((section.score / section.maxScore) * 100) 
          : 0;
          
        return (
          <SectionStatusCard 
            key={section.id} 
            status={section.status}
            onClick={() => onClick && onClick(section.id)}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            <SectionInfo>
              <SectionTitle>{section.name}</SectionTitle>
              <SectionDetails>
                Score: {section.score} / {section.maxScore} ({sectionPercentage}%)
              </SectionDetails>
              <ProgressBar>
                <ProgressFill percentage={sectionPercentage} />
              </ProgressBar>
            </SectionInfo>
            
            <StatusBadge status={section.status}>
              <StatusIcon status={section.status} />
              <span><StatusText status={section.status} /></span>
            </StatusBadge>
          </SectionStatusCard>
        );
      })}
      
      <SectionStatusCard status={overall} style={{ backgroundColor: 'var(--color-skyblue)' }}>
        <SectionInfo>
          <SectionTitle style={{ fontWeight: 600 }}>Overall Compliance</SectionTitle>
          <SectionDetails style={{ color: 'var(--color-navy)' }}>
            Total Score: {totalScore} / {totalMaxScore} ({totalPercentage}%)
          </SectionDetails>
          <ProgressBar>
            <ProgressFill percentage={totalPercentage} />
          </ProgressBar>
        </SectionInfo>
        
        <StatusBadge status={overall}>
          <StatusIcon status={overall} />
          <span><StatusText status={overall} /></span>
        </StatusBadge>
      </SectionStatusCard>
    </StatusContainer>
  );
};

export default SectionComplianceStatus; 