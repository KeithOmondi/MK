// src/redux/slices/analyticsSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";
import api from "../../api/axios";



// =======================
// Types
// =======================
interface OrdersByStatus {
  _id: string;
  count: number;
}

interface TopProduct {
  _id: string;
  name: string;
  totalSold?: number;
  revenue?: number;
  totalOrdered?: number;
}

export interface AnalyticsState {
  loading: boolean;
  error: string | null;

  admin: {
    totalRevenue: number;
    totalOrders: number;
    ordersByStatus: OrdersByStatus[];
    totalUsers: number;
    totalSuppliers: number;
    topProducts: TopProduct[];
  };

  supplier: {
    totalRevenue: number;
    totalOrders: number;
    ordersByStatus: OrdersByStatus[];
    topProducts: TopProduct[];
  };

  customer: {
    totalSpent: number;
    totalOrders: number;
    ordersByStatus: OrdersByStatus[];
    favoriteProducts: TopProduct[];
  };
}

// =======================
// Initial State
// =======================
const initialState: AnalyticsState = {
  loading: false,
  error: null,

  admin: {
    totalRevenue: 0,
    totalOrders: 0,
    ordersByStatus: [],
    totalUsers: 0,
    totalSuppliers: 0,
    topProducts: [],
  },

  supplier: {
    totalRevenue: 0,
    totalOrders: 0,
    ordersByStatus: [],
    topProducts: [],
  },

  customer: {
    totalSpent: 0,
    totalOrders: 0,
    ordersByStatus: [],
    favoriteProducts: [],
  },
};

// =======================
// Async Thunks
// =======================
export const fetchAdminAnalytics = createAsyncThunk(
  "analytics/fetchAdminAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/analytics/admin");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSupplierAnalytics = createAsyncThunk(
  "analytics/fetchSupplierAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/analytics/supplier");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCustomerAnalytics = createAsyncThunk(
  "analytics/fetchCustomerAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/analytics/customer");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// =======================
// Slice
// =======================
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    resetAnalytics: () => initialState,
  },
  extraReducers: (builder) => {
    // Pending
    builder.addCase(fetchAdminAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSupplierAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerAnalytics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // Fulfilled
    builder.addCase(fetchAdminAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.admin = action.payload;
    });
    builder.addCase(fetchSupplierAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.supplier = action.payload;
    });
    builder.addCase(fetchCustomerAnalytics.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.customer = action.payload;
    });

    // Rejected
    builder.addCase(fetchAdminAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchSupplierAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchCustomerAnalytics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// =======================
// Selectors
// =======================
export const selectAnalytics = (state: RootState) => state.analytics;

// =======================
// Exports
// =======================
export const { resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
