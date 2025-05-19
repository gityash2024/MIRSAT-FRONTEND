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
      
      // Create a full payload including all metrics
      const payload = {
        status: data.status,
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.photos !== undefined && { photos: data.photos }),
        ...(data.timeSpent !== undefined && { timeSpent: data.timeSpent }),
        // Add scoring and metrics data
        ...(data.sectionScore && { sectionScore: data.sectionScore }),
        ...(data.taskMetrics && { taskMetrics: data.taskMetrics })
      };
      
      const response = await api.post(`/user-tasks/${taskId}/progress/${subLevelId}`, payload);
      
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
    // Ensure content is a string, not an object
    const contentToSend = typeof content === 'object' ? JSON.stringify(content) : content;
    console.log('Service - Sending comment content:', contentToSend, 'Type:', typeof contentToSend);
    
    const response = await api.post(`/tasks/${taskId}/comments`, { content: contentToSend });
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
  
  exportTaskReport: async (taskId) => {
    try {
      const response = await api.get(`/user-tasks/${taskId}/export`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `task_report_${taskId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  
};