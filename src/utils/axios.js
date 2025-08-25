import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mirsat.mymultimeds.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Default 30s timeout
  maxContentLength: 10 * 1024 * 1024, // 10MB max content length
  maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For large POST/PUT requests, increase timeout
    if ((config.method === 'post' || config.method === 'put') && 
        (config.url.includes('/templates') || config.url.includes('/inspection'))) {
      config.timeout = 60000; // 60s timeout for inspection template operations
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors
    if (error.response?.status === 401) {
      // Don't logout for profile update errors (incorrect current password is expected)
      const isProfileUpdate = error.config?.url?.includes('/users/profile');
      const isPasswordError = error.response?.data?.message?.toLowerCase().includes('password');
      
      if (isProfileUpdate && isPasswordError) {
        // Let the component handle the password error, don't logout
        return Promise.reject(error);
      }
      
      // For other 401 errors, logout the user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Provide more descriptive error for timeouts and large payloads
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the operation took too long to complete');
      error.message = 'The request took too long to complete. Please try again or reduce the amount of data.';
    }
    
    if (error.response?.status === 413) {
      console.error('Payload too large');
      error.message = 'The data you\'re trying to send is too large. Please reduce the amount of data.';
    }
    
    return Promise.reject(error);
  }
);

export default api;