import { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_CONFIG } from '../config/api';
import { validateFileWithToast, handleFileSizeError } from '../utils/fileValidation';
import { toast } from 'react-hot-toast';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { token } = useSelector((state) => state.auth);

  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Validate file format and size (1MB limit)
      if (!validateFileWithToast(file, toast)) {
        return {
          success: false,
          error: 'File validation failed. Please check file format and size (max 1 MB).'
        };
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOADS}/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
        timeout: API_CONFIG.TIMEOUTS.UPLOAD
      });
      
      return {
        success: true,
        file: response.data.data
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Handle 413 Content Too Large error
      if (handleFileSizeError(error, toast)) {
        return {
          success: false,
          error: 'File size exceeds 1 MB limit'
        };
      }
      
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