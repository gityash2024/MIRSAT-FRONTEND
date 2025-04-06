// services/asset.service.js
import api from './api';

export const assetService = {
  // Asset methods
  getAssets: async (params) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },
  
  getAsset: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  
  createAsset: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  
  updateAsset: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },
  
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
  
  exportAssets: async () => {
    const response = await api.get('/assets/export', { responseType: 'blob' });
    return response;
  },
  
  // Asset Type methods
  getAssetTypes: async () => {
    const response = await api.get('/asset-types');
    return response.data;
  },
  
  createAssetType: async (data) => {
    const response = await api.post('/asset-types', data);
    return response.data;
  },
  
  updateAssetType: async (id, data) => {
    const response = await api.put(`/asset-types/${id}`, data);
    return response.data;
  },
  
  deleteAssetType: async (id) => {
    const response = await api.delete(`/asset-types/${id}`);
    return response.data;
  },
};