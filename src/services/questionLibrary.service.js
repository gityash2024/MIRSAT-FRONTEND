import api from './api';

export const questionLibraryService = {
  async getQuestionLibrary(params) {
    try {
      const response = await api.get('/question-library', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getQuestionLibrary service:', error);
      throw error;
    }
  },

  async addQuestionToLibrary(data) {
    try {
      // Check if we're updating an existing question
      if (data.id || data._id) {
        const id = data.id || data._id;
        const response = await api.put(`/question-library/${id}`, data);
        return response.data;
      } else {
        // Creating a new question
        const response = await api.post('/question-library', data);
        return response.data;
      }
    } catch (error) {
      console.error('Error in addQuestionToLibrary service:', error);
      throw error;
    }
  },

  async deleteQuestionFromLibrary(id) {
    try {
      const response = await api.delete(`/question-library/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteQuestionFromLibrary service:', error);
      throw error;
    }
  }
};

export default questionLibraryService; 