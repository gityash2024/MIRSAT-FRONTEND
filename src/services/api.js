import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { toast } from 'react-hot-toast';

// Track pending requests to avoid duplicates
const pendingRequests = new Map();
// Track recent requests to enforce cooldown
const recentRequests = new Map();
// Default cooldown period in milliseconds
const DEFAULT_COOLDOWN = 300; // Reduced from 1000 to 300ms
let isInCooldown = false;
let backoffRetryCount = 0;
const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUTS.DEFAULT, // 30 seconds default timeout
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length for large uploads
  maxBodyLength: 50 * 1024 * 1024, // 50MB max body length for large uploads
});

// Create a function to generate a unique key for each request
const getRequestKey = (config) => {
  // Only consider GET requests for deduplication to avoid blocking mutations
  if (config.method.toLowerCase() === 'get') {
    return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
  }
  // For non-GET requests, create a unique key each time
  return `${config.method}:${config.url}:${Date.now()}`;
};

// Function to enforce global cooldown after 429 error
const enforceGlobalCooldown = (duration = DEFAULT_COOLDOWN) => {
  console.log(`API Rate limit hit - enforcing ${duration}ms global cooldown`);
  isInCooldown = true;
  setTimeout(() => {
    isInCooldown = false;
    console.log('Global cooldown ended');
  }, duration);
};

// Clean up old recent request entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentRequests.entries()) {
    if (now - timestamp > 10000) { // Remove entries older than 10 seconds
      recentRequests.delete(key);
    }
  }
}, 10000);

