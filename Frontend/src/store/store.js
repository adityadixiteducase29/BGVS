import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Simple store configuration without complex persistence
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['auth/setCredentials'],
        // Ignore these field paths in all actions
        ignoredPaths: ['auth.user'],
      },
    }),
});
