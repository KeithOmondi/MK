// src/components/home/BestDeals.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomepageProducts, type Product } from "../../redux/slices/productSlice";
import type { RootState, AppDispatch } from "../../redux/store";

const BestDeals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const homepage = useSelector((state: RootState) => state.products.homepage);
  const bestDeals: Product[] = homepage?.deals ?? [];

  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

  return (
    <section className="bg-[#f9fafb] py-12 px-4 sm:px-8 lg:px-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="star">⭐</span> Best Deals of the Week
        </h2>

        <Link
          to="/deals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Skeleton loaders */}
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-white shadow rounded-xl h-56"></div>
          ))}

        {/* Error state */}
        {error && <p className="col-span-full text-center text-red-600">{error}</p>}

        {/* Empty state */}
        {!loading && !error && bestDeals.length === 0 && (
          <p className="col-span-full text-center text-gray-600">
            No deals available this week
          </p>
        )}

        {/* Products */}
        {!loading && !error && bestDeals.map((p) => (
          <div key={p._id} className="bg-white shadow rounded-xl p-4 flex flex-col">
            <img
              src={p.images?.[0]?.url ?? "/placeholder.png"}
              alt={p.name}
              className="h-40 w-full object-cover rounded-md mb-2"
            />
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.category?.name ?? "Uncategorized"}</p>
            <p className="mt-1 font-bold">${p.price.toFixed(2)}</p>
            {p.oldPrice && (
              <p className="text-sm line-through text-gray-400">
                ${p.oldPrice.toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestDeals;
