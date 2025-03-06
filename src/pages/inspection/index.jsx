import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import InspectionLevelList from './InspectionLevelList';
import InspectionLevelTree from './InspectionLevelTree';
import { inspectionService } from '../../services/inspection.service';

const Container = styled.div`
  width: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding: 16px 24px;
`;

const TabGroup = styled.div`
  display: flex;
  background: #ffffff;
  padding: 6px;
  border-radius: 8px;
  gap: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TabButton = styled.button`
  min-width: 140px;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  ${props => props.active ? `
    background: #1a237e;
    color: white;
    box-shadow: 0 2px 4px rgba(26, 35, 126, 0.2);
  ` : `
    background: #f5f7fb;
    color: #666;
    
    &:hover {
      background: #e8eaf6;
      color: #1a237e;
    }
  `}

  svg {
    width: 18px;
    height: 18px;
    ${props => !props.active && `
      opacity: 0.6;
    `}
  }
`;

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/inspection';
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('normal');

  const handleError = (error) => {
    toast.error(error?.response?.data?.message || 'An error occurred');
    setLoading(false);
  };

  const renderContent = () => {
    if (!isListView) {
      return (
        <Outlet 
          context={{
            loading,
            setLoading,
            handleError,
            inspectionService
          }} 
        />
      );
    }

    const props = {
      loading,
      setLoading,
      handleError,
      inspectionService
    };

    return viewType === 'normal' ? (
      <InspectionLevelList {...props} />
    ) : (
      <InspectionLevelTree {...props} />
    );
  };

  return (
    <Container>
      {isListView && (
        <TabContainer>
          <TabGroup>
            <TabButton 
              active={viewType === 'normal'} 
              onClick={() => setViewType('normal')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Normal View
            </TabButton>
            <TabButton 
              active={viewType === 'tree'} 
              onClick={() => setViewType('tree')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M5 8h14M8 14h8" />
              </svg>
              Tree View
            </TabButton>
          </TabGroup>
        </TabContainer>
      )}
      {renderContent()}
    </Container>
  );
};

export default InspectionLevel;