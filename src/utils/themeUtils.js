import { cssVariables } from '../config/theme';

/**
 * Utility functions to maintain consistent theming across the application
 */

/**
 * Maps status names to their corresponding CSS variable names
 */
export const statusColors = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
  alert: 'var(--color-coral)',
  
  // Task status
  completed: 'var(--color-success)',
  in_progress: 'var(--color-warning)',
  pending: 'var(--color-info)',
  cancelled: 'var(--color-error)',
  
  // Compliance levels
  full_compliance: 'var(--color-compliance-full)',
  partial_compliance: 'var(--color-compliance-partial)',
  non_compliance: 'var(--color-compliance-non)',
  not_applicable: 'var(--color-compliance-na)',
  
  // Task priorities
  high: 'var(--color-error)',
  medium: 'var(--color-warning)',
  low: 'var(--color-info)',
};

/**
 * Returns the CSS variable for a given status or priority
 * @param {string} status - The status or priority name
 * @param {string} fallback - Fallback color if status is not found
 * @returns {string} CSS variable for the status
 */
export const getStatusColor = (status, fallback = 'var(--color-gray-medium)') => {
  return statusColors[status] || fallback;
};

/**
 * Ensures that component colors match the theme palette
 * Use this in styled-components where you need to override existing styles
 */
export const themeColors = {
  // Primary colors
  navy: 'var(--color-navy)',
  navyDark: 'var(--color-navy-dark)',
  teal: 'var(--color-teal)',
  seafoam: 'var(--color-seafoam)',
  
  // Secondary colors
  sand: 'var(--color-sand)',
  coral: 'var(--color-coral)',
  skyblue: 'var(--color-skyblue)',
  
  // Neutrals
  offwhite: 'var(--color-offwhite)',
  grayLight: 'var(--color-gray-light)',
  grayMedium: 'var(--color-gray-medium)',
  grayDark: 'var(--color-gray-dark)',
  
  // Status colors
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
};

export default { getStatusColor, themeColors, statusColors }; 