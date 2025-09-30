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
    asset: [],
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
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
      if (!id || id === 'undefined') {
        return rejectWithValue('Invalid task ID');
      }
      
      console.log('Getting task with ID:', id);
      const response = await api.get(`/tasks/${id}`);
      
      // Log the response for debugging
      console.log('API response for task by ID:', response.data);
      
      // Check if the response data is an array with at least one item
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log('Returning first task from array');
        // Add the array to the response for completeness
        return {
          ...response.data,
          firstTask: response.data.data[0]  // Add a convenience property
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch task details' });
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
      // Ensure content is a string, not an object
      const contentToSend = typeof content === 'object' ? JSON.stringify(content) : content;
      console.log('Sending comment content:', contentToSend, 'Type:', typeof contentToSend);
      
      const response = await api.post(`/tasks/${id}/comments`, { content: contentToSend });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error adding comment');
      return rejectWithValue(error.response?.data);
    }
  }
);
// In taskSlice.js
export const uploadTaskAttachment = createAsyncThunk(
  'tasks/uploadTaskAttachment',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      console.log('uploadTaskAttachment called with:', { id, file });
      if (!file) {
        throw new Error('No file provided');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      let url = '/upload'; // Default upload endpoint if no task ID
      
      // If we have a task ID, use the task-specific upload endpoint
      if (id) {
        url = `/tasks/${id}/attachments`;
      }
      
      console.log('Uploading to:', url);
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      toast.success('File uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('Upload error in thunk:', error);
      const errorMsg = error.response?.data?.message || 'Error uploading file';
      toast.error(errorMsg);
      return rejectWithValue({ message: errorMsg });
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      // Ensure assignedTo is an array
      const processedData = {
        ...taskData,
        assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [taskData.assignedTo]
      };
      
      console.log('Creating task with data:', processedData);
      
      const response = await api.post('/tasks', processedData);
      
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
      // Ensure we have a valid ID
      if (!id || id === 'undefined') {
        throw new Error('Invalid task ID for update operation');
      }
      
      // Ensure assignedTo is an array with valid values
      let assignedToArray = [];
      if (data.assignedTo) {
        const toProcess = Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo];
        
        // Filter out invalid values and extract IDs
        assignedToArray = toProcess
          .filter(user => user != null && user !== 'undefined' && user !== '')
          .map(user => {
            // If user is already a string ID
            if (typeof user === 'string') return user;
            // If user is an object with id (this is the format from the API response)
            if (typeof user === 'object' && user.id) return user.id;
            // If user is an object with _id
            if (typeof user === 'object' && user._id) return user._id;
            // Otherwise return as is
            return user;
          })
          .filter(id => id != null && id !== 'undefined' && id !== '');
      }
      
      // Cleanup preInspectionQuestions - ensure format is consistent
      let preInspectionQuestionsArray = [];
      if (data.preInspectionQuestions && Array.isArray(data.preInspectionQuestions)) {
        preInspectionQuestionsArray = data.preInspectionQuestions.map(q => {
          // Start with a clean question object with only essential properties
          const cleanQuestion = {
            text: q.text,
            type: q.type,
            options: q.options || [],
            required: q.required !== undefined ? q.required : true
          };
          
          // Add _id if it exists
          if (q._id) {
            cleanQuestion._id = q._id;
          }
          
          // Add scoring if it exists
          if (q.scoring) {
            cleanQuestion.scoring = q.scoring;
          }
          
          // Add scores if they exist
          if (q.scores) {
            cleanQuestion.scores = q.scores;
          }
          
          return cleanQuestion;
        });
      }
      
      // Create a clean processed data object
      const processedData = {
        ...data,
        assignedTo: assignedToArray
      };
      
      // Ensure preInspectionQuestions is properly included
      if (preInspectionQuestionsArray.length > 0) {
        processedData.preInspectionQuestions = preInspectionQuestionsArray;
      } else if (data.preInspectionQuestions && Array.isArray(data.preInspectionQuestions)) {
        // If we have an empty array, still include it to allow clearing questions
        processedData.preInspectionQuestions = [];
      }
      
      // Make sure inspectionLevel is included
      if (data.inspectionLevel) {
        processedData.inspectionLevel = data.inspectionLevel;
      }
      
      // Make sure asset is included
      if (data.asset) {
        processedData.asset = data.asset;
      }
      
      console.log('Updating task with ID:', id);
      console.log('Update payload:', JSON.stringify(processedData));
      console.log('PreInspectionQuestions:', JSON.stringify(preInspectionQuestionsArray));
      
      const response = await api.put(`/tasks/${id}`, processedData);
      
      console.log('Update task response:', response.data);
      toast.success('Task updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
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
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Task ID is required for deletion');
      }
      
      console.log('Deleting task with ID:', id);
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      return id; // Return the ID for state updates
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMsg = error.response?.data?.message || 'Error deleting task';
      toast.error(errorMsg);
      return rejectWithValue({
        message: errorMsg,
        statusCode: error.response?.status || 500
      });
    }
  }
);

