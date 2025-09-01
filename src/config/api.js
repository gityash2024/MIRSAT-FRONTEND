/**
 * Centralized API Configuration
 * This file manages all API endpoints and base URLs for the application
 */

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // For production (Vercel), use the production API URL
  // if (import.meta.env.PROD) {
  //   return import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
  // }
  
  // For development, use localhost
  return 'https://mirsat.mymultimeds.com/api/v1';
  // return import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    TASKS: '/tasks',
    ASSETS: '/assets',
    ROLES: '/roles',
    NOTIFICATIONS: '/notifications',
    INSPECTION: '/inspection',
    QUESTIONNAIRES: '/questionnaires',
    UPLOADS: '/uploads',
    DASHBOARD: '/dashboard',
    REPORTS: '/reports'
  },
  TIMEOUTS: {
    DEFAULT: 30000,
    UPLOAD: 60000,
    LARGE_REQUEST: 60000
  }
};

// Socket Configuration
export const SOCKET_CONFIG = {
  URL: getApiBaseUrl().replace('/api/v1', ''), // Remove the API path for socket connection
  OPTIONS: {
    withCredentials: true,
    transports: ['websocket', 'polling']
  }
};

// Export the base URL for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;
