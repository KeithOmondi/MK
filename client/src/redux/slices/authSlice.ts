// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (payload: { email: string; otp: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/verify-otp", payload);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "OTP verification failed");
    }
  }
);


// Login
export const login = createAsyncThunk<
  { message: string; token?: string; user?: User; requiresPasswordChange?: boolean },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", credentials);

    // Save token if present
    if (data.token) localStorage.setItem("token", data.token);

    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

// Get current user
export const getUser = createAsyncThunk<{ user: User }, void, { rejectValue: string }>(
  "auth/getUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (error: any) {
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

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

// Force Change Password
export const changePassword = createAsyncThunk<
  { message: string; token?: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/changePassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/auth/change-password", payload);
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to change password");
  }
});

// Logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.get("/auth/logout");
  } finally {
    localStorage.removeItem("token");
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
      state.loading = false;
      state.error = null;
      state.success = null;
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
    const rejectedHandler = (state: AuthState, action: any, defaultMsg: string) => {
      state.loading = false;
      state.error = action.payload || action.error?.message || defaultMsg;
    };

    // Login
    builder.addCase(login.pending, pendingHandler);
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;

      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      }

      state.user = action.payload.user || null;

      state.forcePasswordChange =
        action.payload.requiresPasswordChange || action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(login.rejected, (state, action) => rejectedHandler(state, action, "Login failed"));

    // Change Password
    builder.addCase(changePassword.pending, pendingHandler);
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      if (state.user) state.user.forcePasswordChange = false;
      state.forcePasswordChange = false;
      if (action.payload.token) state.token = action.payload.token;
    });
    builder.addCase(changePassword.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to change password")
    );

    // Update Password
    builder.addCase(updatePassword.pending, pendingHandler);
    builder.addCase(updatePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      if (state.user) state.user.forcePasswordChange = false;
      state.forcePasswordChange = false;
    });
    builder.addCase(updatePassword.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to update password")
    );

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.forcePasswordChange = false;
      state.loading = false;
      state.error = null;
      state.success = null;
    });
  },
});

export const { clearAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
