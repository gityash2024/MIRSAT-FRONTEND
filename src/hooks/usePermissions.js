import { useSelector } from 'react-redux';
import { ROLE_PERMISSIONS } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useSelector(state => state.auth);

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  return { hasPermission, hasRole };
};