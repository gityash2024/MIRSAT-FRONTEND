import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { Loader } from 'lucide-react';
import InspectionLevelList from './InspectionLevelList';
import { inspectionService } from '../../services/inspection.service';
// import LevelListSkeleton from './LevelListSkeleton'; // COMMENTED OUT

const Container = styled.div`
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 24px;
  flex-direction: column;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/inspection';
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  
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

    if (loading) {
      return (
        <LoadingContainer>
          <Loader size={40} color="var(--color-navy)" />
          <p style={{ 
            marginTop: '16px', 
            color: 'var(--color-navy)', 
            fontSize: '16px' 
          }}>
            Templates loading...
          </p>
        </LoadingContainer>
      );
    }

    return <InspectionLevelList {...sharedProps} />;
  }, [
    isListView, loading, handleError, 
    inspectionService, inspectionData, searchTerm, filters, fetchInspectionLevels
  ]);

  return (
    <Container>
      {renderContent()}
    </Container>
  );
};

export default InspectionLevel;