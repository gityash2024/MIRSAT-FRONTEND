import { describe, expect, it } from 'vitest';
import { canAccessDashboard, getDefaultRouteForUser } from './defaultRoute';

describe('getDefaultRouteForUser', () => {
  it('sends a manager without Dashboard access to their first permitted module', () => {
    expect(getDefaultRouteForUser({
      role: 'manager',
      permissions: ['access_users', 'access_template', 'access_calendar', 'access_profile'],
    })).toBe('/users');
  });

  it('keeps Dashboard as the first route when the manager has Dashboard access', () => {
    expect(getDefaultRouteForUser({
      role: 'manager',
      permissions: ['access_dashboard', 'access_users'],
    })).toBe('/dashboard');
  });

  it('uses Profile when a legacy manager has no selectable modules', () => {
    expect(getDefaultRouteForUser({ role: 'manager', permissions: [] })).toBe('/profile');
  });

  it('allows direct Dashboard access only when a manager has the module permission', () => {
    expect(canAccessDashboard({ role: 'manager', permissions: ['access_users'] })).toBe(false);
    expect(canAccessDashboard({ role: 'manager', permissions: ['access_dashboard'] })).toBe(true);
  });

  it('allows administrators and supervisors to render Dashboard without a manager module flag', () => {
    expect(canAccessDashboard({ role: 'admin', permissions: [] })).toBe(true);
    expect(canAccessDashboard({ role: 'superadmin', permissions: [] })).toBe(true);
    expect(canAccessDashboard({ role: 'supervisor', permissions: [] })).toBe(true);
  });

  it('preserves the inspector dashboard route', () => {
    expect(getDefaultRouteForUser({ role: 'inspector', permissions: [] })).toBe('/user-dashboard');
  });
});
