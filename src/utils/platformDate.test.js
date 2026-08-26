import { describe, expect, it } from 'vitest';
import { formatPlatformDate, formatPlatformDateTime } from './platformDate';

describe('formatPlatformDate', () => {
  it('uses a fixed DD/MM/YYYY Gregorian format independent of browser locale', () => {
    expect(formatPlatformDate('2026-08-26T21:00:00.000Z')).toBe('26/08/2026');
  });

  it('keeps a date-only deadline on its intended calendar date', () => {
    expect(formatPlatformDate('2026-08-27')).toBe('27/08/2026');
  });

  it('uses the supplied fallback for missing or invalid dates', () => {
    expect(formatPlatformDate(null, '—')).toBe('—');
    expect(formatPlatformDate('not-a-date', '—')).toBe('—');
  });

  it('keeps the date portion fixed when a time is also displayed', () => {
    expect(formatPlatformDateTime('2026-08-26T21:00:00.000Z')).toMatch(/^26\/08\/2026, /);
  });
});
