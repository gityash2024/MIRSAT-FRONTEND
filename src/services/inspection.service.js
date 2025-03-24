import api from './api';

// Store the loading context outside the service object
let loadingContext = null;

// Cache for inspection level results to prevent redundant calls
const inspectionLevelsCache = new Map();
const CACHE_EXPIRY = 5000; // 5 seconds

// Improve the cache management to prevent duplicate calls
let pendingRequests = {};

export const inspectionService = {
  setLoadingContext(context) {
    loadingContext = context;
  },

  startLoading(message = '') {
    if (loadingContext) {
      loadingContext.startLoading(message);
    }
  },

  stopLoading() {
    if (loadingContext) {
      loadingContext.stopLoading();
    }
  },
  
  async createInspectionLevel(data) {
    const response = await api.post('/inspection', data);
    return response.data;
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
    const response = await api.get(`/inspection/${id}`);
    return response.data;
  },

  async updateInspectionLevel(id, data) {
    const response = await api.put(`/inspection/${id}`, data);
    return response.data;
  },

  async deleteInspectionLevel(id) {
    const response = await api.delete(`/inspection/${id}`);
    return response.data;
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
        isCompleted: data.isCompleted || false
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