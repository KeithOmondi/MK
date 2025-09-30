// src/store/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";

/* ==========================
   Types
   ========================== */
interface PendingPayment {
  orderId: string;
  phoneNumber: string;
  status: "pending" | "paid" | "failed";
  message?: string;
}

interface PaymentStatusResponse {
  success: boolean;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  status: string; // backend's order.status
  transactionId?: string;
  paidAt?: string;
  totalAmount?: number;
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  pendingPayments: PendingPayment[];
  lastStatus?: PaymentStatusResponse;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  pendingPayments: [],
  lastStatus: undefined,
};

/* ==========================
   Async Thunks
   ========================== */
// Initiate M-Pesa payment
export const initiateMpesaPayment = createAsyncThunk<
  { message: string; orderId: string; phoneNumber: string },
  { orderId: string; phoneNumber: string },
  { rejectValue: string }
>("payment/initiateMpesa", async ({ orderId, phoneNumber }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      "http://localhost:8000/api/v1/payments/mpesa/pay",
      { orderId, phoneNumber },
      { withCredentials: true }
    );

    return {
      message: data.message || "Please complete your order by entering your M-Pesa PIN",
      orderId,
      phoneNumber,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to initiate payment");
  }
});

// Fetch payment status (polling)
export const fetchPaymentStatus = createAsyncThunk<
  PaymentStatusResponse,
  { orderId: string },
  { rejectValue: string }
>("payment/fetchStatus", async ({ orderId }, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(
      `http://localhost:8000/api/v1/payments/status/${orderId}`,
      { withCredentials: true }
    );
    return {
      success: data.success,
      paymentStatus: data.paymentStatus,
      status: data.status,
      transactionId: data.transactionId,
      paidAt: data.paidAt,
      totalAmount: data.totalAmount,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch status");
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
      const payment = state.pendingPayments.find((p) => p.orderId === action.payload.orderId);
      if (payment) payment.status = "paid";
    },
    markPaymentFailed: (state, action: PayloadAction<{ orderId: string; reason: string }>) => {
      const payment = state.pendingPayments.find((p) => p.orderId === action.payload.orderId);
      if (payment) {
        payment.status = "failed";
        payment.message = action.payload.reason;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate STK Push
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        const existing = state.pendingPayments.find((p) => p.orderId === action.payload.orderId);
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
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // Poll payment status
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
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { resetPaymentState, markPaymentPaid, markPaymentFailed } = paymentSlice.actions;
export default paymentSlice.reducer;

/* ==========================
   Selectors
   ========================== */
export const selectPaymentLoading = (state: RootState) => state.payment.loading;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectPaymentSuccess = (state: RootState) => state.payment.success;
export const selectPaymentMessage = (state: RootState) => state.payment.message;
export const selectPendingPayments = (state: RootState) => state.payment.pendingPayments;
export const selectLastPaymentStatus = (state: RootState) => state.payment.lastStatus;
export const selectPaymentByOrderId = (state: RootState, orderId: string) =>
  state.payment.pendingPayments.find((p) => p.orderId === orderId);
