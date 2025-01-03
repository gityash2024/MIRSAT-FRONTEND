import { usePermissions } from '../../hooks/usePermissions';

export const PermissionGate = ({ 
  permission, 
  role, 
  children 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  if (permission && !hasPermission(permission)) return null;
  if (role && !hasRole(role)) return null;

  return children;
};