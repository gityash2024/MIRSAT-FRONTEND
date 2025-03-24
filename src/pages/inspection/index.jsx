import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import InspectionLevelList from './InspectionLevelList';
import InspectionLevelTree from './InspectionLevelTree';
import { inspectionService } from '../../services/inspection.service';
import LevelListSkeleton from './LevelListSkeleton';
import InspectionLevelTreeSkeleton from './InspectionLevelTreeSkeleton';

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
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/inspection';
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('normal');
  const [errorCount, setErrorCount] = useState(0);
  const [viewSwitching, setViewSwitching] = useState(false);
  
  // Store inspection data separately from rendering logic
  const [inspectionData, setInspectionData] = useState([]);
  
  // For controlled components
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    status: [],
    priority: []
  });
  
  // Prevent fetch loops
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  const unmountedRef = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle rate limit detection
  useEffect(() => {
    if (errorCount > 3) {
      toast.error('Too many requests. Please wait a moment before trying again.');
      setLoading(false);
      setTimeout(() => setErrorCount(0), 5000);
    }
  }, [errorCount]);

  const handleError = useCallback((error) => {
    console.error('Error in Inspection module:', error);
    
    if (error?.response?.status === 429) {
      setErrorCount(prev => prev + 1);
      toast.error('Too many requests. Please wait a moment before trying again.');
    } else {
      toast.error(error?.response?.data?.message || error?.message || 'An error occurred');
    }
    
    setLoading(false);
    isFetchingRef.current = false;
  }, []);

  // Stable fetch function that doesn't change with re-renders
  const fetchInspectionLevels = useCallback(async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current || unmountedRef.current) {
      console.log('Skipping fetch - already in progress or component unmounted');
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const params = {
        ...filters,
        search: searchTerm,
        _t: Date.now() // Cache buster
      };
      
      console.log('Fetching inspection data with params:', params);
      const response = await inspectionService.getInspectionLevels(params);
      
      if (!unmountedRef.current) {
        setInspectionData(response?.results || []);
        initialFetchDoneRef.current = true;
      }
    } catch (error) {
      if (!unmountedRef.current) {
        console.error('Error fetching inspection levels:', error);
        handleError(error);
      }
    } finally {
      if (!unmountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [filters, searchTerm, handleError]);

  // Initial data fetch only
  useEffect(() => {
    if (isListView && !initialFetchDoneRef.current && !isFetchingRef.current) {
      console.log('Initial fetch');
      fetchInspectionLevels();
    }
  }, [isListView, fetchInspectionLevels]);

  // When filters or search changes, debounce the fetch
  useEffect(() => {
    // Skip the initial render-triggered effect
    if (!initialFetchDoneRef.current) return;
    
    console.log('Filter/search change detected, debouncing fetch');
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchInspectionLevels();
    }, 500);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, searchTerm, fetchInspectionLevels]);

  const handleViewChange = (newType) => {
    if (newType !== viewType) {
      setViewSwitching(true);
      setViewType(newType);
      
      // Short timeout to ensure proper transition between view types
      setTimeout(() => {
        setViewSwitching(false);
      }, 50);
    }
  };
  
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const renderContent = useCallback(() => {
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

    const sharedProps = {
      loading,
      setLoading,
      handleError,
      inspectionService,
      data: inspectionData,
      searchTerm,
      onSearchChange: handleSearchChange,
      filters,
      onFilterChange: handleFilterChange,
      fetchData: fetchInspectionLevels
    };

    if (loading || viewSwitching) {
      return viewType === 'normal' ? <LevelListSkeleton /> : <InspectionLevelTreeSkeleton />;
    }

    return viewType === 'normal' ? (
      <InspectionLevelList {...sharedProps} />
    ) : (
      <InspectionLevelTree {...sharedProps} />
    );
  }, [
    isListView, loading, viewType, handleError, viewSwitching, 
    inspectionService, inspectionData, searchTerm, filters, fetchInspectionLevels
  ]);

  return (
    <Container>
      {isListView && (
        <TabContainer>
          <TabGroup>
            <TabButton 
              active={viewType === 'normal'} 
              onClick={() => handleViewChange('normal')}
              disabled={loading}
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
              onClick={() => handleViewChange('tree')}
              disabled={loading}
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