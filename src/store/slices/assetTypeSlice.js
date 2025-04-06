// store/slices/assetTypeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { assetService } from '../../services/asset.service';

// Async thunks for API operations
export const fetchAssetTypes = createAsyncThunk(
  'assetTypes/fetchAssetTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await assetService.getAssetTypes();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset types');
    }
  }
);

export const createAssetType = createAsyncThunk(
  'assetTypes/createAssetType',
  async (assetTypeData, { rejectWithValue }) => {
    try {
      const response = await assetService.createAssetType(assetTypeData);
      toast.success('Asset type created successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create asset type');
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset type');
    }
  }
);

export const updateAssetType = createAsyncThunk(
  'assetTypes/updateAssetType',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await assetService.updateAssetType(id, data);
      toast.success('Asset type updated successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update asset type');
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset type');
    }
  }
);

export const deleteAssetType = createAsyncThunk(
  'assetTypes/deleteAssetType',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.deleteAssetType(id);
      toast.success('Asset type deleted successfully');
      return { id, ...response };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete asset type');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset type');
    }
  }
);

// Initial state
const initialState = {
  assetTypes: [],
  loading: false,
  error: null
};

// Slice
const assetTypeSlice = createSlice({
  name: 'assetTypes',
  initialState,
  reducers: {
    clearAssetTypeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAssetTypes
      .addCase(fetchAssetTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.assetTypes = action.payload.data;
      })
      .addCase(fetchAssetTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createAssetType
      .addCase(createAssetType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssetType.fulfilled, (state, action) => {
        state.loading = false;
        state.assetTypes.push(action.payload.data);
      })
      .addCase(createAssetType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateAssetType
      .addCase(updateAssetType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssetType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.assetTypes.findIndex(type => type._id === action.payload.data._id);
        if (index !== -1) {
          state.assetTypes[index] = action.payload.data;
        }
      })
      .addCase(updateAssetType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteAssetType
      .addCase(deleteAssetType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetType.fulfilled, (state, action) => {
        state.loading = false;
        state.assetTypes = state.assetTypes.filter(type => type._id !== action.payload.id);
      })
      .addCase(deleteAssetType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAssetTypeError } = assetTypeSlice.actions;

export default assetTypeSlice.reducer;