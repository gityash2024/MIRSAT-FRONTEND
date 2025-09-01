/**
 * Application constants
 */

// Import centralized API configuration
import { API_BASE_URL as CENTRALIZED_API_URL } from './api';

// API configuration - use centralized configuration
export const API_BASE_URL = CENTRALIZED_API_URL;

// Other application constants
export const APP_NAME = 'MIRSAT';
export const DEFAULT_PAGINATION_LIMIT = 10;
export const DATE_FORMAT = 'MMM DD, YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'MMM DD, YYYY HH:mm'; 