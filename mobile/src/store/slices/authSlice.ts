import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginPayload, RegisterPayload } from '../../types/auth';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../utils/tokenStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  loading: false,
  error: null,
};

// Restore session on app launch
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) return null;

      const { data } = await authService.getMe();
      return data.data;
    } catch {
      await tokenStorage.clearTokens();
      return rejectWithValue(null);
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await authService.login(payload);
      const { accessToken, refreshToken, user } = data.data;
      await tokenStorage.saveTokens(accessToken, refreshToken);
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Register Admin
export const registerAdmin = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await authService.register(payload);
      const { accessToken, refreshToken, user } = data.data;
      await tokenStorage.saveTokens(accessToken, refreshToken);
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    // Ignore logout API errors — always clear local tokens
  } finally {
    await tokenStorage.clearTokens();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    // Called when refresh token fails mid-session
    forceLogout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = 'Session expired. Please log in again.';
    },
  },
  extraReducers: (builder) => {
    // Restore session
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser, forceLogout } = authSlice.actions;
export default authSlice.reducer;
