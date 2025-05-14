import axios from 'axios';

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
  // baseURL:'https://mirsat-backend.onrender.com/api/v1',
  baseURL:'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
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
const retryRequestWithBackoff = async (error) => {
  const { config } = error;
  
  // Only retry for 429 errors and if we haven't exceeded max retries
  if (error.response?.status !== 429 || backoffRetryCount >= MAX_RETRIES) {
    // Reset retry count for next 429 error
    if (error.response?.status !== 429) {
      backoffRetryCount = 0;
    }
    return Promise.reject(error);
  }
  
  // Increment retry count
  backoffRetryCount++;
  
  // Calculate delay with exponential backoff
  const delay = Math.pow(2, backoffRetryCount) * 1000;
  console.log(`Retrying request after ${delay}ms (retry ${backoffRetryCount} of ${MAX_RETRIES})`);
  
  // Wait for the calculated delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Retry the request
  return axios(config);
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded (429). Enforcing cooldown period.');
      
      // Enforce global cooldown with increasing duration based on retry count
      const cooldownDuration = DEFAULT_COOLDOWN * Math.pow(2, backoffRetryCount);
      enforceGlobalCooldown(cooldownDuration);
      
      // Attempt to retry with backoff
      return retryRequestWithBackoff(error);
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