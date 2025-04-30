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
  saveStatus = 'saved',
  showBuildTabOnly = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Check which tab is active based on the path
  const isReportTab = path.includes('/report');
  const isSettingsTab = path.includes('/settings');
  const isPreviewTab = path.includes('/preview');
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/inspection');
    }
  };
  
  const getStatusText = () => {
    if (saveStatus === 'saved') return 'All changes saved';
    if (saveStatus === 'saving') return 'Saving changes...';
    if (saveStatus === 'error') return 'Error saving changes';
    return 'Unsaved changes';
  };
  
  const getStatusIcon = () => {
    if (saveStatus === 'saved') return <Save size={14} />;
    if (saveStatus === 'saving') return <Clock size={14} />;
    if (saveStatus === 'error') return <AlertCircle size={14} />;
    return <Clock size={14} />;
  };

  return (
    <PageWrapper>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </BackButton>
          <h1 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--color-navy)'
          }}>
            {title}
          </h1>
        </HeaderLeft>
        <HeaderRight>
          {/* Additional buttons rendered based on path */}
          {path.includes('/edit') && onSave && (
            <SaveButton onClick={onSave}>
              <Save size={16} />
              Save Template
            </SaveButton>
          )}
          
          {onPublish && !path.includes('/edit') && (
            <PublishButton onClick={onPublish}>
              <LayoutTemplate size={16} />
              Publish
            </PublishButton>
          )}
          
          {/* Question icon removed */}
          
          {/* Settings icon removed */}
          
          <HelpButton title="Help">
            <HelpCircle size={18} />
          </HelpButton>
        </HeaderRight>
      </Header>
      
      {path.includes('/edit') && (
        <TabsContainer>
          <TabItem isActive={!isReportTab && !isSettingsTab && !isPreviewTab}>
            <TabLink 
              to={`${baseUrl}/edit/build`}
              isActive={!isReportTab && !isSettingsTab && !isPreviewTab}
            >
              <TabLabel>
                <TabNumber isActive={!isReportTab && !isSettingsTab && !isPreviewTab}>1</TabNumber>
                Build Template
              </TabLabel>
            </TabLink>
          </TabItem>
          
          {!showBuildTabOnly && (
            <>
              <TabItem isActive={isReportTab}>
                <TabLink 
                  to={`${baseUrl}/edit/report`}
                  isActive={isReportTab}
                >
                  <TabLabel>
                    <TabNumber isActive={isReportTab}>2</TabNumber>
                    Reports
                  </TabLabel>
                </TabLink>
              </TabItem>
              
              <TabItem isActive={isSettingsTab}>
                <TabLink 
                  to={`${baseUrl}/edit/settings`}
                  isActive={isSettingsTab}
                >
                  <TabLabel>
                    <TabNumber isActive={isSettingsTab}>3</TabNumber>
                    Settings
                  </TabLabel>
                </TabLink>
              </TabItem>
            </>
          )}
        </TabsContainer>
      )}
      
      {path.includes('/edit') && (
        <StatusBar>
          <StatusText status={saveStatus}>
            <span>
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </StatusText>
          {lastPublished && (
            <LastPublished>
              Last published: {lastPublished}
            </LastPublished>
          )}
        </StatusBar>
      )}
      
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default InspectionLayout; 