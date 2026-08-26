export const COMPACT_LAYOUT_MAX_WIDTH = 1100;

/**
 * Uses available viewport width rather than device detection so tablets,
 * resized windows, and future screen sizes receive the same safe layout.
 */
export const isCompactViewport = (viewportWidth) => (
  Number(viewportWidth) <= COMPACT_LAYOUT_MAX_WIDTH
);
