import api from './api';

export const questionLibraryService = {
  async getQuestionLibrary(params) {
    const response = await api.get('/question-library', { params });
    return response.data;
  },

  async addQuestionToLibrary(data) {
    const response = await api.post('/question-library', data);
    return response.data;
  },

  async deleteQuestionFromLibrary(id) {
    const response = await api.delete(`/question-library/${id}`);
    return response.data;
  }
};

export default questionLibraryService; 