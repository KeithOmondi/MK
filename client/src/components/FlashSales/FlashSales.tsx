// src/components/FlashSales.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchHomepageProducts } from "../../redux/slices/productSlice";

const FlashSales: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { flashSales } = useSelector((state: RootState) => state.products.homepage);
  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

  return (
    <section className="bg-[#eee] py-12 px-4 sm:px-8 lg:px-16">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-gray-900">
            ⚡ Flash Sales
          </h2>
          <Countdown targetDate="2025-09-30T23:59:59" />
        </div>

        <Link
          to="/flash-sales"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {loading && <p>Loading flash sales...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && flashSales.length === 0 && <p>No flash sales available</p>}

        {flashSales.map((product) => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="flex-shrink-0 w-48 group overflow-hidden transition"
          >
            <img
              src={product.images?.[0]?.url || "/placeholder.png"}
              alt={product.name}
              className="w-full h-40 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <h3 className="mt-2 text-sm font-semibold text-gray-800 truncate">
              {product.name}
            </h3>
            <p className="text-red-600 font-bold">${product.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FlashSales;
