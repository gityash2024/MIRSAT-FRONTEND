import { describe, expect, it } from 'vitest';
import { classifyLoginError } from './authSlice';

describe('login error classification', () => {
  it('keeps genuine authentication responses as server messages', () => {
    expect(classifyLoginError({
      response: { status: 401, data: { message: 'Invalid credentials' } },
    })).toEqual({ code: 'server', message: 'Invalid credentials' });
  });

  it('does not label timeout and gateway failures as account problems', () => {
    expect(classifyLoginError({ code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' }))
      .toEqual({ code: 'timeout' });
    expect(classifyLoginError({ response: { status: 504 } }))
      .toEqual({ code: 'service_unavailable' });
    expect(classifyLoginError({ request: {} }))
      .toEqual({ code: 'network_unavailable' });
  });
});
