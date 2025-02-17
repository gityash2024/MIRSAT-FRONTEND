import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assignedTo: [],
    inspectionLevel: [],
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching tasks');
    }
  }
);

export const getTaskById = createAsyncThunk(
  'tasks/getTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching task');
    }
  }
);


export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ id, status, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}/status`, { status, comment });
      toast.success('Task status updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating task status');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${id}/comments`, { content });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding comment');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadTaskAttachment = createAsyncThunk(
  'tasks/uploadTaskAttachment',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/tasks/${id}/attachments`, formData);
      toast.success('Attachment uploaded successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading attachment');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      
      toast.success('Task created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating task';
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      
      toast.success('Task updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating task';
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);


export const deleteTaskAttachment = createAsyncThunk(
  'tasks/deleteTaskAttachment',
  async ({ id, attachmentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}/attachments/${attachmentId}`);
      toast.success('Attachment deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting attachment');
      return rejectWithValue(error.response?.data);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total
        };
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(addTaskComment.fulfilled, (state, action) => {
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteTaskAttachment.fulfilled, (state, action) => {
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteTaskAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadTaskAttachment.fulfilled, (state, action) => {
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      });
  }
});

export const {
  setFilters,
  resetFilters,
  setCurrentTask,
  clearCurrentTask,
  setPagination
} = taskSlice.actions;

export default taskSlice.reducer;