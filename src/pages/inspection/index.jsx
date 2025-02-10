import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import InspectionLevelList from './InspectionLevelList';
import { inspectionService } from '../../services/inspection.service';

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/inspection';
  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    toast.error(error?.response?.data?.message || 'An error occurred');
    setLoading(false);
  };

  const outletContext = {
    loading,
    setLoading,
    handleError,
    inspectionService
  };

  return (
    <div>
      {isListView ? (
        <InspectionLevelList 
          loading={loading}
          setLoading={setLoading}
          handleError={handleError}
          inspectionService={inspectionService}
        />
      ) : (
        <Outlet context={outletContext} />
      )}
    </div>
  );
};

export default InspectionLevel;