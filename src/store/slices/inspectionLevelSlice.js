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
      });
  },
});

export default inspectionLevelSlice.reducer;