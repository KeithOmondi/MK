// src/redux/slices/cartSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { RootState } from "../store";
import type { OrderPayload } from "../../types/orders";
import type { ProductVariant } from "./productSlice";

/* ==============================
   Types
============================== */
export interface CartImage {
  url: string;
  public_id?: string;
}

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  images: CartImage[];
  brand?: string;
  supplier?: string; // Supplier ID or name
  variant?: ProductVariant; // Selected product variant
}

export interface Coupon {
  code: string;
  percentage: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  coupon: Coupon | null;
  shippingCost: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

/* ==============================
   Initial State
============================== */
const initialState: CartState = {
  items: [],
  subtotal: 0,
  coupon: null,
  shippingCost: 0,
  totalAmount: 0,
  loading: false,
  error: null,
};

/* ==============================
   Helpers
============================== */
const calculateTotals = (
  items: CartItem[],
  coupon: Coupon | null,
  shippingCost: number
) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = coupon ? (subtotal * coupon.percentage) / 100 : 0;
  const totalAmount = subtotal - discount + shippingCost;
  return { subtotal, totalAmount };
};

/* ==============================
   Async Thunk: Submit Order
============================== */
export const submitCartOrder = createAsyncThunk(
  "cart/submitOrder",
  async (payload: OrderPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/create", {
        ...payload,
        coupon: payload.coupon ?? null,
      });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ==============================
   Slice
============================== */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;

      // Validate essential fields
      if (!newItem._id || !newItem.supplier) return;

      const existing = state.items.find(
        (item) =>
          item._id === newItem._id &&
          item.variant?._id === newItem.variant?._id
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + newItem.quantity,
          newItem.stock
        );
      } else {
        state.items.push({
          ...newItem,
          images: newItem.images || [],
          quantity: newItem.quantity > 0 ? newItem.quantity : 1,
        });
      }

      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item && quantity > 0 && quantity <= item.stock) {
        item.quantity = quantity;
      }
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity < item.stock) {
        item.quantity += 1;
      }
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.coupon = null;
      state.shippingCost = 0;
      state.totalAmount = 0;
    },

    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },

    removeCoupon: (state) => {
      state.coupon = null;
      Object.assign(
        state,
        calculateTotals(state.items, null, state.shippingCost)
      );
    },

    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
      Object.assign(
        state,
        calculateTotals(state.items, state.coupon, state.shippingCost)
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(submitCartOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCartOrder.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.subtotal = 0;
        state.coupon = null;
        state.shippingCost = 0;
        state.totalAmount = 0;
      })
      .addCase(submitCartOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

/* ==============================
   Exports
============================== */
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShippingCost,
} = cartSlice.actions;

export default cartSlice.reducer;

/* ==============================
   Selectors
============================== */
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartSubtotal = (state: RootState) => state.cart.subtotal;
export const selectCartTotal = (state: RootState) => state.cart.totalAmount;
export const selectCartShipping = (state: RootState) => state.cart.shippingCost;
export const selectCartCoupon = (state: RootState) => state.cart.coupon;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
