import { describe, expect, it } from 'vitest';
import { COMPACT_LAYOUT_MAX_WIDTH, isCompactViewport } from './layout';

describe('isCompactViewport', () => {
  it('uses the compact shell through tablet landscape widths', () => {
    expect(isCompactViewport(360)).toBe(true);
    expect(isCompactViewport(768)).toBe(true);
    expect(isCompactViewport(1024)).toBe(true);
    expect(isCompactViewport(COMPACT_LAYOUT_MAX_WIDTH)).toBe(true);
  });

  it('keeps the desktop shell only when there is sufficient width', () => {
    expect(isCompactViewport(COMPACT_LAYOUT_MAX_WIDTH + 1)).toBe(false);
    expect(isCompactViewport(1280)).toBe(false);
  });
});
