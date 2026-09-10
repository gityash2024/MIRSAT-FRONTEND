// src/services/auth.service.js
import api from './api';

export const authService = {
  async login(email, password, captchaToken) {
    const response = await api.post('/auth/login', {
      email,
      password,
      // Omitted entirely when Turnstile is off, so the request body is
      // byte-identical to what it was before.
      ...(captchaToken ? { captchaToken } : {}),
    });
    
    if (response.data.success) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async forgotPassword(email, captchaToken) {
    const response = await api.post('/auth/forgot-password', {
      email,
      ...(captchaToken ? { captchaToken } : {}),
    });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Adopt a token the server rotated mid-session.
   *
   * Changing your password now invalidates every token issued before that
   * moment, so the server hands back a fresh one. Storing it keeps the user
   * signed in on the device they just used; without this their next request
   * 401s and the interceptor bounces them to /login.
   */
  applyRotatedToken(token) {
    if (!token) return false;
    try {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch {
      return false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user'); // Clear invalid data
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService;