// src/store/slices/recentlyViewedSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios"; // <-- adjust if your axios instance is in a different path

// ==========================
// Types
// ==========================
export interface RecentlyViewedItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: RecentlyViewedState = {
  items: [],
  loading: false,
  error: null,
};

// ==========================
// Thunks
// ==========================

// Fetch recently viewed products
export const fetchRecentlyViewed = createAsyncThunk<
  RecentlyViewedItem[],
  void,
  { rejectValue: string }
>("recentlyViewed/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/recently-viewed");
    return data; // expects backend to return an array of products
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch recently viewed");
  }
});

// Add a product to recently viewed
export const addRecentlyViewed = createAsyncThunk<
  RecentlyViewedItem,
  string,
  { rejectValue: string }
>("recentlyViewed/add", async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/recently-viewed/${productId}`);
    return data; // expects backend to return the added product
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to add to recently viewed");
  }
});

// ==========================
// Slice
// ==========================
const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRecentlyViewed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentlyViewed.fulfilled, (state, action: PayloadAction<RecentlyViewedItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRecentlyViewed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // Add
      .addCase(addRecentlyViewed.fulfilled, (state, action: PayloadAction<RecentlyViewedItem>) => {
        // Avoid duplicates
        const exists = state.items.find((p) => p._id === action.payload._id);
        if (!exists) {
          state.items.unshift(action.payload);
        }
        // Optional: limit to last 10
        if (state.items.length > 10) {
          state.items.pop();
        }
      })
      .addCase(addRecentlyViewed.rejected, (state, action) => {
        state.error = action.payload || "Something went wrong";
      });
  },
});

// ==========================
// Exports
// ==========================
export const { clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
