// src/store/slices/inspectionLevelSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inspectionService } from '../../services/inspection.service';

const initialState = {
  levels: [],
  currentLevel: null,
  loading: false,
  error: null,
};

export const fetchInspectionLevels = createAsyncThunk(
  'inspectionLevels/fetchInspectionLevels',
  async (params, { rejectWithValue }) => {
    try {
      return await inspectionService.getInspectionLevels(params);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateInspectionLevel = createAsyncThunk(
  'inspectionLevels/updateInspectionLevel',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await inspectionService.updateInspectionLevel(id, data);
      return result;
    } catch (error) {
      console.error('Update error in thunk:', error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const inspectionLevelSlice = createSlice({
  name: 'inspectionLevels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspectionLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInspectionLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload;
      })
      .addCase(fetchInspectionLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add cases for updateInspectionLevel
      .addCase(updateInspectionLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInspectionLevel.fulfilled, (state, action) => {
        state.loading = false;
        // Update the level in the levels array if it exists
        if (Array.isArray(state.levels)) {
          const index = state.levels.findIndex(level => level._id === action.payload._id);
          if (index !== -1) {
            state.levels[index] = action.payload;
          }
        } else {
          // If levels is not an array, initialize it
          state.levels = [action.payload];
        }
      })
      .addCase(updateInspectionLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default inspectionLevelSlice.reducer;