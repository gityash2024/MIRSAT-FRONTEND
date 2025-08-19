import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { token } = useSelector((state) => state.auth);
  // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/uploads/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      return {
        success: true,
        file: response.data.data
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload file'
      };
    } finally {
      setIsUploading(false);
    }
  };
  
  return { 
    uploadFile, 
    isUploading, 
    progress 
  };
}; 