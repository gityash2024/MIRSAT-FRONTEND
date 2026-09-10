import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

export const classifyLoginError = (error) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message || error?.response?.data?.error?.message;

  if (error?.code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''))) {
    return { code: 'timeout' };
  }

  if ([502, 503, 504, 522].includes(status)) {
    return { code: 'service_unavailable' };
  }

  if (!error?.response && error?.request) {
    return { code: 'network_unavailable' };
  }

  return {
    code: 'server',
    message: typeof serverMessage === 'string' && serverMessage.trim()
      ? serverMessage
      : 'Login failed. Please try again.'
  };
};

const getInitialState = () => {
  const token = localStorage.getItem('token');
  let user = null;
  
  try {
    const userData = localStorage.getItem('user');
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.warn('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user'); // Clear invalid data
    user = null;
  }
  
  return {
    isAuthenticated: !!token,
    user,
    loading: false,
    error: null
  };
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, captchaToken }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password, captchaToken);
    } catch (error) {
      return rejectWithValue(classifyLoginError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      authService.logout();
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    restoreUser: (state) => {
      const user = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      if (user && token) {
        state.isAuthenticated = true;
        state.user = user;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export const { logout, restoreUser, clearError } = authSlice.actions;
export default authSlice.reducer;
