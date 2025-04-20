import api from './api';

// Store the loading context outside the service object
let loadingContext = null;

// Cache for template results to prevent redundant calls
const inspectionLevelsCache = new Map();
const CACHE_EXPIRY = 5000; // 5 seconds

// Improve the cache management to prevent duplicate calls
let pendingRequests = {};

// Utility function to convert backend data to frontend format
const convertToFrontendFormat = (data) => {
  // If data already has sets, don't overwrite them
  if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
    // Ensure sets have proper ID format
    return {
      ...data,
      sets: data.sets.map(set => ({
        ...set,
        id: set.id || set._id || Date.now(),
        subLevels: set.subLevels || [],
        questions: set.questions || [],
        generalQuestions: set.generalQuestions || []
      }))
    };
  }

  // Create a new sets structure from top-level data
  return {
    ...data,
    sets: [{
      id: data.id || data._id || Date.now(),
      name: data.name ? `${data.name} Set` : 'Main Set',
      description: data.description || 'Main inspection set',
      subLevels: data.subLevels || [],
      questions: data.questions || [],
      generalQuestions: []
    }]
  };
};

// Utility function to convert frontend data to backend format
const convertToBackendFormat = (data) => {
  // Create a proper copy to avoid modifying the original data
  const backendData = { ...data };
  
  // Check if data has sets
  if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
    // Keep the sets data (backend model supports sets now)
    backendData.sets = data.sets.map(set => ({
      ...set,
      // Ensure MongoDB can process the IDs properly
      _id: set._id || set.id,
      id: undefined
    }));
    
    // Also include the main subLevels and questions for backward compatibility
    // Use the first set as the main data
    const mainSet = data.sets[0];
    backendData.subLevels = mainSet.subLevels || [];
    backendData.questions = [...(mainSet.questions || []), ...(mainSet.generalQuestions || [])];
  } else {
    // No sets, just ensure subLevels and questions are defined
    backendData.subLevels = backendData.subLevels || [];
    backendData.questions = backendData.questions || [];
  }
  
  return backendData;
};

