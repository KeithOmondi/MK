// src/pages/ProductPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, ShoppingCart, Zap, Package, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import {
  fetchProductById,
  selectProduct,
  selectProductLoading,
  selectProductError,
} from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import type { AppDispatch } from "../redux/store";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

// 🎨 Theme Colors
const PRIMARY_COLOR = "indigo-600";
const ACCENT_COLOR = "orange-500";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const product = useSelector(selectProduct);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // --- Fetch product data
  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  // --- Select first image when product loads
  useEffect(() => {
    if (product?.images?.[0]?.url) setSelectedImage(product.images[0].url);
  }, [product]);

  // --- Average rating
  const avgRating = useMemo(() => {
    if (!product || product.ratings.length === 0) return 0;
    return (
      product.ratings.reduce((a, r) => a + r.rating, 0) / product.ratings.length
    );
  }, [product]);

  const isInStock = product?.stock && product.stock > 0;

  // --- Cart Actions
  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock ?? undefined, // ✅ fix TS null issue
        quantity,
      })
    );

    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock ?? undefined,
        quantity,
      })
    );

    toast.success(`🛒 ${product.name} added. Redirecting to checkout...`);
    setTimeout(() => navigate("/cart"), 1000);
  };

  // --- UI States
  if (loading)
    return (
      <p className="text-center text-gray-500 py-24 text-xl">
        Loading product details...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-red-600 py-24 text-xl font-medium">
        Error: {error}
      </p>
    );
  if (!product)
    return (
      <p className="text-center text-gray-500 py-24 text-xl">
        Product not found. Invalid ID.
      </p>
    );

  return (
    <>
      <Header />

      {/* Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
              <img
                src={selectedImage || "/placeholder.png"}
                alt={product.name}
                className="w-full h-[450px] md:h-[600px] object-contain p-4"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 p-2 overflow-x-auto bg-white rounded-xl border border-gray-100">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`thumb-${idx}`}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer transition transform hover:scale-[1.02] ${
                    selectedImage === img.url
                      ? `border-${PRIMARY_COLOR} ring-2 ring-${PRIMARY_COLOR}/50 shadow-md`
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 self-start space-y-6">
            <div className="p-4 sm:p-6 border border-gray-200 rounded-xl bg-white shadow-xl">
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-base font-medium text-gray-700">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.ratings.length} Reviews)
                </span>
              </div>

              <hr className="my-4" />

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className={`text-2xl font-extrabold text-${ACCENT_COLOR}`}>
                  Ksh {product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    Ksh {product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <p
                className={`mt-3 font-semibold text-lg ${
                  isInStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {isInStock
                  ? `In Stock (${product.stock} left)`
                  : "Out of Stock"}
              </p>

              {/* Quantity Selector */}
              {isInStock && (
                <div className="flex items-center gap-4 mt-5">
                  <label
                    htmlFor="qty"
                    className="text-lg font-semibold text-gray-700"
                  >
                    Qty:
                  </label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={product.stock ?? undefined}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(Number(e.target.value), product.stock || 1)
                      )
                    }
                    className={`w-24 border border-gray-300 rounded-lg px-3 py-2 text-center font-medium focus:outline-none focus:ring-2 focus:ring-${PRIMARY_COLOR}`}
                    disabled={!isInStock}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 w-full px-5 py-3 text-lg rounded-xl font-bold transition duration-200 shadow-md ${
                    isInStock
                      ? `bg-${PRIMARY_COLOR} text-white hover:bg-${PRIMARY_COLOR}/90`
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={22} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 w-full px-5 py-3 text-lg rounded-xl font-bold transition duration-200 shadow-md ${
                    isInStock
                      ? `bg-${ACCENT_COLOR} text-white hover:bg-${ACCENT_COLOR}/90`
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Zap size={22} /> Buy Now
                </button>
              </div>

              {/* Highlights */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-green-500" />
                  <span>Free shipping & returns.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={`text-${PRIMARY_COLOR}`} />
                  <span>Secure payment guaranteed.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 lg:mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 pb-2">
            Product Description
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage;
