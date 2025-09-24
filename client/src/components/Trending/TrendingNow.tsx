// src/components/TrendingNow.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchHomepageProducts } from "../../redux/slices/productSlice";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  images?: { url: string }[];
  price: number;
  oldPrice?: number | null;
}

const TrendingNow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const homepage = useSelector((state: RootState) => state.products.homepage);
  const trending: Product[] = homepage?.topTrending ?? [];
  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

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
            ></div>
          ))}

        {/* Error */}
        {error && <p className="text-red-600">{error}</p>}

        {/* Empty */}
        {!loading && !error && trending.length === 0 && (
          <p className="text-gray-600">No trending products at the moment</p>
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
              <p className="mt-2 text-sm text-center">{product.name}</p>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default TrendingNow;
