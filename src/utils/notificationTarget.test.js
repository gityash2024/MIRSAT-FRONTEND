import { describe, expect, it } from 'vitest';
import { ROLES } from './permissions';
import { resolveNotificationPath } from './notificationTarget';

describe('resolveNotificationPath', () => {
  const notification = {
    data: {
      taskId: 'task-123',
      target: {
        resourceType: 'task',
        resourceId: 'task-123',
        inspectorPath: '/user-tasks/task-123',
        adminPath: '/tasks/task-123'
      }
    }
  };

  it('opens the inspector task view for inspector notifications', () => {
    expect(resolveNotificationPath(notification, ROLES.INSPECTOR)).toBe('/user-tasks/task-123');
  });

  it('opens the task-management view for non-inspector notifications', () => {
    expect(resolveNotificationPath(notification, ROLES.MANAGER)).toBe('/tasks/task-123');
  });

  it('does not follow unsafe legacy notification links', () => {
    expect(resolveNotificationPath({ data: { link: '//outside.example' } }, ROLES.MANAGER))
      .toBe('/notifications');
  });
});
