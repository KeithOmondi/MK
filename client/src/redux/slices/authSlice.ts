import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface Avatar {
  url: string;
  public_id: string;
}

// Example: src/types/User.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
    public_id?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}


interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  users: User[];
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
  users: [],
};

// ==========================
// Async Thunks
// ==========================

// Register
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

// Verify OTP
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

// Resend OTP
export const resendOTP = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: RejectValue }
>("auth/resendOTP", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/otp/resend", payload);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to resend OTP");
  }
});

// Login
export const login = createAsyncThunk<
  {
    message: string;
    accessToken?: string;
    user?: User;
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

// Refresh token
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

// Get current user
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

// Forgot password
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

// Reset password
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

// Update password
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

// Logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    removeAccessToken();
  }
});

// Fetch all users (Admin)
export const fetchAllUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  "auth/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/user/all");
      return data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// Update user by ID (Admin)
export const updateUserById = createAsyncThunk<
  User,
  { id: string; updates: Partial<User> },
  { rejectValue: RejectValue }
>("auth/updateUserById", async ({ id, updates }, thunkAPI) => {
  try {
    const { data } = await api.put(`/admin/users/${id}`, updates);
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update user");
  }
});

// Delete user (Admin)
export const deleteUserById = createAsyncThunk<string, string, { rejectValue: RejectValue }>(
  "auth/deleteUserById",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

// Register new admin
export const registerNewAdmin = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: RejectValue }
>("auth/registerNewAdmin", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/admin/register", payload);
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to register admin");
  }
});

// Fetch user profile
export const fetchUserProfile = createAsyncThunk<User>(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/profile");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update user profile (including avatar upload)
export const updateUserProfile = createAsyncThunk<User, Partial<User> | FormData>(
  "auth/updateUserProfile",
  async (updates, { rejectWithValue }) => {
    try {
      const config =
        updates instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const { data } = await api.put("/user/profile", updates, config);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
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
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
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
      if (typeof action.payload === "string") message = action.payload;
      else if (action.payload?.message) message = action.payload.message;
      else if (action.error?.message) message = action.error.message;
      state.error = message;
    };

    // Shared auth thunks
    [register, verifyOTP, resendOTP, login, getUser, forgotPassword, resetPassword, updatePassword].forEach((thunk) => {
      builder.addCase(thunk.pending, pendingHandler);
      builder.addCase(thunk.rejected, (state, action) => rejectedHandler(state, action, "Operation failed"));
    });

    // Auth success cases
    builder
      .addCase(register.fulfilled, (state, action: any) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(verifyOTP.fulfilled, (state, action: any) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(resendOTP.fulfilled, (state, action: any) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(login.fulfilled, (state, action: any) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.accessToken) state.accessToken = saveAccessToken(action.payload.accessToken);
        state.user = action.payload.user || null;
      })
      .addCase(getUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = saveAccessToken(action.payload.accessToken);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.loading = false;
      });

    // Admin User Management
    builder
      .addCase(fetchAllUsers.pending, pendingHandler)
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(updateUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users = state.users.map((u) => (u._id === action.payload._id ? action.payload : u));
        state.success = "User updated successfully";
      })
      .addCase(deleteUserById.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.success = "User deleted successfully";
      })
      .addCase(registerNewAdmin.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.push(action.payload);
        state.success = "New admin registered successfully";
      });

    // Profile
    builder
      .addCase(fetchUserProfile.pending, pendingHandler)
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = "Profile updated successfully";
      })
      .addCase(fetchUserProfile.rejected, (state, action) =>
        rejectedHandler(state, action, "Failed to fetch profile")
      )
      .addCase(updateUserProfile.rejected, (state, action) =>
        rejectedHandler(state, action, "Failed to update profile")
      );
  },
});

// ==========================
// Exports
// ==========================
export const { clearAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
