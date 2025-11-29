// src/services/task.service.js
import api from '../services/api';
import { downloadTaskPDF } from './pdfGenerator';
export const taskService = {
  async getTasks(params) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async exportTaskReport(taskId, format = 'excel', fileName = null, taskData = null) {
    try {
      // For PDF, use frontend generation
      if (format === 'pdf') {
        let dataToUse = taskData;

        // If no task data provided, get it from API
        if (!dataToUse) {
          const taskDetails = await api.get(`/tasks/${taskId}`);
          dataToUse = taskDetails.data;
        }

        // Generate and download PDF using frontend
        const pdfFileName = fileName || `inspection_report_${taskId}`;
        await downloadTaskPDF(dataToUse, pdfFileName);

        return { success: true };
      }

      // For other formats, use backend
      let url = `/tasks/${taskId}/export?format=${format}`;
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
  }
};
