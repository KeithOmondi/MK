// src/redux/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store";
// ==========================
// Types
// ==========================
interface PaymentState {
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PaymentState = {
  clientSecret: null,
  loading: false,
  error: null,
  success: false,
};

// ==========================
// Async Thunks
// ==========================
export const createPaymentIntent = createAsyncThunk(
  "payment/createIntent",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/payment/create-intent",
        { orderId },
        { withCredentials: true }
      );
      return data.clientSecret as string;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================
// Slice
// ==========================
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.clientSecret = action.payload;
        state.success = true;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;

export default paymentSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectPaymentClientSecret = (state: RootState) => state.payment.clientSecret;
export const selectPaymentLoading = (state: RootState) => state.payment.loading;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectPaymentSuccess = (state: RootState) => state.payment.success;
