/**
 * Extract error message from API response or error object
 * @param {Error|Object} error - The error object
 * @returns {string} Formatted error message
 */
export const extractErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle axios error responses
  if (error.response) {
    const { data, status } = error.response;
    
    // Handle different response formats
    if (data.message) {
      return data.message;
    } else if (data.error) {
      return data.error;
    } else if (typeof data === 'string') {
      return data;
    }
    
    return `Error ${status}: Request failed`;
  }
  
  // Handle network errors
  if (error.request) {
    return 'Network error. Please check your connection';
  }
  
  // Handle string error messages
  if (typeof error === 'string') {
    return error;
  }
  
  // Use error message if it exists
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}; 