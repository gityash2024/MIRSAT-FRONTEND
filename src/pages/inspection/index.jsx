// src/pages/inspection/index.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import InspectionLevelList from './InspectionLevelList';

const InspectionLevel = () => {
  const location = useLocation();
  const isListView = location.pathname === '/inspection';

  return (
    <div>
      {isListView ? (
        // Show InspectionLevelList component directly when on the main inspection route
        <InspectionLevelList />
      ) : (
        // Show nested routes (create, edit, view) using Outlet
        <Outlet />
      )}
    </div>
  );
};

export default InspectionLevel;