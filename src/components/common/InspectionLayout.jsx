import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  LayoutTemplate, 
  FileText, 
  Settings, 
  Save, 
  HelpCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-offwhite);
`;

const Header = styled.header`
  background-color: white;
  border-bottom: 1px solid var(--color-gray-light);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-gray-dark);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-gray-light);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-navy);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-navy-dark);
  }
`;

const PublishButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-compliance-full);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const HelpButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid var(--color-gray-light);
  color: var(--color-gray-dark);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--color-gray-light);
    color: var(--color-navy);
  }
`;

const SettingsButton = styled(HelpButton)``;

const TabsContainer = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--color-gray-light);
  background-color: white;
`;

const TabItem = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  max-width: 200px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.isActive ? 'var(--color-navy)' : 'transparent'};
  }
  
  &:hover {
    background-color: ${props => props.isActive ? 'white' : 'var(--color-offwhite)'};
  }
`;

const TabLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: ${props => props.isActive ? 'var(--color-navy)' : 'var(--color-gray-medium)'};
  text-decoration: none;
  font-weight: ${props => props.isActive ? '600' : '400'};
  height: 100%;
  
  &:hover {
    color: var(--color-navy);
  }
  
  svg {
    opacity: ${props => props.isActive ? 1 : 0.7};
  }
`;

const TabNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.isActive ? 'var(--color-navy)' : 'var(--color-gray-light)'};
  color: ${props => props.isActive ? 'white' : 'var(--color-gray-dark)'};
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
`;

const TabLabel = styled.span`
  display: flex;
  align-items: center;
`;

const ContentWrapper = styled.main`
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: white;
  border-bottom: 1px solid var(--color-gray-light);
  color: var(--color-gray-medium);
  font-size: 13px;
`;

const StatusText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      color: ${props => {
        if (props.status === 'saved') return 'var(--color-compliance-full)';
        if (props.status === 'saving') return 'var(--color-warning)';
        if (props.status === 'error') return 'var(--color-danger)';
        return 'var(--color-compliance-partial)';
      }};
    }
  }
`;

const LastPublished = styled.div``;

const InspectionLayout = ({ 
  title = 'Inspection Template', 
  children,
  isSaved = true,
  lastPublished = null,
  onBack,
  onSave,
  onPublish,
  baseUrl = '',
  saveStatus = 'saved'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Check which tab is active based on the path
  const isReportTab = path.includes('/report');
  
  // Handle navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  // Get status text based on save status
  const getStatusText = () => {
    switch(saveStatus) {
      case 'saving':
        return 'Saving changes...';
      case 'error':
        return 'Error saving changes';
      case 'pending':
        return 'Unsaved changes';
      case 'saved':
      default:
        return 'Changes saved automatically';
    }
  };
  
  // Get icon based on save status
  const getStatusIcon = () => {
    switch(saveStatus) {
      case 'saving':
        return <Clock size={14} />;
      case 'error':
        return <AlertCircle size={14} />;
      case 'pending':
        return <AlertCircle size={14} />;
      case 'saved':
      default:
        return <Save size={14} />;
    }
  };
  
  return (
    <PageWrapper>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={18} />
            Back
          </BackButton>
        </HeaderLeft>
        
        <HeaderRight>
          {onPublish && (
            <PublishButton onClick={onPublish}>
              Publish
            </PublishButton>
          )}
          
          <HelpButton>
            <HelpCircle size={18} />
          </HelpButton>
          
          <SettingsButton>
            <Settings size={18} />
          </SettingsButton>
        </HeaderRight>
      </Header>
      
      <TabsContainer>
        <TabItem isActive={!isReportTab}>
          <TabLink to={`${baseUrl}/build`} isActive={!isReportTab}>
            <TabLabel>
              <TabNumber isActive={!isReportTab}>1</TabNumber>
              Build
            </TabLabel>
          </TabLink>
        </TabItem>
        
        <TabItem isActive={isReportTab}>
          <TabLink to={`${baseUrl}/report`} isActive={isReportTab}>
            <TabLabel>
              <TabNumber isActive={isReportTab}>2</TabNumber>
              Report
            </TabLabel>
          </TabLink>
        </TabItem>
      </TabsContainer>
      
      <StatusBar>
        <StatusText status={saveStatus}>
          <span>
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </StatusText>
        
        {lastPublished && (
          <LastPublished>
            Last saved: {lastPublished}
          </LastPublished>
        )}
      </StatusBar>
      
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default InspectionLayout; 