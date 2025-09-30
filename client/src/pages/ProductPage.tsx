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
import {
  getReviewsByProduct,
  selectReviewsByProduct,
  addReview as addReviewSlice,
  selectReviewLoading,
} from "../redux/slices/reviewSlice";

import { fetchDeliveredOrdersByProduct, selectDeliveredOrders } from "../redux/slices/orderSlice";

import type { AppDispatch, RootState } from "../redux/store";
import type { Review as ReviewSliceType } from "../redux/slices/reviewSlice";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

// Theme colors
const PRIMARY_COLOR = "indigo-600";
const ACCENT_COLOR = "orange-500";

// StarRating Component
const StarRating: React.FC<{
  rating: number;
  setRating?: (r: number) => void;
  size?: string;
  readOnly?: boolean;
}> = ({ rating, setRating, size = "text-xl", readOnly = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating && !readOnly && setRating(star)}
        className={`${size} ${
          star <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
        } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        disabled={readOnly}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </button>
    ))}
  </div>
);

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const product = useSelector(selectProduct);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  const reviews = useSelector((state: RootState) => selectReviewsByProduct(id || "")(state));
  const reviewsLoading = useSelector(selectReviewLoading);

  const deliveredOrders = useSelector(selectDeliveredOrders);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reviewState, setReviewState] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: "",
  });

  // Determine if user can review (has delivered order for this product)
  const canReview = useMemo(() => {
    if (!product || !deliveredOrders) return false;
    return deliveredOrders.some((o) => o.items.some((item) => item.productId === product._id));
  }, [product, deliveredOrders]);

  // Fetch product, reviews, and delivered orders
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      dispatch(getReviewsByProduct(id));
      dispatch(fetchDeliveredOrdersByProduct(id));
    }
  }, [dispatch, id]);

  // Set initial image
  useEffect(() => {
    if (product?.images?.[0]?.url) setSelectedImage(product.images[0].url);
  }, [product]);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const isInStock = !!(product?.stock && product.stock > 0);

  // ------------------------ Handlers ------------------------
  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        supplier: product.supplier || "Unknown",
        images: product.images,
        stock: product.stock ?? 0,
        quantity,
      })
    );
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    setTimeout(() => navigate("/cart"), 1000);
  };

  const handleReviewSubmit = () => {
    if (!id || !reviewState.rating || !reviewState.comment.trim()) {
      toast.error("Please provide a rating and comment.");
      return;
    }

    if (!canReview) {
      toast.error("You can only review products you have received.");
      return;
    }

    dispatch(
      addReviewSlice({
        productId: id,
        orderId: "N/A",
        rating: reviewState.rating,
        comment: reviewState.comment.trim(),
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Review submitted!");
        setReviewState({ rating: 0, comment: "" });
      })
      .catch((err) => toast.error(err));
  };

  // ------------------------ Render ------------------------
  if (loading)
    return <p className="text-center text-gray-500 py-24 text-xl">Loading product details...</p>;
  if (error)
    return <p className="text-center text-red-600 py-24 text-xl font-medium">Error: {error}</p>;
  if (!product)
    return <p className="text-center text-gray-500 py-24 text-xl">Product not found.</p>;

  return (
    <>
      <Header />
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
              <img
                src={selectedImage || "/placeholder.png"}
                alt={product.name}
                className="w-full h-[450px] md:h-[600px] object-contain p-4"
              />
            </div>
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

          {/* Info & Actions */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 self-start space-y-6">
            <div className="p-4 sm:p-6 border border-gray-200 rounded-xl bg-white shadow-xl">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>

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
                <span className="text-base font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviews.length} Reviews)</span>
              </div>

              <hr className="my-4" />

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3">
                <span className={`text-2xl font-extrabold text-${ACCENT_COLOR}`}>
                  Ksh {product.price?.toFixed(2) || 0}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    Ksh {product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className={`mt-3 font-semibold text-lg ${isInStock ? "text-green-600" : "text-red-600"}`}>
                {isInStock ? `In Stock (${product.stock} left)` : "Out of Stock"}
              </p>

              {/* Quantity */}
              {isInStock && (
                <div className="flex items-center gap-4 mt-5">
                  <label htmlFor="qty" className="text-lg font-semibold text-gray-700">Qty:</label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={product.stock ?? 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(Number(e.target.value), product.stock ?? 1))}
                    className={`w-24 border border-gray-300 rounded-lg px-3 py-2 text-center font-medium focus:outline-none focus:ring-2 focus:ring-${PRIMARY_COLOR}`}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 w-full px-5 py-3 text-lg rounded-xl font-bold transition duration-200 shadow-md ${
                    isInStock ? `bg-${PRIMARY_COLOR} text-white hover:bg-${PRIMARY_COLOR}/90` : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={22} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className={`flex items-center justify-center gap-3 w-full px-5 py-3 text-lg rounded-xl font-bold transition duration-200 shadow-md ${
                    isInStock ? `bg-${ACCENT_COLOR} text-white hover:bg-${ACCENT_COLOR}/90` : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Zap size={22} /> Buy Now
                </button>
              </div>

              {/* Extra Info */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-green-500" /> <span>Free shipping & returns.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={`text-${PRIMARY_COLOR}`} /> <span>Secure payment guaranteed.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 lg:mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 pb-2">Product Description</h2>
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{product.description || "No description available."}</p>
        </div>

        {/* Reviews */}
        <div className="mt-12 lg:mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 pb-2">
            Customer Reviews ({reviews.length})
          </h2>

          {/* Add Review Form */}
          {canReview ? (
            <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6">
              <p className="font-semibold text-gray-700 mb-2">Leave a Review</p>
              <StarRating
                rating={reviewState.rating}
                setRating={(r) => setReviewState((prev) => ({ ...prev, rating: r }))}
              />
              <textarea
                value={reviewState.comment}
                onChange={(e) => setReviewState((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full border rounded-lg p-3 my-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Review
              </button>
            </div>
          ) : (
            <p className="text-gray-500 mb-6">
              You can only leave a review after receiving this product.
            </p>
          )}

          {/* Existing Reviews */}
          {reviewsLoading && <p className="text-gray-500">Loading reviews...</p>}
          {!reviewsLoading && reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
          {!reviewsLoading && reviews.length > 0 && (
            <div className="space-y-6">
              {reviews.map((rev: ReviewSliceType) => (
                <div key={rev._id} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {typeof rev.userId === "string" ? "Anonymous" : rev.userId.name || rev.userId.email || "Anonymous"}
                    </span>
                    <StarRating rating={rev.rating} readOnly size="text-lg" />
                  </div>
                  <p className="text-gray-700">{rev.comment}</p>
                  <span className="text-gray-400 text-sm mt-1 block">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductPage;
