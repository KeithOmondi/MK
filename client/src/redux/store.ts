import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import supplierReducer from "./slices/supplierSlice";
import orderReducer from "./slices/orderSlice";
import categoryReducer from "./slices/categorySlice";
import paymentReducer from "./slices/paymentSlice";
import chatReducer from "./slices/chatSlice";
import analyticsReducer from "./slices/analyticsSlice";
import cartReducer from "./slices/cartSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice"
import reviewReducer from "./slices/reviewSlice"
import adminDashboardReducer from "./slices/adminDashboardSlice"
import addressReducer from "./slices/addressSlice";
import offersReducer from "./slices/offersSlice";
import wishlistReducer from "./slices/wishlistSlice";
import reportsReducer from "./slices/reportSlice"
import disputesReducer from "./slices/disputesSlice"


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
     cart: cartReducer,
     wishlist: wishlistReducer,
     recentlyViewed: recentlyViewedReducer,
     reviews: reviewReducer,
     adminDashboard: adminDashboardReducer,
     address: addressReducer,
     offers: offersReducer,
     reports: reportsReducer,
     disputes: disputesReducer
     
  },
});

// ✅ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
