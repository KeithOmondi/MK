import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
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
  supplier: string;
  variant?: ProductVariant;
}

export interface Coupon {
  code: string;
  percentage: number;
}

export interface CheckoutTotals {
  subtotal: number;
  totalCommission: number;
  totalEscrowHeld: number;
  shippingCost: number;
  totalAmount: number;
  estimatedDeliveryDate: Date;
  deliveryDuration: number;
}

/* ==============================
   State
============================== */
export interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  checkoutTotals: CheckoutTotals;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  coupon: null,
  checkoutTotals: {
    subtotal: 0,
    totalCommission: 0,
    totalEscrowHeld: 0,
    shippingCost: 0,
    totalAmount: 0,
    estimatedDeliveryDate: new Date(),
    deliveryDuration: 0,
  },
  loading: false,
  error: null,
};

/* ==============================
   Helpers: Fetch Totals from Backend
============================== */
export const calculateCheckoutTotals = async (
  items: CartItem[],
  coupon: Coupon | null = null,
  deliveryAddress?: string
): Promise<CheckoutTotals> => {
  let subtotal = 0;
  let totalCommission = 0;

  items.forEach(item => {
    const price = item.price;
    const quantity = item.quantity;
    const commission = price * quantity * 0.1; // 10% commission
    subtotal += price * quantity;
    totalCommission += commission;
  });

  const totalEscrowHeld = subtotal - totalCommission;
  const discount = coupon ? (subtotal * coupon.percentage) / 100 : 0;
  const totalBeforeShipping = subtotal - discount;

  let shippingCost = 0;
  let estimatedDeliveryDate = new Date();
  let deliveryDuration = 0;

  if (deliveryAddress && items.length > 0) {
    try {
      const { data } = await api.post("/orders/estimates", {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        deliveryAddress,
      });

      shippingCost = data.data.shippingCost;
      deliveryDuration = data.data.estimatedDays;
      estimatedDeliveryDate = new Date(data.data.estimatedDeliveryDate);
    } catch (err) {
      console.error("Error fetching shipping estimate:", err);
    }
  }

  const totalAmount = totalBeforeShipping + shippingCost;

  return {
    subtotal,
    totalCommission,
    totalEscrowHeld,
    shippingCost,
    totalAmount,
    estimatedDeliveryDate,
    deliveryDuration,
  };
};

/* ==============================
   Async Thunks
============================== */
// Submit Order
export const submitCartOrder = createAsyncThunk(
  "cart/submitOrder",
  async (payload: OrderPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders/create", { ...payload, coupon: payload.coupon ?? null });
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update Cart Totals (fetch shipping estimate from backend)
export const updateCartTotals = createAsyncThunk<
  CheckoutTotals,
  { deliveryAddress?: string },
  { state: RootState }
>("cart/updateTotals", async ({ deliveryAddress }, { getState }) => {
  const state = getState();
  const items = state.cart.items;
  const coupon = state.cart.coupon;
  return await calculateCheckoutTotals(items, coupon, deliveryAddress);
});

/* ==============================
   Slice
============================== */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existing = state.items.find(
        i => i._id === newItem._id && i.variant?._id === newItem.variant?._id
      );

      if (existing) {
        existing.quantity = Math.min(existing.quantity + newItem.quantity, newItem.stock);
      } else {
        state.items.push({ ...newItem, images: newItem.images || [], quantity: Math.max(newItem.quantity, 1) });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(i => i._id === action.payload.id);
      if (item) item.quantity = Math.min(Math.max(action.payload.quantity, 1), item.stock);
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
    },

    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
    },

    removeCoupon: (state) => {
      state.coupon = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(submitCartOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCartOrder.fulfilled, state => {
        state.loading = false;
        state.items = [];
        state.coupon = null;
      })
      .addCase(submitCartOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCartTotals.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartTotals.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutTotals = action.payload;
      })
      .addCase(updateCartTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

/* ==============================
   Exports
============================== */
export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;

export default cartSlice.reducer;

/* ==============================
   Selectors
============================== */
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCoupon = (state: RootState) => state.cart.coupon;
export const selectCartTotals = (state: RootState) => state.cart.checkoutTotals;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartItemsCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
