import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FileText, 
  Flag, 
  Award, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Image,
  MessageSquare,
  BarChart2,
  User,
  File,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PreviewContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--color-gray-light);
`;

const PreviewHeader = styled.div`
  padding: 24px;
  background-color: var(--color-navy);
  color: white;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
`;

const ReportTitle = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 700;
`;

const ReportSubtitle = styled.div`
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
`;

const OverviewSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--color-gray-light);
`;

const OverviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: var(--color-offwhite);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 8px 0;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--color-gray-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CircleScore = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 12px 0;
  background-color: ${props => {
    if (props.score >= 80) return 'var(--color-compliance-full)';
    if (props.score >= 40) return 'var(--color-compliance-partial)';
    return 'var(--color-compliance-non)';
  }};
`;

const MetadataSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--color-gray-light);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetadataLabel = styled.div`
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const MetadataValue = styled.div`
  font-size: 14px;
  color: var(--color-navy);
  font-weight: 500;
`;

const FlaggedItemsSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--color-gray-light);
`;

const FlaggedItemsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-compliance-non);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
  }
`;

const FlaggedItem = styled.div`
  background-color: var(--color-offwhite);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 3px solid var(--color-compliance-non);
`;

const FlaggedItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const FlaggedItemCategory = styled.div`
  font-size: 13px;
  color: var(--color-gray-medium);
`;

const FlaggedItemContent = styled.div`
  font-size: 14px;
  color: var(--color-navy);
  font-weight: 500;
  margin-bottom: 12px;
`;

const FlaggedItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const SectionsSection = styled.div`
  padding: 24px;
`;

const SectionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-navy);
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SectionItem = styled.div`
  margin-bottom: 16px;
`;

const SectionItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-offwhite);
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-skyblue);
  }
`;

const SectionItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
  
  .section-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-navy);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const SectionScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .score-display {
    font-size: 14px;
    font-weight: 600;
    color: ${props => {
      if (props.score >= 80) return 'var(--color-compliance-full)';
      if (props.score >= 40) return 'var(--color-compliance-partial)';
      return 'var(--color-compliance-non)';
    }};
  }
  
  .percentage {
    font-size: 12px;
    color: var(--color-gray-medium);
  }
