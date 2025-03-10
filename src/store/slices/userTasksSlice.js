import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userTaskService } from '../../services/userTask.service';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchUserTasks = createAsyncThunk(
  'userTasks/fetchUserTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userTaskService.getUserTasks(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchUserDashboardStats = createAsyncThunk(
  'userTasks/fetchUserDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userTaskService.getUserDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchUserTaskDetails = createAsyncThunk(
  'userTasks/fetchUserTaskDetails',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await userTaskService.getTaskDetails(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const startUserTask = createAsyncThunk(
  'userTasks/startUserTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await userTaskService.startTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateUserTaskProgress = createAsyncThunk(
  'userTasks/updateUserTaskProgress',
  async ({ taskId, subLevelId, data }, { rejectWithValue }) => {
    try {
      const response = await userTaskService.updateTaskProgress(taskId, subLevelId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addUserTaskComment = createAsyncThunk(
  'userTasks/addUserTaskComment',
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      const response = await userTaskService.addTaskComment(taskId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const userTasksSlice = createSlice({
  name: 'userTasks',
  initialState: {
    tasks: {
      results: [],
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0
    },
    dashboardStats: {
      stats: [],
      recentTasks: [],
      statusCounts: [],
      performance: {}
    },
    currentTask: null,
    filters: {
      status: [],
      priority: [],
      search: '',
      inspectionLevel: []
    },
    pagination: {
      page: 1,
      limit: 10
    },
    sort: '-deadline',
    loading: false,
    dashboardLoading: false,
    taskDetailsLoading: false,
    actionLoading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSorting: (state, action) => {
      state.sort = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
        toast.error(state.error);
      })

      // Fetch dashboard stats
      .addCase(fetchUserDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchUserDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard statistics';
        toast.error(state.error);
      })

      // Fetch task details
      .addCase(fetchUserTaskDetails.pending, (state) => {
        state.taskDetailsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTaskDetails.fulfilled, (state, action) => {
        state.taskDetailsLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchUserTaskDetails.rejected, (state, action) => {
        state.taskDetailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch task details';
        toast.error(state.error);
      })

      // Start task
      .addCase(startUserTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(startUserTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update task in tasks list
        const updatedTask = action.payload;
        state.tasks.results = state.tasks.results.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        toast.success('Task started successfully');
      })
      .addCase(startUserTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to start task';
        toast.error(state.error);
      })

      // Update task progress
      .addCase(updateUserTaskProgress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUserTaskProgress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedTask = action.payload;
        
        // Update current task if it's the same one
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        
        // Update task in tasks list
        state.tasks.results = state.tasks.results.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        
        toast.success('Progress updated successfully');
      })
      .addCase(updateUserTaskProgress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update progress';
        toast.error(state.error);
      })

      // Add task comment
      .addCase(addUserTaskComment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addUserTaskComment.fulfilled, (state, action) => {
        state.actionLoading = false;
        
        // Update current task if it exists
        if (state.currentTask) {
          const updatedTask = action.payload;
          state.currentTask = updatedTask;
        }
        
        toast.success('Comment added successfully');
      })
      .addCase(addUserTaskComment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to add comment';
        toast.error(state.error);
      });
  }
});

export const { setFilters, setPagination, setSorting, clearCurrentTask } = userTasksSlice.actions;

export default userTasksSlice.reducer;