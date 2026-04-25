import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { departmentService } from '../../services/department.service';

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      return await departmentService.getDepartments();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await departmentService.createDepartment(departmentData);
      toast.success('Department created successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create department';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await departmentService.updateDepartment(id, data);
      toast.success('Department updated successfully');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update department';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await departmentService.deleteDepartment(id);
      toast.success('Department deleted successfully');
      return { id, ...response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete department';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  departments: [],
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    resetDepartmentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.departments = action.payload.data || [];
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const department = action.payload.data;
        const existingIndex = state.departments.findIndex(item => item._id === department._id);
        if (existingIndex === -1) {
          state.departments.push(department);
        } else {
          state.departments[existingIndex] = department;
        }
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const department = action.payload.data;
        const index = state.departments.findIndex(item => item._id === department._id);
        if (index !== -1) {
          state.departments[index] = department;
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.departments = state.departments.filter(item => item._id !== action.payload.id);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDepartmentError, resetDepartmentState } = departmentSlice.actions;

export default departmentSlice.reducer;
