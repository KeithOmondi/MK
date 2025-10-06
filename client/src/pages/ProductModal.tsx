// src/components/ProductModal.tsx
import { addToCart } from "../redux/slices/cartSlice";
import type { Product } from "../redux/slices/productSlice";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaTimes, FaShoppingCart, FaTag, FaStore } from "react-icons/fa";
import { useDispatch } from "react-redux";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const dispatch = useDispatch();

  if (!product) return null;

  const variant =
    product.variants?.[0] ?? {
      _id: `${product._id}-default`,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
    };

  // 🏬 Extract shop name safely
  const shopName =
    typeof product.supplier === "object"
      ? product.supplier?.shopName ??
        product.supplier?.name ??
        "Unknown Shop"
      : "Unknown Shop";

  // 🛒 Add to cart handler
  const handleAddToCart = () => {
    if (variant.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    dispatch(
      addToCart({
        _id: `${product._id}-${variant._id}`,
        productId: product._id,
        name: product.name,
        price: variant.price,
        stock: variant.stock,
        quantity: 1,
        images: product.images?.length
          ? [product.images[0]]
          : [{ url: "/assets/placeholder.png" }],
        brand: product.brand,
        variant,
        supplier:
          typeof product.supplier === "object"
            ? product.supplier.shopName ??
              product.supplier.name ??
              "Unknown Shop"
            : "Unknown Shop",
      })
    );

    toast.success(`${product.name} added to cart`);
  };

  const hasDiscount =
    typeof product.oldPrice === "number" && product.oldPrice > 0;

  const discountedPrice = hasDiscount
    ? variant.price - (variant.price * product.oldPrice!) / 100
    : variant.price;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg relative"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          {/* ❌ Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
          >
            <FaTimes size={18} />
          </button>

          {/* 🖼️ Product Image */}
          <img
            src={product.images?.[0]?.url || "/assets/placeholder.png"}
            alt={product.name}
            className="w-full h-56 object-contain rounded-md mb-4 bg-gray-50"
          />

          {/* 📄 Product Details */}
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {product.description ?? "No description available."}
          </p>

          {/* 🏷️ SKU & Shop */}
          <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
            <p className="flex items-center gap-1">
              <FaTag className="text-green-600" /> <span>SKU:</span>{" "}
              <span className="font-medium text-gray-700">
                {product.sku ?? "N/A"}
              </span>
            </p>
            <p className="flex items-center gap-1">
              <FaStore className="text-green-600" />{" "}
              <span className="font-medium text-gray-700">{shopName}</span>
            </p>
          </div>

          {/* 💰 Price Section */}
          <div className="flex justify-between items-center mb-4">
            {hasDiscount ? (
              <div className="space-y-1">
                <p className="text-green-700 font-bold text-lg">
                  Ksh {discountedPrice.toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm line-through">
                  Ksh {variant.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-green-700 font-bold text-lg">
                Ksh {variant.price.toFixed(2)}
              </p>
            )}

            <p className="text-gray-500 text-sm">
              {variant.stock > 0
                ? `${variant.stock} in stock`
                : "Out of stock"}
            </p>
          </div>

          {/* 🛒 Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={variant.stock <= 0}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            <FaShoppingCart /> Add to Cart
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
