import { describe, expect, it } from 'vitest';
import { canAccessDashboard, getDefaultRouteForUser } from './defaultRoute';

describe('getDefaultRouteForUser', () => {
  it('always sends a manager to Dashboard because it is a fixed module', () => {
    expect(getDefaultRouteForUser({
      role: 'manager',
      permissions: ['access_users', 'access_template', 'access_calendar', 'access_profile'],
    })).toBe('/dashboard');
  });

  it('keeps Dashboard as the first route when the manager has Dashboard access', () => {
    expect(getDefaultRouteForUser({
      role: 'manager',
      permissions: ['access_dashboard', 'access_users'],
    })).toBe('/dashboard');
  });

  it('allows direct Dashboard access for a manager without a stored module permission', () => {
    expect(canAccessDashboard({ role: 'manager', permissions: ['access_users'] })).toBe(true);
  });

  it('preserves the inspector dashboard route', () => {
    expect(getDefaultRouteForUser({ role: 'inspector', permissions: [] })).toBe('/user-dashboard');
  });
});
