// src/redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
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
  deliveredOrders: Order[];
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
  deliveredOrders: [],
  loading: false,
  error: null,
  success: false,
};

// ==========================
// Thunks (CRUD)
// ==========================

// ✅ Create Order → Buyer
export const createOrder = createAsyncThunk<Order, Partial<Order>>(
  "orders/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/create", payload);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get All Orders → Role-based (Buyer)
export const fetchOrders = createAsyncThunk<Order[]>(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/get");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Single Order → Role-based (Buyer)
export const fetchOrderById = createAsyncThunk<Order, string>(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/get/${id}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Delivered Orders by Product → Buyer
export const fetchDeliveredOrdersByProduct = createAsyncThunk<Order[], string>(
  "orders/fetchDeliveredByProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/user-delivered?productId=${productId}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Supplier Orders → Supplier
export const fetchSupplierOrders = createAsyncThunk<Order[]>(
  "orders/fetchSupplier",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/get"); // Replace with supplier-specific endpoint if exists
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Get Admin Orders → Admin
export const fetchAdminOrders = createAsyncThunk<Order[]>(
  "orders/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/admin-get");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update Order Status → Admin
export const updateOrderStatus = createAsyncThunk<Order, { id: string; status: string }>(
  "orders/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/update/${id}/status`, { status });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Cancel Order → Buyer
export const cancelOrder = createAsyncThunk<Order, string>(
  "orders/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/cancel/${id}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Delete Order → Admin
export const deleteOrder = createAsyncThunk<string, string>(
  "orders/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Buyer requests a refund
export const requestRefund = createAsyncThunk<Order, string>(
  "orders/requestRefund",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/orders/request/${orderId}/refund`);
      return data.data;
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
    const pending = (state: OrderState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: OrderState, action: any) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    };

    const handleArrayFulfilled = (state: OrderState, action: PayloadAction<Order[]>) => {
      state.loading = false;
      state.orders = action.payload;
    };

    builder
      // Thunks handling
      .addCase(createOrder.pending, pending)
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.success = true;
      })
      .addCase(createOrder.rejected, rejected)

      .addCase(fetchOrders.pending, pending)
      .addCase(fetchOrders.fulfilled, handleArrayFulfilled)
      .addCase(fetchOrders.rejected, rejected)

      .addCase(fetchOrderById.pending, pending)
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, rejected)

      .addCase(fetchDeliveredOrdersByProduct.pending, pending)
      .addCase(fetchDeliveredOrdersByProduct.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.deliveredOrders = action.payload;
      })
      .addCase(fetchDeliveredOrdersByProduct.rejected, rejected)

      .addCase(fetchSupplierOrders.pending, pending)
      .addCase(fetchSupplierOrders.fulfilled, handleArrayFulfilled)
      .addCase(fetchSupplierOrders.rejected, rejected)

      .addCase(fetchAdminOrders.pending, pending)
      .addCase(fetchAdminOrders.fulfilled, handleArrayFulfilled)
      .addCase(fetchAdminOrders.rejected, rejected)

      .addCase(updateOrderStatus.pending, pending)
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(updateOrderStatus.rejected, rejected)

      .addCase(cancelOrder.pending, pending)
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, rejected)

      .addCase(deleteOrder.pending, pending)
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.orders = state.orders.filter(o => o._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, rejected);
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectDeliveredOrders = (state: RootState) => state.orders.deliveredOrders;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectOrderById = (state: RootState, id: string) =>
  state.orders.orders.find(o => o._id === id) || null;