// Exponential backoff retry function
const retryRequestWithBackoff = async (error, retryCount = 0) => {
  const { config } = error;
  
  // Retry for 429, 502, 503, 504, 522 errors (rate limit and server errors)
  const retryableStatuses = [429, 502, 503, 504, 522];
  const shouldRetry = retryableStatuses.includes(error.response?.status) || 
                      (error.code === 'ECONNABORTED' && config.url?.includes('/attachments'));
  
  // Don't retry if max retries exceeded or not a retryable error
  if (!shouldRetry || retryCount >= MAX_RETRIES) {
    if (!shouldRetry) {
      backoffRetryCount = 0;
    }
    return Promise.reject(error);
  }
  
  // Increment retry count
  const currentRetry = retryCount + 1;
  backoffRetryCount = currentRetry;
  
  // Calculate delay with exponential backoff (1s, 2s, 4s)
  const delay = Math.pow(2, currentRetry) * 1000;
  console.log(`Retrying request after ${delay}ms (retry ${currentRetry} of ${MAX_RETRIES}) - Status: ${error.response?.status || 'TIMEOUT'}`);
  
  // Wait for the calculated delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Retry the request with same config
  return api(config);
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set timeout for file uploads (attachments)
    if (config.url?.includes('/attachments') || config.url?.includes('/upload')) {
      config.timeout = API_CONFIG.TIMEOUTS.UPLOAD; // 120 seconds for uploads
    }
    
    // For questionnaire and inspection operations, increase timeout
    if (config.url?.includes('/questionnaire') || 
        config.url?.includes('/inspection') ||
        config.url?.includes('/progress')) {
      config.timeout = API_CONFIG.TIMEOUTS.INSPECTION; // 120 seconds for inspection operations
    }
    
    // For large POST/PUT requests to templates, increase timeout
    if ((config.method === 'post' || config.method === 'put') && 
        config.url.includes('/templates')) {
      config.timeout = API_CONFIG.TIMEOUTS.LARGE_REQUEST; // 120s timeout for large operations
    }
    
    // Ensure assignedTo is always an array in task API calls
    if (config.url?.includes('/tasks') && config.method?.toLowerCase() !== 'get' && config.data) {
      try {
        // If data is a string (already stringified), parse it first
        let data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        
        // Ensure assignedTo is always an array if it exists
        if (data.assignedTo !== undefined) {
          // Convert to array if it's not already
          if (!Array.isArray(data.assignedTo)) {
            data.assignedTo = [data.assignedTo];
            console.log('Transformed assignedTo to array:', data.assignedTo);
          }
          
          // Update the config data
          config.data = typeof config.data === 'string' ? JSON.stringify(data) : data;
        }
      } catch (error) {
        console.error('Error transforming request data:', error);
      }
    }
    
    // Enforce global cooldown if active
    if (isInCooldown) {
      console.log('Request blocked due to global cooldown:', config.url);
      return Promise.reject({ 
        canceled: true, 
        message: 'Request blocked due to rate limiting cooldown'
      });
    }
    
    // Create a unique key for this request
    const requestKey = getRequestKey(config);
    
    // Check if this exact request is already in progress
    // if (pendingRequests.has(requestKey)) {
    //   console.log('Preventing duplicate request:', requestKey);
    //   return Promise.reject({ 
    //     canceled: true, 
    //     message: 'Duplicate request canceled' 
    //   });
    // }
    
    // // Check if this request was made recently (within cooldown period)
    // const lastRequestTime = recentRequests.get(requestKey);
    // if (lastRequestTime && Date.now() - lastRequestTime < DEFAULT_COOLDOWN) {
    //   console.log('Request rejected due to cooldown:', requestKey);
    //   return Promise.reject({ 
    //     canceled: true, 
    //     message: 'Request is on cooldown' 
    //   });
    // }
    
    // Add this request to tracking maps
    pendingRequests.set(requestKey, true);
    recentRequests.set(requestKey, Date.now());
    
    // Add the request key to config for later use
    config.requestKey = requestKey;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Remove from pending requests map
    if (response.config.requestKey) {
      pendingRequests.delete(response.config.requestKey);
    }
    return response;
  },
  (error) => {
    // Remove from pending requests map even on error
    if (error.config?.requestKey) {
      pendingRequests.delete(error.config.requestKey);
    }
    
    // Special handling for canceled requests
    if (error.canceled) {
      return Promise.reject(error);
    }
    console.log(error,'error-----');

    // Handle unauthorized access
    if (error.response?.status === 401 || error.response?.data?.error?.message?.includes('401')) {
      // Don't auto-redirect for login requests - let the login component handle the error
      if (error.config?.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle timeout errors - retry for attachment uploads
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      
      // Retry attachment uploads on timeout
      if (error.config?.url?.includes('/attachments') || error.config?.url?.includes('/upload')) {
        return retryRequestWithBackoff(error, 0);
      }
      
      toast('Request timed out. Please try again.', { 
        icon: '⏱️',
        duration: 4000 
      });
      return Promise.reject(error);
    }
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded (429). Enforcing cooldown period.');
      
      // Enforce global cooldown with increasing duration based on retry count
      const cooldownDuration = DEFAULT_COOLDOWN * Math.pow(2, backoffRetryCount);
      enforceGlobalCooldown(cooldownDuration);
      
      // Attempt to retry with backoff
      return retryRequestWithBackoff(error, 0);
    }
    
    // Handle server errors (5xx) - retry for 502, 503, 504, 522
    if (error.response?.status >= 500 && error.response?.status < 600) {
      const status = error.response.status;
      console.error(`Server error (${status}):`, error);
      
      // Retry for gateway/timeout errors (502, 503, 504, 522)
      if ([502, 503, 504, 522].includes(status)) {
        // Only show toast on first attempt, retry will handle subsequent attempts
        if (!error.config._retryCount || error.config._retryCount === 0) {
          toast('Server is busy. Retrying...', { 
            icon: '🔄',
            duration: 3000 
          });
        }
        error.config._retryCount = (error.config._retryCount || 0) + 1;
        return retryRequestWithBackoff(error, error.config._retryCount - 1);
      }
      
      // For other 5xx errors, show message but don't retry
      // toast('Please try again. Server seems to be busy.', { 
      //   icon: 'ℹ️',
      //   duration: 4000 
      // });
      
      return Promise.reject(error);
    }
    
    // Handle network errors (no response) - could be server issues
    if (!error.response && error.request) {
      console.error('Network error - server may be unavailable:', error);
      
      // Retry attachment uploads on network errors
      if (error.config?.url?.includes('/attachments') || error.config?.url?.includes('/upload')) {
        return retryRequestWithBackoff(error, 0);
      }
      
      // toast('Please try again. Server seems to be busy.', { 
      //   icon: 'ℹ️',
      //   duration: 4000 
      // });
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Clean up old entries from recentRequests map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentRequests.entries()) {
    if (now - timestamp > DEFAULT_COOLDOWN * 2) {
      recentRequests.delete(key);
    }
  }
}, DEFAULT_COOLDOWN * 5);

export default api;