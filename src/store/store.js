import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import taskReducer from './slices/taskSlice';
import inspectionLevelReducer from './slices/inspectionLevelSlice';
import userTasksReducer from './slices/userTasksSlice';
import questionLibraryReducer from './slices/questionLibrarySlice';
import assetReducer from './slices/assetSlice';
import assetTypeReducer from './slices/assetTypeSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    tasks: taskReducer,
    inspectionLevels: inspectionLevelReducer,
    userTasks: userTasksReducer,
    questionLibrary: questionLibraryReducer,
    assets: assetReducer,
    assetTypes: assetTypeReducer,
    departments: departmentReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
