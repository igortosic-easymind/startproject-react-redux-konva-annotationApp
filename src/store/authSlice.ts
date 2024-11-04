import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { ApiError } from '../types';

interface User {
  username: string;
  id: number;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  loading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// Helper function to check initial auth state
const getInitialAuthState = (): AuthState => {
  const token = localStorage.getItem('auth_token');
  return {
    isAuthenticated: !!token,
    user: null,
    error: null,
    loading: false,
  };
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiService.login(credentials);
    return response;
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
  }
});

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await apiService.logout();
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    checkAuthState: (state) => {
      const token = localStorage.getItem('auth_token');
      state.isAuthenticated = !!token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unexpected error occurred';
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
        // Still clear auth state even if logout fails
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

// Export actions
export const { clearError, checkAuthState } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;