import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No token available');
      }
      
      const response = await apiService.getProfile();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch profile');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Profile update failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'auth/changeUserPassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return { message: 'Password changed successfully' };
      } else {
        return rejectWithValue(response.message || 'Password change failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

// Initial state
const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastFetched: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials (token + user data)
    setCredentials: (state, action) => {
      const { token, ...userData } = action.payload;
      state.token = token;
      state.user = userData;
      state.isAuthenticated = true;
      state.error = null;
      state.lastFetched = Date.now();
    },
    
    // Clear credentials (logout)
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastFetched = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear auth state on profile fetch failure
        // Token might still be valid
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { setCredentials, clearCredentials, clearError, setError } = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserType = (state) => state.auth.user?.user_type;
export const selectUserPermissions = (state) => {
  const user = state.auth.user;
  if (!user) return [];
  
  // Return permissions based on user type
  const permissionMap = {
    admin: [
      'create_company', 'manage_verifiers', 'view_all_applications',
      'assign_applications', 'view_documents', 'verify_documents',
      'manage_users', 'access_reports', 'view_dashboard',
      'view_clients', 'view_employees', 'view_applications', 'view_help'
    ],
    verifier: [
      'view_assigned_applications', 'review_applications',
      'approve_applications', 'reject_applications', 'view_documents',
      'verify_documents', 'view_verifier_dashboard',
      'view_verifier_applications', 'view_pending', 'view_approved', 'view_verifier_help'
    ],
    company: ['view_company_applications', 'view_company_stats']
  };
  
  return permissionMap[user.user_type] || [];
};

// Export reducer
export default authSlice.reducer;
