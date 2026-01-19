import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userTaskService } from '../../services/userTask.service';
import { toast } from 'react-hot-toast';

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
  async ({ 
    taskId, 
    subLevelId, 
    status, 
    notes, 
    photos, 
    timeSpent,
    sectionScore,
    taskMetrics 
  }, { rejectWithValue }) => {
    try {
      // Create a proper data object with all parameters
      const updateData = {
        status,
        ...(notes !== undefined && { notes }),
        ...(photos !== undefined && { photos }),
        ...(timeSpent !== undefined && { timeSpent }),
        ...(sectionScore !== undefined && { sectionScore }),
        ...(taskMetrics !== undefined && { taskMetrics })
      };
      
      const response = await userTaskService.updateTaskProgress(taskId, subLevelId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateTaskQuestionnaire = createAsyncThunk(
  'userTasks/updateTaskQuestionnaire',
  async ({ taskId, questionnaire }, { rejectWithValue }) => {
    try {
      // Extract the required fields for the API
      const { responses, notes, completed } = questionnaire;
      
      const response = await userTaskService.updateTaskQuestionnaire(taskId, { 
        responses, 
        notes, 
        completed 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addUserTaskComment = createAsyncThunk(
  'userTasks/addUserTaskComment',
  async ({ taskId, comment }, { rejectWithValue }) => {
    try {
      const response = await userTaskService.addTaskComment(taskId, { text: comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const exportTaskReport = createAsyncThunk(
  'userTasks/exportTaskReport',
  async ({ taskId, format = 'excel', fileName = null, taskData = null }, { rejectWithValue, getState }) => {
    try {
      // For PDF format, try to use current task data from Redux store
      let dataToUse = taskData;
      if (format === 'pdf' && !dataToUse) {
        const state = getState();
        dataToUse = state.userTasks.currentTask;
      }
      
      const response = await userTaskService.exportTaskReport(taskId, format, fileName, dataToUse);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const saveTaskSignature = createAsyncThunk(
  'userTasks/saveTaskSignature',
  async ({ taskId, signature, taskMetrics }, { rejectWithValue }) => {
    try {
      const response = await userTaskService.saveTaskSignature(taskId, { 
        signature,
        ...(taskMetrics && { taskMetrics })
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const uploadTaskAttachment = createAsyncThunk(
  'userTasks/uploadTaskAttachment',
  async ({ taskId, file }, { rejectWithValue }) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file format and size (10MB limit) before upload
      const { validateFileWithToast } = await import('../../utils/fileValidation');
      const { toast } = await import('react-hot-toast');
      if (!validateFileWithToast(file, toast)) {
        return rejectWithValue({ message: 'File validation failed. Please check file format and size (max 10 MB).' });
      }
      
      const response = await userTaskService.uploadTaskAttachment(taskId, file);
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return rejectWithValue(error.response?.data || { message: error.message || 'Failed to upload attachment' });
    }
  }
);

export const archiveTask = createAsyncThunk(
  'userTasks/archiveTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await userTaskService.archiveTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchUserTasksProgressData = createAsyncThunk(
  'userTasks/fetchUserTasksProgressData',
  async (taskIds, { rejectWithValue }) => {
    try {
      const response = await userTaskService.getTasksProgressData(taskIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

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
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchUserTasksProgressData.fulfilled, (state, action) => {
        // Update tasks with progress data
        // The payload is an array of progress data objects
        const progressDataArray = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
        
        if (progressDataArray && progressDataArray.length > 0) {
          console.log('Redux: Updating user tasks with progress data:', progressDataArray);
          progressDataArray.forEach(progressData => {
            if (!progressData || !progressData.taskId) return;
            
            // Try to match by both id and _id fields
            const taskIndex = state.tasks.results.findIndex(task => {
              const taskId = task.id || task._id;
              const progressTaskId = progressData.taskId;
              return taskId && progressTaskId && (
                taskId.toString() === progressTaskId.toString() ||
                taskId === progressTaskId
              );
            });
            
            if (taskIndex !== -1) {
              console.log(`Redux: Updating user task ${progressData.taskId} with progress ${progressData.overallProgress}%`);
              state.tasks.results[taskIndex].overallProgress = progressData.overallProgress || 0;
            } else {
              console.warn(`Redux: User task ${progressData.taskId} not found in state.tasks.results. Available task IDs:`, state.tasks.results.map(t => ({ id: t.id, _id: t._id })));
            }
          });
          console.log('Redux: User tasks after progress update:', state.tasks.results.map(t => ({ id: t.id, _id: t._id, progress: t.overallProgress })));
        }
      })
      .addCase(fetchUserTasksProgressData.rejected, (state, action) => {
        console.warn('Failed to fetch user tasks progress data:', action.payload);
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
        toast.error(state.error);
      })

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

      .addCase(startUserTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(startUserTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedTask = action.payload;
        // Update the task in the results array with proper status
        state.tasks.results = state.tasks.results.map(task => 
          task._id === updatedTask._id || task.id === updatedTask._id ? 
            { ...task, ...updatedTask, status: 'in_progress' } : task
        );
        toast.success('Task started successfully');
      })
      .addCase(startUserTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to start task';
        toast.error(state.error);
      })

      .addCase(updateUserTaskProgress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUserTaskProgress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedTask = action.payload;
        
        // OPTIMIZED: Only update progress-related fields instead of entire task
        // to prevent unnecessary re-renders and cascade effects
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          // Only update the specific fields that are relevant to progress
          if (updatedTask.overallProgress !== undefined) {
            state.currentTask.overallProgress = updatedTask.overallProgress;
          }
          if (updatedTask.progress !== undefined) {
            state.currentTask.progress = updatedTask.progress;
          }
          if (updatedTask.taskMetrics !== undefined) {
            state.currentTask.taskMetrics = updatedTask.taskMetrics;
          }
          if (updatedTask.status !== undefined) {
            state.currentTask.status = updatedTask.status;
          }
        }
        
        // Update in tasks list (minimal update)
        const taskIndex = state.tasks.results.findIndex(task => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          if (updatedTask.overallProgress !== undefined) {
            state.tasks.results[taskIndex].overallProgress = updatedTask.overallProgress;
          }
          if (updatedTask.status !== undefined) {
            state.tasks.results[taskIndex].status = updatedTask.status;
          }
        }
        
        // toast.success('Progress updated successfully');
      })
      .addCase(updateUserTaskProgress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update progress';
        toast.error(state.error);
      })
      
      .addCase(updateTaskQuestionnaire.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTaskQuestionnaire.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedTask = action.payload;
        
        // OPTIMIZED: Only update questionnaireResponses and related fields
        // instead of replacing the entire task to prevent unnecessary re-renders
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          // Only update the specific fields that changed
          state.currentTask.questionnaireResponses = updatedTask.questionnaireResponses;
          state.currentTask.questionnaireNotes = updatedTask.questionnaireNotes;
          state.currentTask.questionnaireCompleted = updatedTask.questionnaireCompleted;
          // Update overallProgress if it changed
          if (updatedTask.overallProgress !== undefined) {
            state.currentTask.overallProgress = updatedTask.overallProgress;
          }
        }
        
        // Update in tasks list as well (minimal update)
        const taskIndex = state.tasks.results.findIndex(task => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          state.tasks.results[taskIndex].questionnaireResponses = updatedTask.questionnaireResponses;
          state.tasks.results[taskIndex].questionnaireCompleted = updatedTask.questionnaireCompleted;
          if (updatedTask.overallProgress !== undefined) {
            state.tasks.results[taskIndex].overallProgress = updatedTask.overallProgress;
          }
        }
        
        // toast.success('Questionnaire saved successfully');
      })
      .addCase(updateTaskQuestionnaire.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to save questionnaire';
        toast.error(state.error);
      })

      .addCase(addUserTaskComment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addUserTaskComment.fulfilled, (state, action) => {
        state.actionLoading = false;
        
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
      })
      
      .addCase(exportTaskReport.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(exportTaskReport.fulfilled, (state) => {
        state.actionLoading = false;
        toast.success('Report exported successfully');
      })
      .addCase(exportTaskReport.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to export report';
        toast.error(state.error);
      })

      .addCase(saveTaskSignature.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(saveTaskSignature.fulfilled, (state, action) => {
        state.actionLoading = false;
        toast.success('Task signature saved successfully');
      })
      .addCase(saveTaskSignature.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to save task signature';
        toast.error(state.error);
      })

      .addCase(uploadTaskAttachment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(uploadTaskAttachment.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(uploadTaskAttachment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to upload attachment';
        toast.error(state.error);
      })

      .addCase(archiveTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(archiveTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedTask = action.payload;
        
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        
        // Update the task in the results array
        state.tasks.results = state.tasks.results.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        
        toast.success('Task archived successfully');
      })
      .addCase(archiveTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to archive task';
        toast.error(state.error);
      });
  }
});

export const { setFilters, setPagination, setSorting, clearCurrentTask } = userTasksSlice.actions;

export default userTasksSlice.reducer;