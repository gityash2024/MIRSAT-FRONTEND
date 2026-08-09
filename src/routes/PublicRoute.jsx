import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteForUser } from '../utils/defaultRoute';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }
  
  return children;
};

export default PublicRoute;
