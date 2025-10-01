import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Supplier" | "User";
  forcePasswordChange?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  forcePasswordChange: boolean;
}

type RejectValue = string;

// ==========================
// LocalStorage Helpers
// ==========================
export const saveAccessToken = (token?: string) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    return token;
  }
  return null;
};

const getAccessToken = () => localStorage.getItem("accessToken");
const removeAccessToken = () => localStorage.removeItem("accessToken");

// ==========================
// Initial State
// ==========================
const initialState: AuthState = {
  user: null,
  accessToken: getAccessToken(),
  loading: false,
  error: null,
  success: null,
  forcePasswordChange: false,
};

// ==========================
// Async Thunks
// ==========================
export const register = createAsyncThunk<
  { message: string },
  { name: string; email: string; password: string },
  { rejectValue: RejectValue }
>("auth/register", async (credentials, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/register", credentials);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const verifyOTP = createAsyncThunk<
  { message: string },
  { email: string; otp: string },
  { rejectValue: RejectValue }
>("auth/verifyOTP", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/verify-otp", payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "OTP verification failed");
  }
});

export const login = createAsyncThunk<
  {
    message: string;
    accessToken?: string;
    user?: User;
    requiresPasswordChange?: boolean;
    accountLocked?: boolean;
    attemptsLeft?: number;
  },
  { email: string; password: string },
  { rejectValue: RejectValue }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const refreshAccessToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: RejectValue }
>("auth/refreshAccessToken", async (_, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/refresh-token");
    return data;
  } catch (err: any) {
    removeAccessToken();
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Token refresh failed");
  }
});

export const getUser = createAsyncThunk<{ user: User }, void, { rejectValue: RejectValue }>(
  "auth/getUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err: any) {
      removeAccessToken();
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: RejectValue }
>("auth/forgotPassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/password/forgot", payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to send reset email");
  }
});

export const resetPassword = createAsyncThunk<
  { message: string; accessToken?: string; user?: User },
  { token: string; password: string; confirmPassword: string },
  { rejectValue: RejectValue }
>("auth/resetPassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put(`/auth/password/reset/${payload.token}`, payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Password reset failed");
  }
});

export const updatePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string; confirmNewPassword: string },
  { rejectValue: RejectValue }
>("auth/updatePassword", async (payload, thunkAPI) => {
  try {
    const { data } = await api.put("/auth/password/update", payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update password");
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.get("/auth/logout");
  } finally {
    removeAccessToken();
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
      state.accessToken = null;
      state.forcePasswordChange = false;
      state.loading = false;
      state.error = null;
      state.success = null;
      removeAccessToken();
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
      let message = defaultMsg;
      if (action.payload && typeof action.payload === "string") message = action.payload;
      else if (action.payload?.message) message = action.payload.message;
      else if (action.error?.message) message = action.error.message;
      state.error = message;
    };

    // Register
    builder.addCase(register.pending, pendingHandler);
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(register.rejected, (state, action) =>
      rejectedHandler(state, action, "Registration failed")
    );

    // Verify OTP
    builder.addCase(verifyOTP.pending, pendingHandler);
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(verifyOTP.rejected, (state, action) =>
      rejectedHandler(state, action, "OTP verification failed")
    );

    // Login
    builder.addCase(login.pending, pendingHandler);
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      if (action.payload.accessToken) state.accessToken = saveAccessToken(action.payload.accessToken);
      state.user = action.payload.user || null;
      state.forcePasswordChange =
        action.payload.requiresPasswordChange || action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(login.rejected, (state, action) => rejectedHandler(state, action, "Login failed"));

    // Refresh Token
    builder.addCase(refreshAccessToken.fulfilled, (state, action) => {
      state.accessToken = saveAccessToken(action.payload.accessToken);
    });
    builder.addCase(refreshAccessToken.rejected, (state) => {
      state.accessToken = null;
      state.user = null;
      state.forcePasswordChange = false;
    });

    // Get User
    builder.addCase(getUser.pending, pendingHandler);
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      rejectedHandler(state, action, "Failed to fetch user");
      state.user = null;
      state.accessToken = null;
      state.forcePasswordChange = false;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, pendingHandler);
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
    });
    builder.addCase(forgotPassword.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to send reset email")
    );

    // Reset Password
    builder.addCase(resetPassword.pending, pendingHandler);
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      if (action.payload.accessToken) state.accessToken = saveAccessToken(action.payload.accessToken);
      if (action.payload.user) state.user = action.payload.user;
      state.forcePasswordChange = action.payload.user?.forcePasswordChange || false;
    });
    builder.addCase(resetPassword.rejected, (state, action) =>
      rejectedHandler(state, action, "Password reset failed")
    );

    // Update Password
    builder.addCase(updatePassword.pending, pendingHandler);
    builder.addCase(updatePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload.message;
      state.forcePasswordChange = false;
      if (state.user) state.user.forcePasswordChange = false;
    });
    builder.addCase(updatePassword.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to update password")
    );

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.forcePasswordChange = false;
      state.loading = false;
      state.error = null;
      state.success = null;
    });
  },
});

// ==========================
// Exports
// ==========================
export const { clearAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
