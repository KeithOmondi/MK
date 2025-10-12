import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../store";
import api from "../../api/axios";

/* ============================================================
   TYPES
============================================================ */
export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface OrderItem {
  productId: string;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
  weight?: number;
  dimensions?: Dimensions;
  escrowStatus?: "Held" | "Released" | "Refunded";
  refundStatus?: "Pending" | "Approved" | "Rejected";
  _id?: string;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  state?: string;
  country?: string;
  phone: string;
  deliveryProvider?: string;
  distanceKm?: number;
}

export interface Coupon {
  code: string;
  percentage: number;
}

export interface Supplier {
  _id: string;
  shopName: string;
  phone?: string;
}

export interface Refund {
  requested?: boolean;
  status?: "Pending" | "Approved" | "Rejected";
  requestedAt?: string;
  processedAt?: string;
}

export interface Order {
  _id: string;
  buyer: { _id?: string; name?: string; email?: string } | string;
  supplier: string | Supplier;
  items: OrderItem[];
  totalAmount: number;
  totalCommission?: number;
  totalEscrowHeld?: number;
  shippingCost: number;
  coupon?: Coupon | null;
  deliveryDetails: DeliveryDetails;
  paymentMethod: string;
  paymentStatus?: "held" | "pending" | "paid" | "refunded" | "failed";
  paymentReleaseStatus?: "Scheduled" | "Released" | "OnHold";
  status: string;

  deliveryStatus?:
    | "Pending"
    | "Processing"
    | "In Transit"
    | "Delivered"
    | "Cancelled"
    | "Delayed";
  shippingMethod?: "standard" | "express" | "pickup";
  shippingDistance?: number;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  deliveryDuration?: number;

  refund?: Refund;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
}

export interface ShippingEstimate {
  shippingCost: number;
  estimatedDays: number;
  estimatedDeliveryDate: string;
}

