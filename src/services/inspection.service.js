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
    const response = await api.patch(`/inspection/${id}`, data);
    return response.data;
  },

  async deleteInspectionLevel(id) {
    const response = await api.delete(`/inspection/${id}`);
    return response.data;
  },

  async updateSubLevel(inspectionId, subLevelId, data) {
    const response = await api.patch(`/inspection/${inspectionId}/sub-levels/${subLevelId}`, data);
    return response.data;
  },

  async reorderSubLevels(inspectionId, data) {
    const response = await api.post(`/inspection/${inspectionId}/sub-levels/reorder`, data);
    return response.data;
  }
};

export default inspectionService;