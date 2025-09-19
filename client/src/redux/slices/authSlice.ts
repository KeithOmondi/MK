// redux/slices/authSlice.ts
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
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  success: null,
};

// ==========================
// Async Thunks
// ==========================

// ✅ Register
export const register = createAsyncThunk(
  "auth/register",
  async (
    credentials: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/auth/register", credentials);
      return data; // { success, message }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// ✅ Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (payload: { email: string; otp: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/verify", payload);
      return data; // { success, message }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("token", data.token);
      return data; // { success, message, token, user }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// ✅ Get Current User
export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/me");
    return data; // { success, user }
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch user"
    );
  }
});

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/password/forgot", payload);
      return data; // { success, message }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { token: string; password: string; confirmPassword: string },
    thunkAPI
  ) => {
    try {
      const { data } = await api.put(
        `/auth/password/reset/${payload.token}`,
        payload
      );
      return data; // { success, message, token, user }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// ✅ Update Password
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await api.put("/auth/password/update", payload);
      return data; // { success, message }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update password"
      );
    }
  }
);

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
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.success = action.payload.message;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Get User
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });

    // Forgot Password
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.success = action.payload.message;
    });

    // Reset Password
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.success = action.payload.message;
    });

    // Update Password
    builder.addCase(updatePassword.fulfilled, (state, action) => {
      state.success = action.payload.message;
    });
  },
});

export const { logout, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