export const inspectionService = {
  setLoadingContext(context) {
    loadingContext = context;
  },

  startLoading(message = 'Loading...') {
    if (loadingContext && loadingContext.setLoading) {
      loadingContext.setLoading(true, message);
    }
  },

  stopLoading() {
    if (loadingContext && loadingContext.setLoading) {
      loadingContext.setLoading(false);
    }
  },
  
  async createInspectionLevel(data) {
    try {
      this.startLoading('Creating inspection template...');
      
      // Convert data to backend format
      const backendData = convertToBackendFormat(data);
      console.log('Creating inspection with data:', backendData);
      
      const response = await api.post('/inspection', backendData);
      
      // Clear cache after creation
      Array.from(inspectionLevelsCache.keys()).forEach(key => 
        inspectionLevelsCache.delete(key)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating inspection level:', error);
      throw error;
    } finally {
      this.stopLoading();
    }
  },

  async getInspectionLevels(params) {
    try {
      // Create cache key based on params
      const cacheKey = JSON.stringify(params || {});
      
      // Check if we have a recent cached result
      const cachedData = inspectionLevelsCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
        console.log('Using cached inspection levels data');
        return cachedData.data;
      }
      
      // Check if this exact request is already in progress
      if (pendingRequests[cacheKey]) {
        console.log('Using pending request for inspection levels');
        return pendingRequests[cacheKey];
      }
      
      // Create a promise for this request that can be reused by concurrent calls
      pendingRequests[cacheKey] = new Promise(async (resolve, reject) => {
        try {
          this.startLoading('Loading inspection templates...');
          
          // Make the API call
          console.log('Making API call for inspection levels with params:', params);
          const response = await api.get('/inspection', { params });
          const data = response.data || { results: [] };
          
          // Store in cache with timestamp
          inspectionLevelsCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
          
          resolve(data);
        } catch (error) {
          console.error('Error fetching inspection levels:', error);
          // Return empty results instead of throwing an error
          resolve({ results: [] });
        } finally {
          // Remove from pending requests
          delete pendingRequests[cacheKey];
          this.stopLoading();
        }
      });
      
      // Return the promise
      return pendingRequests[cacheKey];
    } catch (error) {
      console.error('Error in getInspectionLevels:', error);
      // Return empty results instead of throwing
      return { results: [] };
    }
  },

  async getInspectionLevel(id) {
    try {
      this.startLoading('Loading inspection template...');
      
      const response = await api.get(`/inspection/${id}`);
      console.log('Fetched inspection level:', response.data);
      
      // No need to convert here - we'll do it in the component
      return response.data;
    } catch (error) {
      console.error('Error fetching inspection level:', error);
      throw error;
    } finally {
      this.stopLoading();
    }
  },

  async updateInspectionLevel(id, data) {
    try {
      this.startLoading('Updating inspection template...');
      
      // Convert frontend data to backend format
      const backendData = convertToBackendFormat(data);
      console.log('Updating inspection with data:', backendData);
      
      const response = await api.put(`/inspection/${id}`, backendData);
      
      // Clear cache after update
      Array.from(inspectionLevelsCache.keys()).forEach(key => 
        inspectionLevelsCache.delete(key)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating inspection level:', error);
      throw error;
    } finally {
      this.stopLoading();
    }
  },

  async deleteInspectionLevel(id) {
    try {
      this.startLoading('Deleting inspection template...');
      
      const response = await api.delete(`/inspection/${id}`);
      
      // Clear cache after deletion
      Array.from(inspectionLevelsCache.keys()).forEach(key => 
        inspectionLevelsCache.delete(key)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error deleting inspection level:', error);
      throw error;
    } finally {
      this.stopLoading();
    }
  },

  async updateSubLevel(inspectionId, subLevelId, data) {
    try {
      // Add loading state
      this.startLoading('Updating sub-level...');
      
      // Validate IDs
      if (!inspectionId) {
        console.error('Missing inspectionId in updateSubLevel call');
        throw new Error('Inspection ID is required');
      }
      
      if (!subLevelId) {
        console.error('Missing subLevelId in updateSubLevel call');
        throw new Error('Sub Level ID is required');
      }
      
      // The backend API expects:
      // 1. inspectionId: The ID of the top-level inspection (in route param :id)
      // 2. subLevelId: The ID of the sublevel to update (in route param :sublevelId)
      // 3. The updated data for the sublevel (in request body)
      
      // Prepare the data - make a clean copy to avoid sending unnecessary fields
      const subLevelData = {
        name: data.name,
        description: data.description, 
        order: data.order || 0,
        isCompleted: data.isCompleted || false,
        questions: data.questions || []
      };
      
      // Ensure _id is included
      if (data._id) {
        subLevelData._id = data._id;
      } else if (data.id) {
        subLevelData._id = data.id;
      }
      
      // Ensure path is formatted correctly: /inspection/:id/sublevels/:sublevelId
      const url = `/inspection/${inspectionId}/sublevels/${subLevelId}`;
      
      // Log the exact request we're making
      console.log('Update sub-level request details:', {
        method: 'PUT',
        url: url,
        inspectionId: inspectionId, 
        subLevelId: subLevelId,
        requestBody: subLevelData
      });
      
      // Make the API call with correct URL and data
      const response = await api.put(url, subLevelData);
      
      // Clear the cache
      const cacheKeys = Array.from(inspectionLevelsCache.keys());
      cacheKeys.forEach(key => inspectionLevelsCache.delete(key));
      
      return response.data;
    } catch (error) {
      console.error('Error updating sub-level:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      const enhancedError = new Error(`Update failed: ${errorMessage}. IDs: [${inspectionId}, ${subLevelId}]`);
      enhancedError.originalError = error;
      throw enhancedError;
    } finally {
      this.stopLoading();
    }
  },

  async reorderSubLevels(inspectionId, data) {
    const response = await api.post(`/inspection/${inspectionId}/sublevels/reorder`, data);
    return response.data;
  },
  
  async exportInspectionLevels(params) {
    try {
      this.startLoading('Exporting inspection levels...');
      
      const { format = 'pdf', ...otherParams } = params;
      const response = await api.get(`/inspection/export/${format}`, { 
        params: otherParams,
        responseType: 'blob' 
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-levels.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting inspection levels:', error);
      throw error;
    } finally {
      this.stopLoading();
    }
  },

  async deleteSubLevel(inspectionId, subLevelId) {
    try {
      // Add loading state
      this.startLoading('Deleting sub-level...');
      
      // Validate IDs
      if (!inspectionId) {
        console.error('Missing inspectionId in deleteSubLevel call');
        throw new Error('Inspection ID is required');
      }
      
      if (!subLevelId) {
        console.error('Missing subLevelId in deleteSubLevel call');
        throw new Error('Sub Level ID is required');
      }
      
      // Ensure path is formatted correctly: /inspection/:id/sublevels/:sublevelId
      const url = `/inspection/${inspectionId}/sublevels/${subLevelId}`;
      
      // Log the exact request we're making
      console.log('Delete sub-level request details:', {
        method: 'DELETE',
        url: url,
        inspectionId,
        subLevelId
      });
      
      // Make the API call
      const response = await api.delete(url);
      
      // Clear the cache
      const cacheKeys = Array.from(inspectionLevelsCache.keys());
      cacheKeys.forEach(key => inspectionLevelsCache.delete(key));
      
      return response.data;
    } catch (error) {
      console.error('Error deleting sub-level:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      const enhancedError = new Error(`Delete failed: ${errorMessage}. IDs: [${inspectionId}, ${subLevelId}]`);
      enhancedError.originalError = error;
      throw enhancedError;
    } finally {
      this.stopLoading();
    }
  }
};

export default inspectionService;