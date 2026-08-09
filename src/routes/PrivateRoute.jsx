import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteForUser } from '../utils/defaultRoute';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  console.log("PrivateRoute check:", {
    path: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    hasAccess: allowedRoles.length === 0 || allowedRoles.includes(user?.role)
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log(`User with role ${user?.role} doesn't have access to route ${location.pathname}`);
    
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
