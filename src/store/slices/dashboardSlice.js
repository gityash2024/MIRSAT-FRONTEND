import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // Use timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/dashboard/stats?_=${timestamp}`);
      
      return response.data;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const initialState = {
  stats: [],
  taskProgress: [],
  teamPerformance: [],
  loading: true,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        
        // Ensure data exists before assignment
        if (action.payload && action.payload.success) {
          state.stats = action.payload.stats || [];
          state.taskProgress = action.payload.taskProgress || [];
          state.teamPerformance = action.payload.teamPerformance || [];
        } else {
          console.warn("Invalid dashboard stats response:", action.payload);
        }
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Failed to fetch dashboard stats:", action.payload);
      });
  }
});

export default dashboardSlice.reducer;