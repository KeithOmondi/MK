// src/redux/slices/orderSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
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
  escrowStatus?: "Held" | "Released" | "Refunded";
  _id: string; // ✅ Add this line
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

export interface Refund {
  requested?: boolean;
  status?: "Pending" | "Approved" | "Rejected";
  requestedAt?: string;
  processedAt?: string;
}

export interface Supplier {
  _id: string;
  shopName: string;
}

export interface Order {
  _id: string;
  buyer: { _id?: string; name?: string; email?: string } | string;
  items: OrderItem[];
  supplier: string | Supplier; // can be just an id OR a populated supplier
  totalAmount: number;
  shippingCost: number;
  coupon?: Coupon | null;
  deliveryDetails: DeliveryDetails;
  paymentMethod: string;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  status: string;
  refund?: Refund;
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
// Thunks
// ==========================
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

export const deleteOrder = createAsyncThunk<Order, string>(
  "orders/delete",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/orders/${orderId}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

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

export const updateEscrowStatus = createAsyncThunk<
  Order,
  { orderId: string; itemId: string; status: "Released" | "Refunded" }
>(
  "orders/updateEscrow",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/orders/${orderId}/items/${itemId}/escrow`,
        { status }
      );
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const cancelOrder = createAsyncThunk<Order, string>(
  "orders/cancel",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/cancel/${orderId}`);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDeliveredOrders = createAsyncThunk<Order[]>(
  "orders/fetchDelivered",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/delivered");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSupplierOrders = createAsyncThunk<Order[], string | undefined>(
  "orders/fetchSupplierOrders",
  async (supplierId, { rejectWithValue }) => {
    try {
      const url = supplierId ? `/orders/supplier/${supplierId}` : `/orders/supplier`;
      const { data } = await api.get(url);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Add this thunk after the others in your existing orderSlice.ts

// Fetch all orders for admin dashboard
export const fetchAdminOrders = createAsyncThunk<Order[]>(
  "orders/fetchAdminOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/admin"); // your backend endpoint for admin orders
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchOrderPaymentStatus = createAsyncThunk<
  { orderId: string; paymentStatus: "pending" | "paid" | "refunded" | "failed" },
  string
>(
  "orders/fetchPaymentStatus",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/payments/status/${orderId}`);
      // Validate the value to match the union type
      const status = data.paymentStatus as "pending" | "paid" | "refunded" | "failed";
      return { orderId, paymentStatus: status };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);




// Update order status (admin)
export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; status: string }
>(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/update/${orderId}/status`, { status });
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
    const handleArrayFulfilled = (
      state: OrderState,
      action: PayloadAction<Order[]>
    ) => {
      state.loading = false;
      state.orders = action.payload;
    };

    builder
      // Create Order
      .addCase(createOrder.pending, pending)
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.success = true;
      })
      .addCase(createOrder.rejected, rejected)

      // Admin Orders
      .addCase(fetchAdminOrders.pending, pending)
      .addCase(
        fetchAdminOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(fetchAdminOrders.rejected, rejected)

      // Update Order Status
  .addCase(updateOrderStatus.pending, (state) => { state.loading = true; state.error = null; })
  .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
    state.loading = false;
    const idx = state.orders.findIndex(o => o._id === action.payload._id);
    if (idx !== -1) state.orders[idx] = action.payload;
    if (state.order?._id === action.payload._id) state.order = action.payload;
  })
  .addCase(updateOrderStatus.rejected, (state, action: any) => {
    state.loading = false;
    state.error = action.payload || "Something went wrong";
  })

  // Payment Status
.addCase(fetchOrderPaymentStatus.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchOrderPaymentStatus.fulfilled, (state, action) => {
  state.loading = false;
  const { orderId, paymentStatus } = action.payload;
  const idx = state.orders.findIndex((o) => o._id === orderId);
  if (idx !== -1) state.orders[idx].paymentStatus = paymentStatus;
  if (state.order?._id === orderId) {
    state.order.paymentStatus = paymentStatus;
  }
})
.addCase(fetchOrderPaymentStatus.rejected, (state, action: any) => {
  state.loading = false;
  state.error = action.payload || "Failed to fetch payment status";
})


      // Fetch All Orders
      .addCase(fetchOrders.pending, pending)
      .addCase(fetchOrders.fulfilled, handleArrayFulfilled)
      .addCase(fetchOrders.rejected, rejected)

      // Fetch Single Order
      .addCase(fetchOrderById.pending, pending)
      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.loading = false;
          state.order = action.payload;
        }
      )
      .addCase(fetchOrderById.rejected, rejected)

      // Delete Order
      .addCase(deleteOrder.pending, pending)
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders = state.orders.filter((o) => o._id !== action.payload._id);
      })
      .addCase(deleteOrder.rejected, rejected)

      // Refund
      .addCase(requestRefund.pending, pending)
      .addCase(
        requestRefund.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.loading = false;
          const idx = state.orders.findIndex(
            (o) => o._id === action.payload._id
          );
          if (idx !== -1) state.orders[idx] = action.payload;
          if (state.order?._id === action.payload._id)
            state.order = action.payload;
        }
      )
      .addCase(requestRefund.rejected, rejected)

      // Escrow
      .addCase(updateEscrowStatus.pending, pending)
      .addCase(
        updateEscrowStatus.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.loading = false;
          const idx = state.orders.findIndex(
            (o) => o._id === action.payload._id
          );
          if (idx !== -1) state.orders[idx] = action.payload;
          if (state.order?._id === action.payload._id)
            state.order = action.payload;
        }
      )
      .addCase(updateEscrowStatus.rejected, rejected)

      // Cancel
      .addCase(cancelOrder.pending, pending)
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.order?._id === action.payload._id)
          state.order = action.payload;
      })
      .addCase(cancelOrder.rejected, rejected)

      // Delivered Orders
      .addCase(fetchDeliveredOrders.pending, pending)
      .addCase(
        fetchDeliveredOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.deliveredOrders = action.payload;
        }
      )
      .addCase(fetchDeliveredOrders.rejected, rejected)

      // Supplier Orders
      .addCase(fetchSupplierOrders.pending, pending)
      .addCase(
        fetchSupplierOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(fetchSupplierOrders.rejected, rejected);
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectDeliveredOrders = (state: RootState) =>
  state.orders.deliveredOrders;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectOrderById = (state: RootState, id: string) =>
  state.orders.orders.find((o) => o._id === id) || null;
