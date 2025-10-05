// src/components/home/FlashSales.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchHomepageProducts } from "../../redux/slices/productSlice";

const FlashSales: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { homepage, loading, error } = useSelector((state: RootState) => state.products);

  const flashSales = homepage?.flashsales ?? [];

  // Fetch homepage products on mount
  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

  // Determine earliest flash sale end date
  const globalEndDate = flashSales
    ?.map((p) => p.flashSale?.endDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0];

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-gray-900">⚡ Flash Sales</h2>
          {globalEndDate && <Countdown targetDate={globalEndDate} />}
        </div>

        <Link
          to="/flash-sales"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Flash sale products */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {loading && <p>Loading flash sales...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && flashSales.length === 0 && <p>No flash sales available</p>}

        {flashSales.map((product) => {
          const discount = product.flashSale?.discountPercentage ?? 0;
          const discountedPrice = product.price
            ? Math.round(product.price * (1 - discount / 100))
            : 0;

          return (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="flex-shrink-0 w-48 group overflow-hidden transition"
            >
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name || "Product Image"}
                className="w-full h-40 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <h3 className="mt-2 text-sm font-semibold text-gray-800 truncate">
                {product.name || "Unnamed Product"}
              </h3>

              <p className="text-red-600 font-bold">
                Ksh {discountedPrice}
                {discount > 0 && product.price && (
                  <span className="line-through text-gray-400 ml-2 text-sm">
                    Ksh {product.price}
                  </span>
                )}
              </p>

              {product.flashSale?.endDate && (
                <Countdown targetDate={product.flashSale.endDate} />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FlashSales;