export const fetchTasksProgressData = createAsyncThunk(
  'tasks/fetchTasksProgressData',
  async (taskIds, { rejectWithValue }) => {
    try {
      const { userTaskService } = await import('../../services/userTask.service');
      const response = await userTaskService.getTasksProgressData(taskIds);
      return response;
    } catch (error) {
      console.error('Error fetching tasks progress data:', error);
      return rejectWithValue(error.response?.data || 'Error fetching tasks progress data');
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
        console.log('Redux: fetchTasks.fulfilled - Full payload:', action.payload);
        console.log('Redux: Pagination data from API:', action.payload.pagination);
        
        // Ensure tasks have the correct id field for progress matching
        state.tasks = action.payload.data.map(task => ({
          ...task,
          id: task.id || task._id // Ensure id field exists
        }));
        
        const paginationData = {
          page: action.payload.pagination?.page || action.payload.page || 1,
          limit: action.payload.pagination?.limit || action.payload.limit || 10,
          total: action.payload.pagination?.total || action.payload.total || 0,
          pages: action.payload.pagination?.pages || action.payload.pages || action.payload.totalPages || Math.ceil((action.payload.pagination?.total || action.payload.total || 0) / (action.payload.pagination?.limit || action.payload.limit || 10))
        };
        
        console.log('Redux: Setting pagination data:', paginationData);
        state.pagination = paginationData;
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
        // Add new task at the beginning since we sort by createdAt descending
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
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both _id and id fields for compatibility
        const taskId = action.payload;
        state.tasks = state.tasks.filter(task => 
          (task._id !== taskId) && (task.id !== taskId)
        );
        if (state.currentTask && 
           (state.currentTask._id === taskId || 
            state.currentTask.id === taskId)) {
          state.currentTask = null;
        }
        
        // Update pagination after deletion
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
          state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
          
          // If current page becomes empty and it's not the first page, go to previous page
          const currentPage = state.pagination.page;
          const totalPages = state.pagination.pages;
          if (currentPage > totalPages && totalPages > 0) {
            state.pagination.page = totalPages;
          }
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(fetchTasksProgressData.fulfilled, (state, action) => {
        // Update tasks with progress data
        if (action.payload && action.payload.length > 0) {
          console.log('Redux: Updating tasks with progress data:', action.payload);
          action.payload.forEach(progressData => {
            // Try to match by both id and _id fields
            const taskIndex = state.tasks.findIndex(task => 
              task.id === progressData.taskId || 
              task._id === progressData.taskId
            );
            if (taskIndex !== -1) {
              console.log(`Redux: Updating task ${progressData.taskId} with progress ${progressData.overallProgress}%`);
              state.tasks[taskIndex].overallProgress = progressData.overallProgress;
              state.tasks[taskIndex].completionRate = progressData.completionRate;
              state.tasks[taskIndex].questionnaireResponses = progressData.questionnaireResponses;
              state.tasks[taskIndex].completedQuestions = progressData.completedQuestions;
              state.tasks[taskIndex].totalQuestions = progressData.totalQuestions;
            } else {
              console.warn(`Redux: Task ${progressData.taskId} not found in state.tasks. Available task IDs:`, state.tasks.map(t => ({ id: t.id, _id: t._id })));
            }
          });
          console.log('Redux: Tasks after progress update:', state.tasks.map(t => ({ id: t.id, _id: t._id, progress: t.overallProgress })));
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