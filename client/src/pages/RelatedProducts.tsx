import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchRelatedProducts, selectRelatedProducts, selectRelatedLoading } from "../redux/slices/productSlice";
import { getDisplayPrice } from "../utils/price";
import type { AppDispatch } from "../redux/store";

const RelatedProducts: React.FC<{ categoryId: string; currentProductId: string }> = ({
  categoryId,
  currentProductId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const related = useSelector(selectRelatedProducts);
  const loading = useSelector(selectRelatedLoading);

  useEffect(() => {
    if (categoryId && currentProductId) {
      dispatch(fetchRelatedProducts({ categoryId, excludeId: currentProductId }));
    }
  }, [categoryId, currentProductId, dispatch]);

  if (loading) return <p className="text-center mt-6">Loading related products...</p>;
  if (!related?.length) return <p className="text-gray-500 text-center mt-6">No related products found.</p>;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-5">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {related.map((product) => {
          const { price, oldPrice } = getDisplayPrice(product);
          return (
            <div
              key={product._id}
              className="border rounded-lg p-3 hover:shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.images?.[0]?.url || "/no-image.png"}
                  alt={product.name}
                  className="w-full h-48 object-contain rounded-md mb-3"
                />
                <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.brand}</p>
                <div className="mt-2">
                  <span className="font-semibold text-primary">
                    KES {price.toLocaleString()}
                  </span>
                  {oldPrice && oldPrice > price && (
                    <span className="text-gray-400 text-sm line-through ml-2">
                      KES {oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
