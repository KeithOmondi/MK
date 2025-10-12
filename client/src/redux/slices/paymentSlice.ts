import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../store";

/* ==========================
   Types
========================== */
export interface PendingPayment {
  orderId: string;
  phoneNumber: string;
  status: "pending" | "paid" | "failed";
  message?: string;
}

export interface PaymentMethod {
  _id: string;
  type: string; // e.g. "Card", "M-Pesa", "PayPal"
  details: string; // e.g. "**** **** **** 1234"
}

export interface PaymentStatusResponse {
  success: boolean;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  status: string;
  transactionId?: string;
  paidAt?: string;
  totalAmount?: number;
}

export interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  pendingPayments: PendingPayment[];
  lastStatus?: PaymentStatusResponse;
  methods: PaymentMethod[];
}

/* ==========================
   Initial State
========================== */
const initialState: PaymentState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  pendingPayments: [],
  lastStatus: undefined,
  methods: [],
};

/* ==========================
   Thunks
========================== */

// Initiate M-Pesa payment
export const initiateMpesaPayment = createAsyncThunk<
  { message: string; orderId: string; phoneNumber: string },
  { orderId: string; phoneNumber: string },
  { rejectValue: string }
>(
  "payment/initiateMpesa",
  async ({ orderId, phoneNumber }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/payments/mpesa/pay", {
        orderId,
        phoneNumber,
      });
      return {
        message: data.message || "Complete your order via M-Pesa",
        orderId,
        phoneNumber,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate payment"
      );
    }
  }
);

// Fetch payment status → Buyer polls after STK push
export const fetchPaymentStatus = createAsyncThunk<
  PaymentStatusResponse,
  { orderId: string },
  { rejectValue: string }
>("payment/fetchStatus", async ({ orderId }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/payments/status/${orderId}`);
    return {
      success: data.success,
      paymentStatus: data.paymentStatus,
      status: data.status,
      transactionId: data.transactionId,
      paidAt: data.paidAt,
      totalAmount: data.totalAmount,
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch status"
    );
  }
});

// Admin releases escrow for orders
export const adminReleaseEscrow = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: string }
>("payment/adminReleaseEscrow", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/payments/admin/release");
    return { success: data.success, message: data.message };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to release escrow"
    );
  }
});

// Fetch saved payment methods
export const fetchPayments = createAsyncThunk<
  PaymentMethod[],
  void,
  { rejectValue: string }
>("payments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/payments");
    return data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch payments"
    );
  }
});

// Add a payment method
export const addPayment = createAsyncThunk<
  PaymentMethod,
  { type: string; details: string },
  { rejectValue: string }
>("payments/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/payments", payload);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to add payment"
    );
  }
});

// Delete a payment method
export const deletePayment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("payments/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/payments/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete payment"
    );
  }
});

/* ==========================
   Slice
========================== */
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: () => initialState,
    markPaymentPaid: (state, action: PayloadAction<{ orderId: string }>) => {
      const payment = state.pendingPayments.find(
        (p) => p.orderId === action.payload.orderId
      );
      if (payment) payment.status = "paid";
    },
    markPaymentFailed: (
      state,
      action: PayloadAction<{ orderId: string; reason: string }>
    ) => {
      const payment = state.pendingPayments.find(
        (p) => p.orderId === action.payload.orderId
      );
      if (payment) {
        payment.status = "failed";
        payment.message = action.payload.reason;
      }
    },
  },
  extraReducers: (builder) => {
    const onPending = (state: PaymentState) => {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.message = null;
    };
    const onRejected = (state: PaymentState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
      state.success = false;
    };

    /* ==========================
       M-Pesa payments
    ========================== */
    builder
      .addCase(initiateMpesaPayment.pending, onPending)
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        const existing = state.pendingPayments.find(
          (p) => p.orderId === action.payload.orderId
        );
        if (existing) {
          existing.status = "pending";
          existing.message = action.payload.message;
        } else {
          state.pendingPayments.push({
            orderId: action.payload.orderId,
            phoneNumber: action.payload.phoneNumber,
            status: "pending",
            message: action.payload.message,
          });
        }
      })
      .addCase(initiateMpesaPayment.rejected, onRejected)

      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.lastStatus = action.payload;
        const payment = state.pendingPayments.find(
          (p) => p.orderId === action.meta.arg.orderId
        );
        if (payment) {
          if (action.payload.paymentStatus === "paid") {
            payment.status = "paid";
            payment.message = "Order created successfully";
            state.message = "Order created successfully";
            state.success = true;
          } else if (action.payload.paymentStatus === "failed") {
            payment.status = "failed";
            payment.message = "Payment failed. Please try again.";
            state.message = "Payment failed. Please try again.";
            state.success = false;
          } else {
            payment.status = "pending";
          }
        }
      })
      .addCase(fetchPaymentStatus.rejected, onRejected)

      .addCase(adminReleaseEscrow.pending, onPending)
      .addCase(adminReleaseEscrow.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(adminReleaseEscrow.rejected, onRejected);

    /* ==========================
       Saved payment methods
    ========================== */
    builder
      .addCase(fetchPayments.pending, onPending)
      .addCase(
        fetchPayments.fulfilled,
        (state, action: PayloadAction<PaymentMethod[]>) => {
          state.loading = false;
          state.methods = action.payload;
        }
      )
      .addCase(fetchPayments.rejected, onRejected)
      .addCase(
        addPayment.fulfilled,
        (state, action: PayloadAction<PaymentMethod>) => {
          state.methods.unshift(action.payload);
        }
      )
      .addCase(
        deletePayment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.methods = state.methods.filter((p) => p._id !== action.payload);
        }
      );
  },
});

/* ==========================
   Actions & Reducer
========================= */
export const { resetPaymentState, markPaymentPaid, markPaymentFailed } =
  paymentSlice.actions;
export default paymentSlice.reducer;

/* ==========================
   Selectors
========================= */
export const selectPaymentLoading = (state: RootState) => state.payment.loading;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectPaymentSuccess = (state: RootState) => state.payment.success;
export const selectPaymentMessage = (state: RootState) => state.payment.message;
export const selectPendingPayments = (state: RootState) =>
  state.payment.pendingPayments;
export const selectLastPaymentStatus = (state: RootState) =>
  state.payment.lastStatus;
export const selectPaymentMethods = (state: RootState) => state.payment.methods;

// Memoized selector by orderId
export const makeSelectPaymentByOrderId = (orderId: string) =>
  createSelector(
    (state: RootState) => state.payment.pendingPayments,
    (pendingPayments) => pendingPayments.find((p) => p.orderId === orderId)
  );
