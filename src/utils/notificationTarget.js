import { ROLES } from './permissions';

const safeInternalPath = (value) => (
  typeof value === 'string'
  && value.startsWith('/')
  && !value.startsWith('//')
  && !value.includes('\\')
);

export const resolveNotificationPath = (notification, role) => {
  const target = notification?.data?.target;
  const resourceId = target?.resourceId || notification?.data?.taskId;

  if ((target?.resourceType === 'task' || resourceId) && resourceId) {
    if (role === ROLES.INSPECTOR) {
      return safeInternalPath(target?.inspectorPath)
        ? target.inspectorPath
        : `/user-tasks/${resourceId}`;
    }
    return safeInternalPath(target?.adminPath)
      ? target.adminPath
      : `/tasks/${resourceId}`;
  }

  return safeInternalPath(notification?.data?.link)
    ? notification.data.link
    : '/notifications';
};

