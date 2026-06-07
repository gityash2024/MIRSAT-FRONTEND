import api from './api';

const data = (response) => response.data?.data || response.data;
const noRetry = { _skipRetry: true };

export const agentService = {
  capabilities: () => api.get('/agent/capabilities', noRetry).then(data),
  chat: (message, conversationId, currentRoute, currentPageKey, context = {}) => api.post('/agent/chat', {
    message,
    conversationId,
    currentRoute,
    currentPageKey,
    ...context,
  }, noRetry).then(data),
  approve: (pendingActionId, approve) => api.post('/agent/action/approve', { pendingActionId, approve }, noRetry).then(data),
  pages: () => api.get('/agent/pages', noRetry).then(data),
  formSchema: (formKey, params) => api.get(`/agent/forms/${formKey}/schema`, { ...noRetry, params }).then(data),
  saveFormDraft: (formKey, values, merge = false) => api.post(`/agent/forms/${formKey}/draft`, { values, merge }, noRetry).then(data),
  validateFormDraft: (formKey) => api.post(`/agent/forms/${formKey}/validate`, {}, noRetry).then(data),
  submitFormDraft: (formKey, responseUserId) => api.post(`/agent/forms/${formKey}/submit`, { responseUserId }, noRetry).then(data),
};

export default agentService;
