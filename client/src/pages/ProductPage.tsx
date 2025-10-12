// src/pages/ProductPage.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { ShoppingCart, Star, User } from "lucide-react";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import RelatedProducts from "./RelatedProducts";
import {
  fetchProductById,
  selectProduct,
  selectProductLoading,
  selectProductError,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import {
  getReviewsByProduct,
  selectReviewLoading,
  selectReviewsByProduct,
} from "../redux/slices/reviewSlice";
import type { AppDispatch } from "../redux/store";

/* ----------------------------------
   Helpers
---------------------------------- */
const createSafeVariant = (
  variant: Partial<ProductVariant> | undefined,
  product: Product,
  isDefault = false
): ProductVariant => {
  const price =
    variant?.price && variant.price > 0
      ? Number(variant.price)
      : Number(product.price ?? 0);

  const stock =
    variant?.stock && variant.stock > 0
      ? Number(variant.stock)
      : Number(product.stock ?? 0);

  return {
    _id:
      variant?._id ??
      (isDefault ? `${product._id}-default` : `${product._id}-fallback`),
    price,
    stock,
    color: variant?.color ?? "Default",
    size: variant?.size ?? "",
    material: variant?.material ?? "",
  };
};

const calculateAverageRating = (reviews: any[]) => {
  if (!reviews?.length) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return total / reviews.length;
};

/* ----------------------------------
   Component
---------------------------------- */
const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors (use shallowEqual to prevent rerenders)
  const product = useSelector(selectProduct, shallowEqual);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const reviewsLoading = useSelector(selectReviewLoading);

  // Memoized review selector to avoid "selector unknown returned different result" warning
  const reviews = useSelector(
    useMemo(() => selectReviewsByProduct(id || ""), [id]),
    shallowEqual
  );

  // Local UI state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const averageRating = useMemo(
    () => calculateAverageRating(reviews),
    [reviews]
  );

  /* ------------------------------
     Fetch product + reviews
  ------------------------------ */
  useEffect(() => {
    if (!id) return;

    dispatch(fetchProductById(id))
      .unwrap()
      .catch(() => toast.error("Failed to load product details"));

    dispatch(getReviewsByProduct(id)).catch(() =>
      console.warn("No reviews found for product")
    );
  }, [id, dispatch]);

  /* ------------------------------
     Image & Variant Initialization
  ------------------------------ */
  useEffect(() => {
    if (!product) return;

    const hasImages =
      Array.isArray(product.images) && product.images.length > 0;

    if (!selectedImage && hasImages && product.images![0]?.url) {
      setSelectedImage(product.images![0].url);
    }

    if (!selectedVariant) {
      const defaultVariant = createSafeVariant(
        product.variants?.[0],
        product,
        true
      );
      setSelectedVariant(defaultVariant);
    }
  }, [product, selectedImage, selectedVariant]);

  /* ------------------------------
     Handlers
  ------------------------------ */
  const handleVariantChange = useCallback(
    (variant: ProductVariant) => {
      if (!product) return;
      const safeVariant = createSafeVariant(variant, product);
      setSelectedVariant(safeVariant);
      setQuantity(1);
    },
    [product]
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) return;

    const safeVariant = createSafeVariant(selectedVariant, product);
    if (quantity > safeVariant.stock) {
      toast.error("Not enough stock available");
      return;
    }

    dispatch(
      addToCart({
        _id: `${product._id}-${safeVariant._id}`,
        productId: product._id,
        name: product.name,
        images:
          product.images?.map((img) => ({
            url: img.url,
            public_id: img.public_id,
          })) ?? [],
        variant: safeVariant,
        quantity,
        price: safeVariant.price,
        stock: safeVariant.stock,
        supplier:
          typeof product.supplier === "string"
            ? product.supplier
            : product.supplier?._id,
      })
    );

    toast.success(`${product.name} added to cart`);
  }, [product, selectedVariant, quantity, dispatch]);

  const stockDisplay = useMemo(() => {
    const stock = selectedVariant?.stock ?? 0;
    if (stock > 10) return <span className="text-green-600">In Stock</span>;
    if (stock > 0)
      return (
        <span className="text-orange-500">Low Stock: {stock} left</span>
      );
    return <span className="text-red-600">Out of Stock</span>;
  }, [selectedVariant]);

  /* ------------------------------
     Conditional States
  ------------------------------ */
  if (loading && !product)
    return (
      <p className="text-center mt-20 text-lg font-medium">
        Loading product details...
      </p>
    );

  if (error)
    return (
      <p className="text-center mt-20 text-red-600 font-medium">
        Error: {error}
      </p>
    );

  if (!product)
    return (
      <p className="text-center mt-20 text-lg font-medium">
        Product not found.
      </p>
    );

  /* ------------------------------
     Render
  ------------------------------ */
  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* ---------- Images ---------- */}
          <div>
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full max-h-[500px] object-contain rounded-2xl shadow-lg border border-gray-100"
            />
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${product.name} ${idx + 1}`}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedImage === img.url
                      ? "border-blue-600 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ---------- Product Info ---------- */}
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.round(averageRating) ? "#facc15" : "none"}
                  className="stroke-2"
                />
              ))}
              <span className="text-sm text-gray-600 font-medium">
                ({averageRating.toFixed(1)} / {reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-3xl font-extrabold text-blue-600">
              KSh {selectedVariant?.price?.toLocaleString()}
            </p>

            {/* Colors */}
            {product.colors?.length ? (
              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Available Colors:
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        handleVariantChange({
                          ...selectedVariant!,
                          color,
                        })
                      }
                      className={`px-5 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
                        selectedVariant?.color === color
                          ? "border-blue-600 bg-blue-50 text-blue-800 shadow-inner"
                          : "border-gray-300 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quantity */}
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <p className="font-semibold text-gray-700">Quantity:</p>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium bg-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        q < (selectedVariant?.stock ?? 0) ? q + 1 : q
                      )
                    }
                    disabled={quantity >= (selectedVariant?.stock ?? 0)}
                    className="px-4 py-2 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium">Stock: {stockDisplay}</p>
              <p className="text-sm font-medium text-gray-600">
                VAT: {product.taxPercentage ?? 16}%
              </p>
              {product.warranty && (
                <p className="text-sm font-medium text-gray-600">
                  Warranty: {product.warranty}
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(selectedVariant?.stock ?? 0) < 1}
              className="flex items-center justify-center gap-3 bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={22} />
              Add to Cart
            </button>
          </div>
        </div>

        <hr className="my-12 border-gray-200" />

        {/* Description */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
            Product Description
          </h3>
          <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description || "No description available."}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
            Customer Reviews
          </h3>

          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={18} />
                      <span className="font-semibold text-gray-800">
                        {typeof r.userId === "string"
                          ? "Anonymous"
                          : r.userId?.name || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < r.rating ? "#facc15" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>

        <RelatedProducts
          category={
            typeof product.category === "string"
              ? product.category
              : product.category?.name || ""
          }
          currentProductId={product._id}
        />
      </div>

      <Footer />
    </>
  );
};

export default ProductPage;
