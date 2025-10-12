import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchHomepageProducts,
  selectHomepageProducts,
  selectProductLoading,
  selectProductError,
  type Product,
} from "../../redux/slices/productSlice";
import { Link } from "react-router-dom";

const TrendingNow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Use selectors for consistency
  const homepageProducts = useSelector(selectHomepageProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  // Match slice naming: "toptrending" (lowercase)
  const trending: Product[] = homepageProducts?.toptrending ?? [];

  // Fetch homepage products once
  useEffect(() => {
    if (!trending || trending.length === 0) {
      dispatch(fetchHomepageProducts());
    }
  }, [dispatch, trending]);

  return (
    <section className="mt-8 px-6">
      <h2 className="text-xl font-bold mb-4">🔥 Trending Now</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide py-2">
        {/* Loading Skeleton */}
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-28 h-28 rounded-lg bg-gray-200 animate-pulse"
            />
          ))}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm font-medium">
            {typeof error === "string" ? error : "Failed to load trending products"}
          </p>
        )}

        {/* Empty */}
        {!loading && !error && trending.length === 0 && (
          <p className="text-gray-600 text-sm">No trending products at the moment</p>
        )}

        {/* Products */}
        {!loading &&
          !error &&
          trending.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
            >
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="w-28 h-28 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <p className="mt-2 text-sm text-center font-medium text-gray-800 truncate">
                {product.name}
              </p>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default TrendingNow;
