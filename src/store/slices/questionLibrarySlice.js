import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionLibraryService } from '../../services/questionLibrary.service';
import { extractErrorMessage } from '../../utils/errorHandling';

// Fetch question library
export const fetchQuestionLibrary = createAsyncThunk(
  'questionLibrary/fetchQuestionLibrary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await questionLibraryService.getQuestionLibrary(params);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Add question to library
export const addQuestionToLibrary = createAsyncThunk(
  'questionLibrary/addQuestionToLibrary',
  async (questionData, { rejectWithValue }) => {
    try {
      const data = await questionLibraryService.addQuestionToLibrary(questionData);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Delete question from library
export const deleteQuestionFromLibrary = createAsyncThunk(
  'questionLibrary/deleteQuestionFromLibrary',
  async (id, { rejectWithValue }) => {
    try {
      await questionLibraryService.deleteQuestionFromLibrary(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const initialState = {
  questions: [],
  loading: false,
  error: null,
  totalResults: 0,
  page: 1,
  limit: 100
};

const questionLibrarySlice = createSlice({
  name: 'questionLibrary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch question library
      .addCase(fetchQuestionLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.results;
        state.totalResults = action.payload.totalResults;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchQuestionLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add question to library
      .addCase(addQuestionToLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestionToLibrary.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new question only if it's not already in the list
        if (!state.questions.find(q => q._id === action.payload.data._id)) {
          state.questions.unshift(action.payload.data);
          state.totalResults += 1;
        }
      })
      .addCase(addQuestionToLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete question from library
      .addCase(deleteQuestionFromLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionFromLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = state.questions.filter(q => q._id !== action.payload);
        state.totalResults -= 1;
      })
      .addCase(deleteQuestionFromLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = questionLibrarySlice.actions;
export default questionLibrarySlice.reducer; 