export interface OrderState {
  orders: Order[];
  order: Order | null;
  deliveredOrders: Order[];
  shippingEstimate: ShippingEstimate | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/* ============================================================
   INITIAL STATE
============================================================ */
const initialState: OrderState = {
  orders: [],
  order: null,
  deliveredOrders: [],
  shippingEstimate: null,
  loading: false,
  error: null,
  success: false,
};

/* ============================================================
   ASYNC THUNKS
============================================================ */

// CREATE ORDER
export const createOrder = createAsyncThunk<Order, Partial<Order>>(
  "orders/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/create", payload);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// FETCH ALL ORDERS
export const fetchOrders = createAsyncThunk<Order[]>(
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

// FETCH ORDER BY ID
export const fetchOrderById = createAsyncThunk<Order, string>(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/get/${id}`);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// FETCH SUPPLIER ORDERS (add this to your orderSlice.ts)
export const fetchSupplierOrders = createAsyncThunk<Order[]>(
  "orders/fetchSupplierOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/orders/supplier");
      // Support different backend shapes: { success, data } or { orders }
      const orders = res.data?.data ?? res.data?.orders ?? [];
      return orders as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// DELETE ORDER (Admin only)
export const deleteOrder = createAsyncThunk<
  { message: string; orderId: string },
  string
>(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/orders/${orderId}`);
      return { message: data?.message || "Order deleted successfully", orderId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAdminOrders = createAsyncThunk<Order[]>(
  "orders/fetchAdminOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/admin");
      return data.orders;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// CANCEL ORDER
export const cancelOrder = createAsyncThunk<Order, string>(
  "orders/cancel",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/cancel/${orderId}`);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// REQUEST REFUND
export const requestRefund = createAsyncThunk<Order, { orderId: string; reason: string }>(
  "orders/requestRefund",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/orders/request/${orderId}/refund`, { reason });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// UPDATE REFUND STATUS
export const updateRefundStatus = createAsyncThunk<
  Order,
  { orderId: string; itemId: string; status: "Approved" | "Rejected" }
>(
  "orders/updateRefundStatus",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/refund/${itemId}`, { status });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPDATE ORDER STATUS
export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; status: string }
>(
  "orders/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/update/${orderId}/status`, { status });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// UPDATE ESCROW STATUS
export const updateEscrowStatus = createAsyncThunk<
  Order,
  { orderId: string; itemId: string; status: "Released" | "Refunded" }
>(
  "orders/updateEscrowStatus",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/items/${itemId}/escrow`, { status });
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// FETCH PAYMENT STATUS
export const fetchOrderPaymentStatus = createAsyncThunk<
  { orderId: string; paymentStatus: Order["paymentStatus"]; transactionId?: string },
  { orderId: string }
>(
  "orders/fetchPaymentStatus",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/payments/status/${orderId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// FETCH SHIPPING ESTIMATE
export const fetchShippingEstimate = createAsyncThunk<
  ShippingEstimate,
  { items: OrderItem[]; deliveryAddress: string; shippingMethod: "standard" | "express" | "pickup" }
>(
  "orders/fetchShippingEstimate",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/estimates", payload);
      return data.data as ShippingEstimate;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ============================================================
   SLICE
============================================================ */
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
    resetShippingEstimate: (state) => {
      state.shippingEstimate = null;
    },
  },
  extraReducers: (builder) => {
    const onPending = (state: OrderState) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    };
    const onRejected = (state: OrderState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
      state.success = false;
    };

    const updateOrder = (state: OrderState, updatedOrder: Order) => {
      const idx = state.orders.findIndex((o) => o._id === updatedOrder._id);
      if (idx !== -1) state.orders[idx] = updatedOrder;
      if (state.order?._id === updatedOrder._id) state.order = updatedOrder;

      if (updatedOrder.deliveryStatus === "Delivered") {
        const exists = state.deliveredOrders.find((o) => o._id === updatedOrder._id);
        if (!exists) state.deliveredOrders.push(updatedOrder);
      }
    };

    builder
      // CREATE ORDER
      .addCase(createOrder.pending, onPending)
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.success = true;
      })
      .addCase(createOrder.rejected, onRejected)

      // FETCH ORDERS
      .addCase(fetchOrders.pending, onPending)
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.deliveredOrders = action.payload.filter(
          (o) => o.deliveryStatus === "Delivered"
        );
      })
      .addCase(fetchOrders.rejected, onRejected)

      // FETCH ORDER BY ID
      .addCase(fetchOrderById.pending, onPending)
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, onRejected)

      // CANCEL ORDER
      .addCase(cancelOrder.pending, onPending)
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        updateOrder(state, action.payload);
      })
      .addCase(cancelOrder.rejected, onRejected)

      // REFUND REQUEST
      .addCase(requestRefund.pending, onPending)
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.loading = false;
        updateOrder(state, action.payload);
      })
      .addCase(requestRefund.rejected, onRejected)

      // REFUND STATUS UPDATE
      .addCase(updateRefundStatus.pending, onPending)
      .addCase(updateRefundStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateOrder(state, action.payload);
      })
      .addCase(updateRefundStatus.rejected, onRejected)

      // ORDER STATUS UPDATE
      .addCase(updateOrderStatus.pending, onPending)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateOrder(state, action.payload);
      })
      .addCase(updateOrderStatus.rejected, onRejected)

      // ESCROW STATUS
      .addCase(updateEscrowStatus.pending, onPending)
      .addCase(updateEscrowStatus.fulfilled, (state, action) => {
        state.loading = false;
        updateOrder(state, action.payload);
      })
      .addCase(updateEscrowStatus.rejected, onRejected)

      // PAYMENT STATUS
      .addCase(fetchOrderPaymentStatus.pending, onPending)
      .addCase(fetchOrderPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, paymentStatus, transactionId } = action.payload;
        const idx = state.orders.findIndex((o) => o._id === orderId);
        if (idx !== -1) {
          state.orders[idx].paymentStatus = paymentStatus;
          if (transactionId) state.orders[idx].transactionId = transactionId;
        }
        if (state.order && state.order._id === orderId) {
          state.order.paymentStatus = paymentStatus;
          if (transactionId) state.order.transactionId = transactionId;
        }
      })
      .addCase(fetchOrderPaymentStatus.rejected, onRejected)

      // SHIPPING ESTIMATE
      .addCase(fetchShippingEstimate.pending, onPending)
      .addCase(fetchShippingEstimate.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingEstimate = action.payload;
        state.success = true;
      })
      .addCase(fetchShippingEstimate.rejected, onRejected);
  },
});

/* ============================================================
   EXPORTS
============================================================ */
export const { resetOrderState, clearError, resetShippingEstimate } = orderSlice.actions;
export default orderSlice.reducer;

/* ============================================================
   SELECTORS
============================================================ */
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectDeliveredOrders = (state: RootState) => state.orders.deliveredOrders;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectShippingEstimate = (state: RootState) =>
  state.orders.shippingEstimate;

export const selectOrderById = (state: RootState, id: string) =>
  state.orders.orders.find((o) => o._id === id) || null;
