import api from './api';

export const assetService = {
  async getAssets(params) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  async getAsset(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async createAsset(data) {
    const response = await api.post('/assets', data);
    return response.data;
  },

  async updateAsset(id, data) {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  async exportAssets() {
    return api.get('/assets/export', { 
      responseType: 'blob' 
    });
  }
}; 