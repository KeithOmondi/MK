// src/components/NewArrivals.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchHomepageProducts } from "../../redux/slices/productSlice";

// Product type (based on backend model)
interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images?: { url: string }[];
}

const NewArrivals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const homepage = useSelector((state: RootState) => state.products.homepage);
  const newArrivals: Product[] = homepage?.newArrivals ?? [];

  const loading = useSelector((state: RootState) => state.products.loading);
  const error = useSelector((state: RootState) => state.products.error);

  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="sparkles">
            ✨
          </span>{" "}
          New Arrivals
        </h2>

        <Link
          to="/new-arrivals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Loading Skeleton */}
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse bg-gray-100 shadow rounded-xl h-56"
            ></div>
          ))}

        {/* Error */}
        {error && (
          <p className="col-span-full text-center text-red-600">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && newArrivals.length === 0 && (
          <p className="col-span-full text-center text-gray-600">
            No new arrivals right now
          </p>
        )}

        {/* Products */}
        {!loading &&
          !error &&
          newArrivals.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="group bg-gray-50 shadow rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-40 sm:h-56 object-contain transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  New
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-gray-800 font-medium text-sm truncate">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    Ksh {product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm line-through text-gray-400">
                      Ksh {product.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default NewArrivals;
