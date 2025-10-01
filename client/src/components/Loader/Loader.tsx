// src/components/common/GlobalLoader.tsx
import { useSelector } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader"; // or any spinner component

import type { RootState } from "../../redux/store";

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
      <ClipLoader size={60} color="#4F46E5" /> {/* Indigo-600 */}
    </div>
  );
};

export default GlobalLoader;
