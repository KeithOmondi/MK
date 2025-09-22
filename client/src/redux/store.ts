import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import supplierReducer from "./slices/supplierSlice";
import orderReducer from "./slices/orderSlice";
import categoryReducer from "./slices/categorySlice";
import paymentReducer from "./slices/paymentSlice";
import chatReducer from "./slices/chatSlice";
import analyticsReducer from "./slices/analyticsSlice";
import cartReducer from "./slices/cartSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
     products: productReducer,
     suppliers: supplierReducer,
     orders: orderReducer,
     categories: categoryReducer,
     payment: paymentReducer,
     chat: chatReducer,
     analytics: analyticsReducer,
     cart: cartReducer
  },
});

// ✅ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
