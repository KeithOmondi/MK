import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchSectionProducts,
  selectSectionProducts,
  selectSectionsLoading,
  selectSectionsError,
} from "../../redux/slices/sectionSlice";
import { getDisplayPrice } from "../../utils/price";
import type { Product, ProductVariant } from "../../redux/slices/productSlice";

const NewArrivals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Redux state
  const sectionProducts = useSelector((state: RootState) => selectSectionProducts(state, "NewArrivals"));
  const loading = useSelector(selectSectionsLoading);
  const error = useSelector(selectSectionsError);

  useEffect(() => {
    if (!sectionProducts || sectionProducts.length === 0) {
      dispatch(fetchSectionProducts({ sectionName: "NewArrivals", limit: 8 }));
    }
  }, [dispatch, sectionProducts.length]);

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span role="img" aria-label="sparkles">✨</span>
          New Arrivals
        </h2>
        <Link
          to="/new-arrivals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Loading Skeleton */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 shadow rounded-xl h-56" />
          ))}

        {/* Error State */}
        {error && (
          <p className="col-span-full text-center text-red-600 font-medium">
            {typeof error === "string" ? error : "Failed to load new arrivals. Please try again."}
          </p>
        )}

        {/* Empty State */}
        {!loading && !error && sectionProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-600">
            No new arrivals right now.
          </p>
        )}

        {/* Products */}
        {!loading &&
          !error &&
          sectionProducts.map((product: Product) => {
            const variant: ProductVariant | undefined = product.variants?.[0];
            const { price, oldPrice } = getDisplayPrice(product, variant);

            return (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="group bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-48 sm:h-56 object-contain bg-white transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    New
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3
                    className="text-gray-800 font-medium text-sm truncate"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Ksh {price.toFixed(2)}
                    </span>
                    {oldPrice && (
                      <span className="text-sm line-through text-gray-400">
                        Ksh {oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {variant?.stock !== undefined && (
                    <p
                      className={`mt-1 text-sm font-medium ${
                        variant.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {variant.stock > 0
                        ? `In Stock (${variant.stock} left)`
                        : "Out of Stock"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
};

export default NewArrivals;
