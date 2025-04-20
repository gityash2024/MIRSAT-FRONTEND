import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import questionLibraryService from '../../services/questionLibrary.service';
import { extractErrorMessage } from '../../utils/errorHandling';

// Async thunk for fetching questions
export const fetchQuestionLibrary = createAsyncThunk(
  'questionLibrary/fetchQuestions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await questionLibraryService.getQuestionLibrary(params);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Async thunk for adding a question
export const addQuestionToLibrary = createAsyncThunk(
  'questionLibrary/addQuestion',
  async (questionData, { getState, rejectWithValue }) => {
    try {
      // Check if question already exists to prevent duplicates
      const { questionLibrary } = getState();
      const isDuplicate = questionLibrary.questions.some(
        q => q.text === questionData.text && q.answerType === questionData.answerType
      );
      
      if (isDuplicate) {
        return rejectWithValue('This question already exists in the library');
      }
      
      const response = await questionLibraryService.addQuestionToLibrary(questionData);
      return response;
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

// Initial state
const initialState = {
  questions: [],
  loading: false,
  error: null,
  totalResults: 0,
  page: 1,
  limit: 10
};

const questionLibrarySlice = createSlice({
  name: 'questionLibrary',
  initialState,
  reducers: {
    resetLibrary: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestionLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionLibrary.fulfilled, (state, action) => {
        console.log("Fulfilling library fetch with data:", action.payload);
        state.loading = false;
        state.questions = action.payload?.results || [];
        state.totalResults = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.limit = action.payload?.limit || 10;
      })
      .addCase(fetchQuestionLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Error fetching library:", action.payload);
      })
      
      // Add question
      .addCase(addQuestionToLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestionToLibrary.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new question to the existing questions array
        state.questions.push(action.payload.question);
        state.totalResults += 1;
      })
      .addCase(addQuestionToLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete question
      .addCase(deleteQuestionFromLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestionFromLibrary.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted question from the array
        state.questions = state.questions.filter(question => question._id !== action.payload.id);
        state.totalResults -= 1;
      })
      .addCase(deleteQuestionFromLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetLibrary } = questionLibrarySlice.actions;
export default questionLibrarySlice.reducer; 