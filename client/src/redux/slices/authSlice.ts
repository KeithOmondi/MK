import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Admin" | "Supplier" | "User";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  users: User[]; // Admin all users
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

// ----- Auth Thunks -----
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
    await api.post("/auth/logout");
  } finally {
    removeAccessToken();
  }
});

export const fetchAllUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  "auth/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/user/all");
      return data.data; // <-- users are inside `data`
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);


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

// Fetch User Profile
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

// Update User Profile
export const updateUserProfile = createAsyncThunk<User, Partial<User>>(
  "auth/updateUserProfile",
  async (updates, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/user/profile", updates);
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
      if (action.payload && typeof action.payload === "string") message = action.payload;
      else if (action.payload?.message) message = action.payload.message;
      else if (action.error?.message) message = action.error.message;
      state.error = message;
    };

    // --------------------------
    // Auth Cases
    // --------------------------
    [register, verifyOTP, resendOTP, login, getUser, forgotPassword, resetPassword, updatePassword].forEach((thunk) => {
      builder.addCase(thunk.pending, pendingHandler);
      builder.addCase(thunk.rejected, (state, action) =>
        rejectedHandler(state, action, "Operation failed")
      );
    });

    builder.addCase(register.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    builder.addCase(verifyOTP.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    builder.addCase(resendOTP.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    builder.addCase(login.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
      if (action.payload.accessToken) state.accessToken = saveAccessToken(action.payload.accessToken);
      state.user = action.payload.user || null;
    });

    builder.addCase(getUser.fulfilled, (state, action: any) => {
      state.loading = false;
      state.user = action.payload.user;
    });

    builder.addCase(forgotPassword.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    builder.addCase(resetPassword.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
      if (action.payload.accessToken) state.accessToken = saveAccessToken(action.payload.accessToken);
      if (action.payload.user) state.user = action.payload.user;
    });

    builder.addCase(updatePassword.fulfilled, (state, action: any) => {
      state.loading = false;
      state.success = action.payload.message;
    });

    builder.addCase(refreshAccessToken.fulfilled, (state, action) => {
      state.accessToken = saveAccessToken(action.payload.accessToken);
    });

    builder.addCase(refreshAccessToken.rejected, (state) => {
      state.accessToken = null;
      state.user = null;
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
      state.success = null;
    });

    // --------------------------
    // Admin Users Cases
    // --------------------------
    builder.addCase(fetchAllUsers.pending, pendingHandler);
    builder.addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchAllUsers.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to fetch users")
    );

    builder.addCase(updateUserById.pending, pendingHandler);
    builder.addCase(updateUserById.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.users = state.users.map((u) => (u._id === action.payload._id ? action.payload : u));
      state.success = "User updated successfully";
    });
    builder.addCase(updateUserById.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to update user")
    );

    builder.addCase(deleteUserById.pending, pendingHandler);
    builder.addCase(deleteUserById.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u._id !== action.payload);
      state.success = "User deleted successfully";
    });
    builder.addCase(deleteUserById.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to delete user")
    );

    builder.addCase(registerNewAdmin.pending, pendingHandler);
    builder.addCase(registerNewAdmin.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.users.push(action.payload);
      state.success = "New admin registered successfully";
    });
    builder.addCase(registerNewAdmin.rejected, (state, action) =>
      rejectedHandler(state, action, "Failed to register admin")
    );

    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = "Profile updated successfully";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ==========================
// Exports
// ==========================
export const { clearAuthState, logout } = authSlice.actions;
export default authSlice.reducer;
