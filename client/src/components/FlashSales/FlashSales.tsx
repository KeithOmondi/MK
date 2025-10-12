// src/components/home/FlashSales.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchHomepageProducts,
  selectHomepageProducts,
  selectProductLoading,
  selectProductError,
} from "../../redux/slices/productSlice";

const FlashSales: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const homepageProducts = useSelector(selectHomepageProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  const flashSales = homepageProducts?.flashsales ?? [];

  // ✅ Fetch homepage products once if empty
  useEffect(() => {
    if (!flashSales || flashSales.length === 0) {
      dispatch(fetchHomepageProducts());
    }
  }, [dispatch, flashSales]);

  // 🕒 Find the earliest flash sale end date
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

      {/* Content */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {/* ⏳ Loading */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-xl w-48 h-52 flex-shrink-0"
            />
          ))}

        {/* ⚠️ Error */}
        {!loading && error && (
          <p className="text-red-600 font-medium">{error}</p>
        )}

        {/* 💤 Empty */}
        {!loading && !error && flashSales.length === 0 && (
          <p className="text-gray-600">No flash sales available right now.</p>
        )}

        {/* 🛒 Product Cards */}
        {!loading &&
          !error &&
          flashSales.length > 0 &&
          flashSales.map((product) => {
            const discount = product.flashSale?.discountPercentage ?? 0;
            const discountedPrice = product.price
              ? Math.round(product.price * (1 - discount / 100))
              : product.price ?? 0;

            return (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="flex-shrink-0 w-48 group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.name || "Product Image"}
                    className="w-full h-40 object-contain transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-semibold text-gray-800 truncate"
                    title={product.name}
                  >
                    {product.name || "Unnamed Product"}
                  </h3>

                  <p className="text-red-600 font-bold mt-1">
                    Ksh {discountedPrice.toLocaleString()}
                    {discount > 0 && product.price && (
                      <span className="line-through text-gray-400 ml-2 text-sm">
                        Ksh {product.price.toLocaleString()}
                      </span>
                    )}
                  </p>

                  {product.flashSale?.endDate && (
                    <div className="mt-1">
                      <Countdown targetDate={product.flashSale.endDate} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
};

export default FlashSales;
