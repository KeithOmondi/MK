// src/redux/slices/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  supplier: string; // ✅ required
  images?: { url: string }[];
  brand?: string;
  stock?: number;
  quantity: number;
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
  totalAmount: number; // Final total after discount + shipping
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  coupon: null,
  shippingCost: 0,
  totalAmount: 0,
};

// 🔹 Recalculate totals
const calculateTotals = (items: CartItem[], coupon: Coupon | null, shippingCost: number) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = coupon ? (subtotal * coupon.percentage) / 100 : 0;
  const totalAmount = subtotal - discountAmount + shippingCost;
  return { subtotal, totalAmount };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((item) => item._id === action.payload._id);
      if (!existing) {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((i) => i._id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity += 1;
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
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
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    removeCoupon: (state) => {
      state.coupon = null;
      const { subtotal, totalAmount } = calculateTotals(state.items, null, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
      const { subtotal, totalAmount } = calculateTotals(state.items, state.coupon, state.shippingCost);
      state.subtotal = subtotal;
      state.totalAmount = totalAmount;
    },
  },
});

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
