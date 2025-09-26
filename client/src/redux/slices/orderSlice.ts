// src/redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  phone: string;
}

export interface Order {
  _id: string;
  buyer: string;
  items: OrderItem[];
  supplier: string;
  totalAmount: number;
  deliveryDetails: DeliveryDetails;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// ==========================
// Initial State
// ==========================
const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
};

// ==========================
// Thunks
// ==========================
export const createOrder = createAsyncThunk(
  "orders/create",
  async (
    {
      items,
      supplier,
      deliveryDetails,
      paymentMethod,
    }: {
      items: { product: string; quantity: number }[];
      supplier: string;
      deliveryDetails: DeliveryDetails;
      paymentMethod: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/orders/create", {
        items,
        supplier,
        deliveryDetails,
        paymentMethod,
      });
      return data.data; // unwrap
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/get");
      return data.data; // unwrap array
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/get/${id}`);
      return data.data; // unwrap
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/orders/update/${id}/status`, { status });
      return data.data; // unwrap
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================
// Slice
// ==========================
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch all
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update status
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.order = action.payload;
        state.orders = state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })

      // Delete
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.orders = state.orders.filter((o) => o._id !== action.payload);
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
