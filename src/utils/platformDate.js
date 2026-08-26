/**
 * Formats date-only values consistently regardless of the browser locale,
 * calendar, or surrounding text direction. Inspection deadlines are business
 * dates, so UTC is intentional: every user sees the same calendar date.
 */
export const formatPlatformDate = (value, fallback = '') => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear());

  return `${day}/${month}/${year}`;
};

/**
 * Keeps the date component deterministic while preserving the existing local
 * time-zone behaviour for time-of-day displays.
 */
export const formatPlatformDateTime = (value, fallback = '') => {
  const dateText = formatPlatformDate(value);
  if (!dateText) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  const timeText = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateText}, ${timeText}`;
};