`;

const SectionItemContent = styled.div`
  background-color: white;
  border: 1px solid var(--color-gray-light);
  border-radius: 0 0 8px 8px;
  margin-top: 2px;
  padding: ${props => props.isOpen ? '16px' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--color-gray-light);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: var(--color-navy);
  color: white;
  
  &:hover {
    background-color: var(--color-navy-dark);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: var(--color-navy);
  border: 1px solid var(--color-gray-light);
  
  &:hover {
    background-color: var(--color-offwhite);
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 16px;
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

const StatusIcon = ({ status, size = 16 }) => {
  switch (status) {
    case 'full_compliance':
      return <CheckCircle size={size} />;
    case 'partial_compliance':
      return <AlertCircle size={size} />;
    case 'non_compliance':
      return <XCircle size={size} />;
    case 'not_applicable':
      return <AlertCircle size={size} style={{ opacity: 0.5 }} />;
    default:
      return <AlertCircle size={size} style={{ opacity: 0.5 }} />;
  }
};

const ReportPreviewComponent = ({ 
  reportData = {
    title: 'Tourism Beach Operator Checklist',
    score: 20,
    maxScore: 318,
    completedAt: '24 Apr 2025 5:53 AM',
    sections: [
      { 
        id: 'a1', 
        name: 'Management Systems', 
        score: 12, 
        maxScore: 36, 
        status: 'partial_compliance',
        items: [
          { title: 'A.1.1 Is the beach organizational structure available?', status: 'full_compliance' },
          { title: 'A.1.2 Does the beach operator have a liability insurance arrangement?', status: 'full_compliance' },
          { title: 'A.1.3 Is the Beach Management Committee with the relevant local or national stakeholder available?', status: 'full_compliance' },
          { title: 'A.1.4 Is the audit from specialized environmental management institutions conducted to control environmental activities?', status: 'full_compliance' },
        ]
      },
      { 
        id: 'b1', 
        name: 'Beach Infrastructure', 
        score: 3, 
        maxScore: 24, 
        status: 'non_compliance',
        items: [
          { title: 'B.1.1 Is the beach clean and free of litter?', status: 'partial_compliance' },
          { title: 'B.1.2 Are proper waste bins available and regularly emptied?', status: 'non_compliance' },
          { title: 'B.1.3 Are sanitary facilities available and well-maintained?', status: 'non_compliance' },
        ]
      },
      { 
        id: 'c1', 
        name: 'Water Quality', 
        score: 5, 
        maxScore: 20, 
        status: 'partial_compliance',
        items: [
          { title: 'C.1.1 Is water quality testing conducted regularly?', status: 'partial_compliance' },
          { title: 'C.1.2 Are test results publicly displayed?', status: 'full_compliance' },
          { title: 'C.1.3 Is there a system to address pollution incidents?', status: 'non_compliance' },
        ]
      },
    ],
    flaggedItems: [
      { 
        id: 'f1', 
        category: 'Management Systems', 
        title: 'Missing standard operating procedure for business operations', 
        date: '24 Apr 2025' 
      },
      { 
        id: 'f2', 
        category: 'Environmental Plan', 
        title: 'No environmental plan with goals available', 
        date: '24 Apr 2025' 
      },
      { 
        id: 'f3', 
        category: 'Risk Assessment', 
        title: 'Missing risk assessment plan with mitigation measures', 
        date: '24 Apr 2025' 
      }
    ],
    metadata: {
      documentNumber: 'Marina Operator 000001',
      inspectionLocation: 'Jeddah Beach Front',
      inspectionDate: '23 Apr 2025',
      inspectorName: 'Mohammed Al Farsi',
      operatorName: 'Red Sea Tourism LLC'
    }
  }
}) => {
  const [openSection, setOpenSection] = useState(null);
  const [logoError, setLogoError] = useState(false);
  
  const toggleSection = (sectionId) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
    }
  };
  
  const score = reportData?.score || 0;
  const maxScore = reportData?.maxScore || 0;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  const getComplianceStatus = (percent) => {
    if (percent >= 80) return 'full_compliance';
    if (percent >= 40) return 'partial_compliance';
    return 'non_compliance';
  };
  
  const overallStatus = getComplianceStatus(percentage);
  
  if (!reportData) {
    return <div>No report data available</div>;
  }
  
  return (
    <PreviewContainer>
      <PreviewHeader>
        <LogoContainer>
          {!logoError && (
            <Logo 
              src="/assets/logo.png" 
              alt="Mirsat Logo" 
              onError={() => setLogoError(true)} 
            />
          )}
        </LogoContainer>
        <ReportTitle>{reportData.title || 'Template Report'}</ReportTitle>
        <ReportSubtitle>Template Report</ReportSubtitle>
      </PreviewHeader>
      
      <OverviewSection>
        <OverviewHeader>
          <BarChart2 size={20} />
          Overview
        </OverviewHeader>
        
        <OverviewGrid>
          <StatCard>
            <Award size={24} color="var(--color-navy)" />
            <CircleScore score={percentage}>{percentage}%</CircleScore>
            <StatLabel>Overall Score</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{score} / {maxScore}</StatValue>
            <StatLabel>Points Scored</StatLabel>
          </StatCard>
          
          <StatCard>
            <Flag size={24} color="var(--color-compliance-non)" />
            <StatValue>{reportData.flaggedItems?.length || 0}</StatValue>
            <StatLabel>Flagged Items</StatLabel>
          </StatCard>
        </OverviewGrid>
      </OverviewSection>
      
      <MetadataSection>
        <MetadataItem>
          <MetadataLabel>Document Control Number</MetadataLabel>
          <MetadataValue>{reportData.metadata?.documentNumber || 'Not specified'}</MetadataValue>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataLabel>Beach Operator</MetadataLabel>
          <MetadataValue>{reportData.metadata?.operatorName || 'Not specified'}</MetadataValue>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataLabel>Template Location</MetadataLabel>
          <MetadataValue>{reportData.metadata?.inspectionLocation || 'Not specified'}</MetadataValue>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataLabel>Template Date</MetadataLabel>
          <MetadataValue>{reportData.metadata?.inspectionDate || 'Not specified'}</MetadataValue>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataLabel>Inspector Name</MetadataLabel>
          <MetadataValue>{reportData.metadata?.inspectorName || 'Not specified'}</MetadataValue>
        </MetadataItem>
        
        <MetadataItem>
          <MetadataLabel>Report Generated</MetadataLabel>
          <MetadataValue>{reportData.completedAt || 'Not specified'}</MetadataValue>
        </MetadataItem>
      </MetadataSection>
      
      {reportData.flaggedItems && reportData.flaggedItems.length > 0 && (
        <FlaggedItemsSection>
          <FlaggedItemsHeader>
            <h2>
              <Flag size={18} />
              Flagged Items
            </h2>
            <div className="count">{reportData.flaggedItems.length}</div>
          </FlaggedItemsHeader>
          
          {reportData.flaggedItems.map(item => (
            <FlaggedItem key={item.id || Math.random().toString()}>
              <FlaggedItemHeader>
                <FlaggedItemCategory>{item.category || 'Uncategorized'}</FlaggedItemCategory>
                <StatusBadge status="non_compliance">
                  <XCircle size={14} />
                  <span>Non Compliant</span>
                </StatusBadge>
              </FlaggedItemHeader>
              
              <FlaggedItemContent>{item.title || 'No description'}</FlaggedItemContent>
              
              <FlaggedItemFooter>
                <div>Flagged on: {item.date || 'Unknown date'}</div>
              </FlaggedItemFooter>
            </FlaggedItem>
          ))}
        </FlaggedItemsSection>
      )}
      
      <SectionsSection>
        <SectionsHeader>
          <h2>
            <FileText size={18} />
            Template Sections
          </h2>
        </SectionsHeader>
        
        {(reportData.sections || []).map((section, index) => {
          const sectionPercentage = section.maxScore > 0 
            ? Math.round((section.score / section.maxScore) * 100) 
            : 0;
          
          return (
            <SectionItem key={section.id || index}>
              <SectionItemHeader onClick={() => toggleSection(section.id)}>
                <SectionItemTitle>
                  <span className="section-number">{String.fromCharCode(65 + index)}</span>
                  {section.name || `Section ${index + 1}`}
                </SectionItemTitle>
                
                <SectionScore score={sectionPercentage}>
                  <StatusBadge status={section.status || 'not_applicable'}>
                    <StatusIcon status={section.status || 'not_applicable'} />
                    <span>{sectionPercentage}%</span>
                  </StatusBadge>
                  <span className="score-display">{section.score || 0}/{section.maxScore || 0}</span>
                  {openSection === section.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </SectionScore>
              </SectionItemHeader>
              
              <SectionItemContent isOpen={openSection === section.id}>
                {(section.items || []).map((item, itemIndex) => (
                  <div key={item.title || itemIndex} style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px solid var(--color-gray-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--color-navy)' }}>{item.title || `Item ${itemIndex + 1}`}</div>
                    <StatusBadge status={item.status || 'not_applicable'}>
                      <StatusIcon status={item.status || 'not_applicable'} />
                    </StatusBadge>
                  </div>
                ))}
              </SectionItemContent>
            </SectionItem>
          );
        })}
      </SectionsSection>
      
      {/* <ActionButtons>
        <PrimaryButton>
          <File size={16} />
          Download PDF
        </PrimaryButton>
        
        <SecondaryButton>
          <MessageSquare size={16} />
          Add Notes
        </SecondaryButton>
      </ActionButtons> */}
    </PreviewContainer>
  );
};

export default ReportPreviewComponent; 