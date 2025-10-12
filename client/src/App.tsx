import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getUser } from "./redux/slices/authSlice";
import type { RootState, AppDispatch } from "./redux/store";

import {
  adminRoutes,
  authRoutes,
  notFoundRoute,
  supplierRoutes,
  userRoutes,
} from "./routes/Routes";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import SupplierRoute from "./routes/SupplierRoute";
import { initSocket } from "./utils/socket";

// ✅ Global Loader Component
const GlobalLoader = () => {
  const loadingStates = useSelector((state: RootState) => ({
    auth: state.auth.loading,
    products: state.products.loading,
    orders: state.orders.loading,
    reviews: state.reviews.loading,
    suppliers: state.suppliers.loading,
  }));

  const isLoading = Object.values(loadingStates).some(Boolean);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // ✅ Hydrate user on refresh if accessToken exists
  useEffect(() => {
    if (accessToken) {
      dispatch(getUser());
    }
  }, [accessToken, dispatch]);

  // ✅ Initialize socket once globally
  useEffect(() => {
    initSocket();
  }, []);

  return (
    <BrowserRouter>
      {/* Global Loader always on top */}
      <GlobalLoader />

      <Routes>
        {/* Auth / Public Routes */}
        {authRoutes.map(({ path, element }, i) => (
          <Route key={i} path={path} element={element} />
        ))}

        {/* User Routes */}
        {userRoutes.map(({ path, element }, i) => (
          <Route
            key={i}
            path={path}
            element={<PrivateRoute>{element}</PrivateRoute>}
          />
        ))}

        {/* Admin Routes */}
        {adminRoutes.map(({ path, element }, i) => (
          <Route
            key={i}
            path={path}
            element={<AdminRoute>{element}</AdminRoute>}
          />
        ))}

        {/* Supplier Routes */}
        {supplierRoutes.map(({ path, element }, i) => (
          <Route
            key={i}
            path={path}
            element={<SupplierRoute>{element}</SupplierRoute>}
          />
        ))}

        {/* 404 */}
        <Route path={notFoundRoute.path} element={notFoundRoute.element} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </BrowserRouter>
  );
}

export default App;
