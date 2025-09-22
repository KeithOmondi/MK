// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Supplier" | "Customer";
  forcePasswordChange?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  forcePasswordChange: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  success: null,
  forcePasswordChange: false,
};

// ==========================
// Async Thunks
// ==========================

// Register
export const register = createAsyncThunk<
  { message: string },
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async (credentials, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/register", credentials);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed");
  }
});

// Verify OTP
export const verifyOTP = createAsyncThunk<
  { message: string },
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyOTP", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/verify", payload);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "OTP verification failed");
  }
});

// Login
export const login = createAsyncThunk<
  { message: string; token: string; user: User; requiresPasswordChange?: boolean },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

// Get Current User
export const getUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>("auth/getUser", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/me"); // 🔧 Adjust if backend uses another endpoint
    return data;
  } catch (error: any) {
    localStorage.removeItem("token");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user");
  }
});

// Forgot Password
export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/password/forgot", payload);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send reset email");
  }
});

// Reset Password
export const resetPassword = createAsyncThunk<
  { message: string; token: string; user: User },
  { token: string; password: string; confirmPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put(`/auth/password/reset/${payload.token}`, payload);
    localStorage.setItem("token", data.token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Password reset failed");
  }
});

// Update Password
export const updatePassword = createAsyncThunk<
  { message: string },
  { currentPassword?: string; newPassword: string; confirmNewPassword: string },
  { rejectValue: string }
>("auth/updatePassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/auth/password/update", payload);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update password");
  }
});

// ==========================
// Slice
// ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.error = null;
      state.success = null;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.forcePasswordChange = false;
      state.loading = false;
      state.error = null;
      state.success = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    const pendingHandler = (state: AuthState) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    };

    // ==========================
    // Register
    // ==========================
    builder.addCase(register.pending, pendingHandler);
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Registration failed";
    });

    // ==========================
    // Verify OTP
    // ==========================
    builder.addCase(verifyOTP.pending, pendingHandler);
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "OTP verification failed";
    });

    // ==========================
    // Login
    // ==========================
    builder.addCase(login.pending, pendingHandler);
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user || null;
      state.success = action.payload.message;
      state.forcePasswordChange =
        action.payload.requiresPasswordChange || action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Login failed";
    });

    // ==========================
    // Get User
    // ==========================
    builder.addCase(getUser.pending, pendingHandler);
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user || null;
      state.forcePasswordChange = action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.forcePasswordChange = false;
      state.error = (action.payload as string) || "Failed to fetch user";
      localStorage.removeItem("token");
    });

    // ==========================
    // Forgot Password
    // ==========================
    builder.addCase(forgotPassword.pending, pendingHandler);
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to send reset email";
    });

    // ==========================
    // Reset Password
    // ==========================
    builder.addCase(resetPassword.pending, pendingHandler);
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user || null;
      state.token = action.payload.token;
      state.success = action.payload.message;
      state.forcePasswordChange = action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Password reset failed";
    });

    // ==========================
    // Update Password
    // ==========================
    builder.addCase(updatePassword.pending, pendingHandler);
    builder.addCase(updatePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      if (state.user) state.user.forcePasswordChange = false;
      state.forcePasswordChange = false;
    });
    builder.addCase(updatePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to update password";
    });
  },
});

export const { logout, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
