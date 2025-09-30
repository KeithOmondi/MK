// src/redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

/* ==========================
   Types
========================== */
export interface OrderItem {
  productId: string;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  state?: string;
  country?: string;
  phone: string;
}

export interface Coupon {
  code: string;
  percentage: number;
}

export interface Order {
  _id: string;
  buyer: { _id?: string; name?: string; email?: string } | string;
  items: OrderItem[];
  supplier: string;
  totalAmount: number;
  shippingCost: number;
  coupon?: Coupon | null;
  deliveryDetails: DeliveryDetails;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  orders: Order[];
  order: Order | null;
  deliveredOrders: Order[]; // <-- new state for delivered orders
  loading: boolean;
  error: string | null;
  success: boolean;
}

/* ==========================
   Initial State
========================== */
const initialState: OrderState = {
  orders: [],
  order: null,
  deliveredOrders: [],
  loading: false,
  error: null,
  success: false,
};

/* ==========================
   Thunks
========================== */

// Fetch delivered orders by product for the current user
export const fetchDeliveredOrdersByProduct = createAsyncThunk(
  "orders/fetchDeliveredByProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/user-delivered?productId=${productId}`);
      return data.data as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/create",
  async (
    {
      items,
      deliveryDetails,
      paymentMethod,
      totalAmount,
      shippingCost,
      coupon,
    }: {
      items: { productId: string; quantity: number; price: number }[];
      deliveryDetails: DeliveryDetails;
      paymentMethod: string;
      totalAmount: number;
      shippingCost: number;
      coupon?: Coupon | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/orders/create", {
        items,
        deliveryDetails,
        paymentMethod,
        totalAmount,
        shippingCost,
        coupon,
      });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Generic fetch (role handled by backend)
export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/get");
      return data.data as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Admin-only fetch
export const fetchAdminOrders = createAsyncThunk(
  "orders/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/admin-get");
      return data.data as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Supplier-only fetch
export const fetchSupplierOrders = createAsyncThunk(
  "orders/fetchSupplier",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/get");
      return data.data as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch single
export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/get/${id}`);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/update/${id}/status`, { status });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Request refund (Buyer)
export const requestRefund = createAsyncThunk(
  "orders/requestRefund",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/orders/request/${id}/refund`);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Process refund (Admin)
export const processRefund = createAsyncThunk(
  "orders/processRefund",
  async ({ id, action }: { id: string; action: "Approved" | "Rejected" }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/process/${id}/refund`, { action });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete order (Admin)
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

// Cancel order
export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/cancel/${id}`);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


/* ==========================
   Slice
========================== */
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(fetchDeliveredOrdersByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredOrdersByProduct.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.deliveredOrders = action.payload;
      })
      .addCase(fetchDeliveredOrdersByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ------------------------
    // Keep all your existing extraReducers (createOrder, fetchOrders, fetchAdminOrders, etc.)
    // ------------------------
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

/* ==========================
   Selectors
========================== */
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectDeliveredOrders = (state: RootState) => state.orders.deliveredOrders; // <-- new selector
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectOrderById = (state: RootState, id: string) =>
  state.orders.orders.find((o) => o._id === id) || null;
