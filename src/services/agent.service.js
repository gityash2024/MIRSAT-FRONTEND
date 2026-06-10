import api from './api';
import { API_CONFIG } from '../config/api';

const data = (response) => response.data?.data || response.data;
const noRetry = { _skipRetry: true };

// Server-Sent-Events streaming chat. Uses fetch (EventSource is GET-only) and yields tokens via
// callbacks; resolves with the final payload. Throws on transport error so callers can fall back.
const chatStream = async (message, conversationId, currentRoute, currentPageKey, context = {}, handlers = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_CONFIG.BASE_URL}/agent/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ message, conversationId, currentRoute, currentPageKey, ...context }),
    signal: handlers.signal,
  });
  if (!response.ok || !response.body) {
    const error = new Error('Assistant stream unavailable');
    error.status = response.status;
    throw error;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() || '';
    for (const frame of frames) {
      const line = frame.split('\n').find((part) => part.startsWith('data:'));
      if (!line) continue;
      let event;
      try { event = JSON.parse(line.slice(5).trim()); } catch (_e) { continue; }
      if (event.type === 'token') handlers.onToken?.(event.delta || '');
      else if (event.type === 'tool') handlers.onTool?.(event.name);
      else if (event.type === 'done') finalPayload = event.payload;
      else if (event.type === 'error') throw new Error(event.message || 'Assistant stream error');
    }
  }
  if (!finalPayload) throw new Error('Assistant stream ended unexpectedly');
  return finalPayload;
};

export const agentService = {
  capabilities: () => api.get('/agent/capabilities', noRetry).then(data),
  chat: (message, conversationId, currentRoute, currentPageKey, context = {}) => api.post('/agent/chat', {
    message,
    conversationId,
    currentRoute,
    currentPageKey,
    ...context,
  }, noRetry).then(data),
  chatStream,
  approve: (pendingActionId, approve) => api.post('/agent/action/approve', { pendingActionId, approve }, noRetry).then(data),
  pages: () => api.get('/agent/pages', noRetry).then(data),
  formSchema: (formKey, params) => api.get(`/agent/forms/${formKey}/schema`, { ...noRetry, params }).then(data),
  saveFormDraft: (formKey, values, merge = false) => api.post(`/agent/forms/${formKey}/draft`, { values, merge }, noRetry).then(data),
  validateFormDraft: (formKey) => api.post(`/agent/forms/${formKey}/validate`, {}, noRetry).then(data),
  submitFormDraft: (formKey, responseUserId) => api.post(`/agent/forms/${formKey}/submit`, { responseUserId }, noRetry).then(data),
  getApiKey: () => api.get('/agent/key', noRetry).then(data),
  setApiKey: (apiKey) => api.put('/agent/key', { apiKey }, noRetry).then(data),
  clearApiKey: () => api.delete('/agent/key', noRetry).then(data),
  // Multi-provider keys (gemini | openai | anthropic)
  getKeyStatuses: () => api.get('/agent/keys', noRetry).then(data),
  setProviderKey: (provider, apiKey) => api.put(`/agent/keys/${provider}`, { apiKey }, noRetry).then(data),
  clearProviderKey: (provider) => api.delete(`/agent/keys/${provider}`, noRetry).then(data),
  setPreferredProvider: (provider) => api.put('/agent/preferred-provider', { provider }, noRetry).then(data),
  getUsage: (scope) => api.get('/agent/usage', { ...noRetry, params: scope ? { scope } : {} }).then(data),
  uploadAttachment: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/agent/upload', form, { ...noRetry, headers: { 'Content-Type': 'multipart/form-data' } }).then(data);
  },
  // Conversation history
  listConversations: () => api.get('/agent/conversations', noRetry).then(data),
  getConversation: (id) => api.get(`/agent/conversations/${id}`, noRetry).then(data),
  renameConversation: (id, title) => api.patch(`/agent/conversations/${id}`, { title }, noRetry).then(data),
  pinConversation: (id, pinned) => api.patch(`/agent/conversations/${id}`, { pinned }, noRetry).then(data),
  deleteConversation: (id) => api.delete(`/agent/conversations/${id}`, noRetry).then(data),
  sendMessageFeedback: (id, messageIndex, payload) => api.post(`/agent/conversations/${id}/feedback`, { messageIndex, ...payload }, noRetry).then(data),
  exportConversation: (id) => api.get(`/agent/conversations/${id}/export`, noRetry).then(data),
  // v4: undo, governance policies, autocomplete lookup, audit export
  undoAction: (pendingActionId) => api.post('/agent/action/undo', { pendingActionId }, noRetry).then(data),
  getToolPolicies: () => api.get('/agent/policies', noRetry).then(data),
  setToolPolicy: (role, toolName, allowed) => api.put('/agent/policies', { role, toolName, allowed }, noRetry).then(data),
  lookup: (type, q) => api.get('/agent/lookup', { ...noRetry, params: { type, q } }).then(data),
  exportAuditCsv: () => api.get('/agent/audit-logs/export', { ...noRetry, responseType: 'blob' }).then((response) => response.data),
};

export default agentService;
