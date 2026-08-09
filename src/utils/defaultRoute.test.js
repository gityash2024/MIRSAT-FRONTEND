import { describe, expect, it } from 'vitest';
import { canAccessDashboard, getDefaultRouteForUser } from './defaultRoute';

describe('getDefaultRouteForUser', () => {
  it('sends a manager to their first permitted module instead of Dashboard', () => {
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

  it('blocks direct Dashboard access for a manager without the module permission', () => {
    expect(canAccessDashboard({ role: 'manager', permissions: ['access_users'] })).toBe(false);
  });

  it('preserves the inspector dashboard route', () => {
    expect(getDefaultRouteForUser({ role: 'inspector', permissions: [] })).toBe('/user-dashboard');
  });
});
