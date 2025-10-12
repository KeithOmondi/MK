import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchHomepageProducts,
  selectHomepageProducts,
  selectProductLoading,
  selectProductError,
  type Product,
} from "../../redux/slices/productSlice";

const BestDeals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Selectors aligned with slice
  const homepageProducts = useSelector(selectHomepageProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  // ✅ Use lowercase key from backend
  const bestDeals: Product[] = homepageProducts?.bestdeals ?? [];

  // ✅ Fetch once if not already loaded
  useEffect(() => {
    if (!bestDeals || bestDeals.length === 0) {
      dispatch(fetchHomepageProducts());
    }
  }, [dispatch, bestDeals]);

  return (
    <section className="bg-[#f9fafb] py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span role="img" aria-label="star">
            ⭐
          </span>
          Best Deals of the Week
        </h2>

        <Link
          to="/best-deals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* ⏳ Loading Skeletons */}
        {loading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse bg-white shadow rounded-xl h-56"
            />
          ))}

        {/* ⚠️ Error State */}
        {!loading && error && (
          <p className="col-span-full text-center text-red-600 font-medium">
            {typeof error === "string"
              ? error
              : "Failed to load deals. Please try again."}
          </p>
        )}

        {/* 💤 Empty State */}
        {!loading && !error && bestDeals.length === 0 && (
          <p className="col-span-full text-center text-gray-600">
            No deals available this week.
          </p>
        )}

        {/* 🛒 Products */}
        {!loading &&
          !error &&
          bestDeals.map((p) => {
            const discount =
              p.oldPrice && p.price
                ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
                : 0;

            return (
              <Link
                to={`/product/${p._id}`}
                key={p._id}
                className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={p.images?.[0]?.url ?? "/placeholder.png"}
                    alt={p.name}
                    loading="lazy"
                    className="h-48 w-full object-contain bg-white transition-transform duration-200 group-hover:scale-105"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-grow">
                  <h3
                    className="text-gray-800 font-medium text-sm truncate"
                    title={p.name}
                  >
                    {p.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {typeof p.category === "object"
                      ? p.category?.name
                      : "Uncategorized"}
                  </p>

                  <div className="mt-auto">
                    <p className="text-lg font-bold text-gray-900">
                      Ksh {p.price?.toFixed(2)}
                    </p>
                    {p.oldPrice && (
                      <p className="text-sm line-through text-gray-400">
                        Ksh {p.oldPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
};

export default BestDeals;
