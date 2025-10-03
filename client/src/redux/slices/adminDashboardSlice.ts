import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

interface DashboardState {
  stats: any | null;
  suppliers: any[];
  products: any[];
  reviews: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  suppliers: [],
  products: [],
  reviews: [],
  loading: false,
  error: null,
};

// =====================
// Async Thunks
// =====================
export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/dashboard/stats");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLatestSuppliers = createAsyncThunk(
  "admin/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/dashboard/suppliers");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  "admin/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/dashboard/products");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLatestReviews = createAsyncThunk(
  "admin/fetchReviews",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/dashboard/reviews");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// =====================
// Slice
// =====================
const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    resetDashboard: (state) => {
      state.stats = null;
      state.suppliers = [];
      state.products = [];
      state.reviews = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLatestSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(fetchLatestReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      });
  },
});

export const { resetDashboard } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
