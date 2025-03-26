import api from './api';
import { toast } from 'react-hot-toast';

export const userTaskService = {
  // Get user dashboard statistics
  getUserDashboardStats: async () => {
    const response = await api.get('/user-tasks/dashboard-stats');
    return response.data;
  },

  // Get all tasks assigned to the user
  getUserTasks: async (params = {}) => {
    const response = await api.get('/user-tasks', { params });
    return response.data;
  },

  // Get detailed task information
  getTaskDetails: async (taskId) => {
    const response = await api.get(`/user-tasks/${taskId}`);
    return response.data;
  },

  // Start a task
  startTask: async (taskId) => {
    const response = await api.post(`/user-tasks/${taskId}/start`);
    return response.data;
  },

  // Update progress of a specific sub-level in a task
  updateTaskProgress: async (taskId, subLevelId, data) => {
    try {
      console.log('Updating task progress:', { taskId, subLevelId, data });
      const response = await api.post(`/user-tasks/${taskId}/progress/${subLevelId}`, data);
      
      if (response.status >= 200 && response.status < 300) {
        toast.success('Progress updated successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating task progress:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update progress';
      toast.error(errorMessage);
      throw error;
    }
  },
  
  // Update task questionnaire responses
  updateTaskQuestionnaire: async (taskId, data) => {
    const response = await api.post(`/user-tasks/${taskId}/questionnaire`, data);
    return response.data;
  },

  // Add a comment to a task
  addTaskComment: async (taskId, content) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  // Upload attachment for a task
  uploadTaskAttachment: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Export task report
  exportTaskReport: async (taskId, format = 'pdf') => {
    const response = await api.get(`/user-tasks/${taskId}/export?format=${format}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `task-report-${taskId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }
};