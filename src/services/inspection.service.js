import api from './api';

export const inspectionService = {
  async createInspectionLevel(data) {
    const response = await api.post('/inspection', data);
    return response.data;
  },

  async getInspectionLevels(params) {
    const response = await api.get('/inspection', { params });
    return response.data;
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
    const response = await api.put(`/inspection/${inspectionId}/sublevels/${subLevelId}`, data);
    return response.data;
  },

  async reorderSubLevels(inspectionId, data) {
    const response = await api.post(`/inspection/${inspectionId}/sublevels/reorder`, data);
    return response.data;
  },
  async exportInspectionLevels(format, params) {
    const response = await api.get(`/inspection/export/${format}`, { 
      params,
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
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return response.data;
  }
};

export default inspectionService;