import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import InspectionLevelList from './InspectionLevelList';
import { inspectionService } from '../../services/inspection.service';
// import LevelListSkeleton from './LevelListSkeleton'; // COMMENTED OUT

const Container = styled.div`
  width: 100%;
`;

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/templates';
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const { t } = useTranslation();

  // Store inspection data separately from rendering logic
  const [inspectionData, setInspectionData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0
  });

  // For controlled components
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: [],
    status: [],
    priority: []
  });

  // Prevent fetch loops
  const debounceTimerRef = useRef(null);
  const initialFetchDoneRef = useRef(false);
  const queryEffectReadyRef = useRef(false);
  const requestVersionRef = useRef(0);
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
      toast.error(t('errors.tooManyRequests'));
      setLoading(false);
      setTimeout(() => setErrorCount(0), 5000);
    }
  }, [errorCount, t]);

  const handleError = useCallback((error) => {
    console.error('Error in Inspection module:', error);

    if (error?.response?.status === 429) {
      setErrorCount(prev => prev + 1);
      toast.error(t('errors.tooManyRequests'));
    } else {
      toast.error(error?.response?.data?.message || error?.message || t('errors.genericError'));
    }

    setLoading(false);
    isFetchingRef.current = false;
  }, [t]);

  // Stable fetch function that doesn't change with re-renders
  const fetchInspectionLevels = useCallback(async () => {
    if (unmountedRef.current) return;

    const requestVersion = ++requestVersionRef.current;
    setLoading(true);

    try {
      const params = {
        ...filters,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      };

      console.log('Fetching inspection data with params:', params);
      const response = await inspectionService.getInspectionLevels(params);

      if (!unmountedRef.current && requestVersion === requestVersionRef.current) {
        setInspectionData(response?.results || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response?.totalPages || 1,
          totalResults: response?.totalResults || 0
        }));
        initialFetchDoneRef.current = true;
      }
    } catch (error) {
      if (!unmountedRef.current && requestVersion === requestVersionRef.current) {
        console.error('Error fetching inspection levels:', error);
        handleError(error);
      }
    } finally {
      if (!unmountedRef.current && requestVersion === requestVersionRef.current) {
        setLoading(false);
      }
    }
  }, [filters, searchTerm, pagination.page, pagination.limit, handleError]);

  // Initial data fetch only
  useEffect(() => {
    if (isListView && !initialFetchDoneRef.current) {
      console.log('Initial fetch');
      initialFetchDoneRef.current = true;
      fetchInspectionLevels();
    }
  }, [isListView, fetchInspectionLevels]);

  useEffect(() => {
    if (!isListView) {
      initialFetchDoneRef.current = false;
      queryEffectReadyRef.current = false;
    }
  }, [isListView]);

  // When filters or search changes, debounce the fetch
  useEffect(() => {
    if (!isListView) return undefined;

    // The initial fetch above owns the first load. Subsequent changes are
    // debounced so the searchable list remains mounted and focused.
    if (!queryEffectReadyRef.current) {
      queryEffectReadyRef.current = true;
      return;
    }

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
  }, [filters, searchTerm, pagination.page, pagination.limit, isListView, fetchInspectionLevels]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
      fetchData: fetchInspectionLevels,
      pagination,
      onPageChange: handlePageChange
    };

    return <InspectionLevelList {...sharedProps} />;
  }, [
    isListView, loading, handleError,
    inspectionService, inspectionData, searchTerm, filters, pagination, fetchInspectionLevels
  ]);

  return (
    <Container>
      {renderContent()}
    </Container>
  );
};

export default InspectionLevel;
