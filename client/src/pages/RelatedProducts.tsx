import type { Product } from "../redux/slices/productSlice";
import type { RootState } from "../redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ category, currentProductId }) => {
  const { products } = useSelector((state: RootState) => state.products);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (products && category) {
      const relatedItems = products
        .filter(
          (p) =>
            p.category === category &&
            p._id !== currentProductId
        )
        .slice(0, 6); // limit to 6 products
      setRelated(relatedItems);
    }
  }, [products, category, currentProductId]);

  if (!related.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-5">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {related.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg p-3 hover:shadow-md transition"
          >
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images?.[0]?.url || "/no-image.png"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.brand}</p>
              <p className="font-semibold text-primary mt-1">
                KES {product.price.toLocaleString()}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
