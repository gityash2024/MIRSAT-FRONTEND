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
      console.log("Adding question to library:", questionData);
      
      // Make sure we're sending clean data without any internal IDs
      const cleanData = {
        text: questionData.text,
        answerType: questionData.answerType,
        options: questionData.options || [],
        required: questionData.required !== undefined ? questionData.required : true
      };
      
      // If we're updating an existing question, include the ID
      if (questionData.id || questionData._id) {
        cleanData.id = questionData.id || questionData._id;
      }
      
      // Check if question already exists to prevent duplicates
      const { questionLibrary } = getState();
      if (!cleanData.id) { // Only check for duplicates when creating new questions
        const isDuplicate = questionLibrary.questions.some(
          q => q.text === cleanData.text && q.answerType === cleanData.answerType
        );
        
        if (isDuplicate) {
          return rejectWithValue('This question already exists in the library');
        }
      }
      
      const response = await questionLibraryService.addQuestionToLibrary(cleanData);
      console.log("API Response for adding question:", response);
      return response;
    } catch (error) {
      console.error("Error in addQuestionToLibrary:", error);
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Delete question from library
export const deleteQuestionFromLibrary = createAsyncThunk(
  'questionLibrary/deleteQuestionFromLibrary',
  async (id, { rejectWithValue }) => {
    try {
      console.log("Deleting question with ID:", id);
      const response = await questionLibraryService.deleteQuestionFromLibrary(id);
      console.log("API Response for deleting question:", response);
      return { id, response };
    } catch (error) {
      console.error("Error in deleteQuestionFromLibrary:", error);
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
        
        // Check if we're getting a question or data.question in the response
        const questionData = action.payload.question || action.payload.data;
        
        if (questionData) {
          // Check if we're updating an existing question
          const existingIndex = state.questions.findIndex(q => 
            (q._id === questionData._id) || (q.id === questionData.id)
          );
          
          if (existingIndex >= 0) {
            // Update existing question
            state.questions[existingIndex] = questionData;
          } else {
            // Add new question
            state.questions.push(questionData);
            state.totalResults += 1;
          }
        } else {
          console.warn('Unexpected response format in addQuestionToLibrary:', action.payload);
        }
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
        
        // Handle both id formats (_id and id)
        const deletedId = action.payload.id;
        if (deletedId) {
          // Remove the deleted question from the array
          state.questions = state.questions.filter(question => 
            question._id !== deletedId && question.id !== deletedId
          );
          state.totalResults = Math.max(0, state.totalResults - 1);
        } else {
          console.warn('No ID returned from deleteQuestionFromLibrary:', action.payload);
        }
      })
      .addCase(deleteQuestionFromLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetLibrary } = questionLibrarySlice.actions;
export default questionLibrarySlice.reducer; 