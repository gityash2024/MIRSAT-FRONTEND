import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { assetService } from '../../services/asset.service';

// Async thunks for API operations
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params, { rejectWithValue }) => {
    try {
      return await assetService.getAssets(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

export const fetchAsset = createAsyncThunk(
  'assets/fetchAsset',
  async (id, { rejectWithValue }) => {
    try {
      return await assetService.getAsset(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset');
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const response = await assetService.createAsset(assetData);
      toast.success('Asset created successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create asset');
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await assetService.updateAsset(id, data);
      toast.success('Asset updated successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update asset');
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assetService.deleteAsset(id);
      toast.success('Asset deleted successfully');
      return { id, ...response };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete asset');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
    }
  }
);

export const exportAssets = createAsyncThunk(
  'assets/exportAssets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await assetService.exportAssets();
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Assets exported successfully');
      return true;
    } catch (error) {
      toast.error('Failed to export assets');
      return rejectWithValue('Failed to export assets');
    }
  }
);

// Initial state
const initialState = {
  assets: [],
  asset: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10
  }
};

// Slice
const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    clearAssetError: (state) => {
      state.error = null;
    },
    clearAsset: (state) => {
      state.asset = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAssets
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          limit: state.pagination.limit
        };
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchAsset
      .addCase(fetchAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.asset = action.payload.data;
      })
      .addCase(fetchAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createAsset
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateAsset
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        // If the updated asset is currently selected, update it
        if (state.asset && state.asset._id === action.payload.data._id) {
          state.asset = action.payload.data;
        }
        // Update in the list if it exists
        const index = state.assets.findIndex(asset => asset._id === action.payload.data._id);
        if (index !== -1) {
          state.assets[index] = action.payload.data;
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteAsset
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted asset from the list
        state.assets = state.assets.filter(asset => asset._id !== action.payload.id);
        // If the deleted asset is currently selected, clear it
        if (state.asset && state.asset._id === action.payload.id) {
          state.asset = null;
        }
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // exportAssets
      .addCase(exportAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAssets.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAssetError, clearAsset, setPage } = assetSlice.actions;

export default assetSlice.reducer; 