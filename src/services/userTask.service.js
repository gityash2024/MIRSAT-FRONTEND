import api from './api';
import { toast } from 'react-hot-toast';
import { downloadTaskPDF } from './pdfGenerator';
import FrontendLogger from './frontendLogger.service';
import { validateFileWithToast, handleFileSizeError } from '../utils/fileValidation';

const QUESTIONNAIRE_QUEUE_DELAY_MS = 350;
const questionnaireQueueByTask = new Map();

const mergeQuestionnairePayload = (base = {}, patch = {}) => {
  const baseResponses = (base.responses && typeof base.responses === 'object' && !Array.isArray(base.responses)) ? base.responses : {};
  const patchResponses = (patch.responses && typeof patch.responses === 'object' && !Array.isArray(patch.responses)) ? patch.responses : {};

  return {
    responses: { ...baseResponses, ...patchResponses },
    notes: patch.notes !== undefined ? patch.notes : base.notes,
    completed: patch.completed !== undefined ? patch.completed : base.completed
  };
};

const getQuestionnaireQueueState = (taskId) => {
  if (!questionnaireQueueByTask.has(taskId)) {
    questionnaireQueueByTask.set(taskId, {
      pendingPayload: null,
      timer: null,
      chain: Promise.resolve(),
      waiters: []
    });
  }

  return questionnaireQueueByTask.get(taskId);
};

const flushQuestionnaireQueue = (taskId) => {
  const state = questionnaireQueueByTask.get(taskId);
  if (!state || !state.pendingPayload) return;

  const payloadToSend = state.pendingPayload;
  const waiters = state.waiters;

  state.pendingPayload = null;
  state.waiters = [];
  state.timer = null;

  state.chain = state.chain
    .catch(() => undefined)
    .then(async () => {
      const queuedAt = new Date().toISOString();
      const response = await api.post(`/user-tasks/${taskId}/questionnaire`, {
        ...payloadToSend,
        clientQueuedAt: queuedAt
      });
      return response.data;
    })
    .then((result) => {
      waiters.forEach(({ resolve }) => resolve(result));
      return result;
    })
    .catch((error) => {
      waiters.forEach(({ reject }) => reject(error));
      throw error;
    })
    .finally(() => {
      const latestState = questionnaireQueueByTask.get(taskId);
      if (!latestState) return;

      if (latestState.pendingPayload) {
        latestState.timer = setTimeout(() => flushQuestionnaireQueue(taskId), QUESTIONNAIRE_QUEUE_DELAY_MS);
        return;
      }

      questionnaireQueueByTask.delete(taskId);
    });
};

const enqueueQuestionnaireUpdate = (taskId, payload) => {
  const state = getQuestionnaireQueueState(taskId);

  state.pendingPayload = mergeQuestionnairePayload(state.pendingPayload || {}, payload || {});

  return new Promise((resolve, reject) => {
    state.waiters.push({ resolve, reject });

    if (state.timer) {
      clearTimeout(state.timer);
    }

    state.timer = setTimeout(() => flushQuestionnaireQueue(taskId), QUESTIONNAIRE_QUEUE_DELAY_MS);
  });
};

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
        // Log progress update
        await FrontendLogger.logTaskProgressUpdate(
          taskId, 
          data.taskTitle || 'Unknown Task', 
          data.subLevelName || 'Unknown Section',
          data.oldStatus || 'unknown',
          data.status
        );
        // toast.success('Progress updated successfully');
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
    return enqueueQuestionnaireUpdate(taskId, data);
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
    // Validate file format and size (1MB limit)
    if (!validateFileWithToast(file, toast)) {
      throw new Error('File validation failed. Please check file format and size (max 1 MB).');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      // Handle 413 Content Too Large error
      if (handleFileSizeError(error, toast)) {
        throw new Error('File size exceeds 1 MB limit');
      }
      throw error;
    }
  },
  
  exportTaskReport: async (taskId, format = 'excel', fileName = null, taskData = null) => {
    try {
      // For PDF, use frontend generation
      if (format === 'pdf') {
        let dataToUse = taskData;
        
        // If no task data provided, get it from API
        if (!dataToUse) {
          const taskDetails = await api.get(`/user-tasks/${taskId}`);
          dataToUse = taskDetails.data;
        }
        
        // Generate and download PDF using frontend
        const pdfFileName = fileName || `inspection_report_${taskId}`;
        downloadTaskPDF(dataToUse, pdfFileName);
        
        return { success: true };
      }
      
      // For other formats, use backend
      let url = `/user-tasks/${taskId}/export?format=${format}`;
      if (fileName) {
        url += `&fileName=${encodeURIComponent(fileName)}`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      let mimeType, fileExtension;
      if (format === 'word') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = 'docx';
      } else {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      }
      
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // Use the filename from the response headers if available, otherwise use the provided filename
      const contentDisposition = response.headers['content-disposition'];
      let downloadFileName = `inspection_report_${taskId}.${fileExtension}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch) {
          downloadFileName = fileNameMatch[1];
        }
      } else if (fileName) {
        downloadFileName = `${fileName}.${fileExtension}`;
      }
      
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  
  // Save task signature
  saveTaskSignature: async (taskId, data) => {
    try {
      // Create payload with signature and optional taskMetrics
      const payload = {
        signature: data.signature,
        ...(data.taskMetrics && { taskMetrics: data.taskMetrics })
      };
      
      const response = await api.post(`/user-tasks/${taskId}/signature`, payload);
      return response.data;
    } catch (error) {
      console.error('Error saving task signature:', error);
      throw error;
    }
  },

  // Complete and archive a task
  archiveTask: async (taskId) => {
    try {
      const response = await api.post(`/user-tasks/${taskId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to archive task';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get section comments
  getSectionComments: async (taskId, sectionId) => {
    try {
      const response = await api.get(`/user-tasks/${taskId}/sections/${sectionId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section comments:', error);
      throw error;
    }
  },

  // Add section comment
  addSectionComment: async (taskId, sectionId, comment) => {
    try {
      const response = await api.post(`/user-tasks/${taskId}/sections/${sectionId}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error adding section comment:', error);
      throw error;
    }
  },

  // Get task progress data for multiple tasks (for admin panel) - using bulk endpoint
  getTasksProgressData: async (taskIds) => {
    try {
      const validTaskIds = taskIds.filter(id => id && id !== 'undefined' && (typeof id === 'string' || typeof id === 'object') && id.toString().length > 0);
      
      if (validTaskIds.length === 0) {
        return [];
      }
      
      const response = await api.post('/user-tasks/bulk-progress', {
        taskIds: validTaskIds.map(id => id.toString())
      });
      
      // Backend returns { status: 'success', data: [...] }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching tasks progress data:', error);
      throw error;
    }
  }
  
};
