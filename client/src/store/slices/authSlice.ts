import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authAPI, User } from "../../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Get token safely during initialization
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  isAuthenticated: false, // Don't assume authentication just because token exists
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  "auth/register",
  async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "freelancer" | "client";
  }) => {
    const response = await authAPI.register(userData);
    return response;
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials);
    return response;
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string) => {
    const response = await authAPI.forgotPassword(email);
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }: { token: string; password: string }) => {
    const response = await authAPI.resetPassword(token, password);
    return response;
  }
);

export const getProfile = createAsyncThunk("auth/getProfile", async () => {
  const response = await authAPI.getProfile();
  return response;
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User>) => {
    const response = await authAPI.updateProfile(profileData);
    return response;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await authAPI.changePassword(passwords);
    return response;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem("token");
      } catch {
        // Ignore localStorage errors
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      try {
        localStorage.setItem("token", action.payload);
      } catch {
        // Ignore localStorage errors
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Handle the new response structure: { success: true, data: {...} }
        const responseData = action.payload.data || action.payload;
        state.user = responseData.user;
        state.token = responseData.token;
        try {
          localStorage.setItem("token", responseData.token);
        } catch {
          // Ignore localStorage errors
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Registration failed";
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Handle the new response structure: { success: true, data: {...} }
        const responseData = action.payload.data || action.payload;
        state.user = responseData.user;
        state.token = responseData.token;
        try {
          localStorage.setItem("token", responseData.token);
        } catch {
          // Ignore localStorage errors
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to send reset email";
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to reset password";
      })

      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the new response structure: { success: true, data: {...} }
        state.user = action.payload.data || action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get profile";
        // Clear invalid token on profile fetch failure
        state.token = null;
        state.isAuthenticated = false;
        try {
          localStorage.removeItem("token");
        } catch {
          // Ignore localStorage errors
        }
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update profile";
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to change password";
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
