// src/pages/ProductPage.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { ShieldCheck, ShoppingCart, Star, User } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
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

// ✅ Lazy-load heavy or rarely used sections
const RelatedProducts = lazy(() => import("./RelatedProducts"));

/* ----------------------------------
   Helpers
---------------------------------- */
const createSafeVariant = (
  variant: Partial<ProductVariant> | undefined,
  product: Product,
  isDefault = false
): ProductVariant => ({
  _id:
    variant?._id ??
    (isDefault ? `${product._id}-default` : `${product._id}-fallback`),
  price: variant?.price && variant.price > 0 ? +variant.price : +product.price,
  stock: variant?.stock && variant.stock > 0
  ? +variant.stock
  : +(product.stock ?? 0),

  color: variant?.color ?? "Default",
  size: variant?.size ?? "",
  material: variant?.material ?? "",
});

const calculateAverageRating = (reviews: any[]) =>
  reviews?.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

/* ----------------------------------
   Component
---------------------------------- */
const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const product = useSelector(selectProduct, shallowEqual);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const reviewsLoading = useSelector(selectReviewLoading);

  const reviews = useSelector(
    useMemo(() => selectReviewsByProduct(id || ""), [id]),
    shallowEqual
  );

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "seller"
  >("description");

  const averageRating = useMemo(
    () => calculateAverageRating(reviews),
    [reviews]
  );

  /* ------------------------------
     Fetch product + reviews
  ------------------------------ */
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        await dispatch(fetchProductById(id)).unwrap();
        dispatch(getReviewsByProduct(id));
      } catch {
        toast.error("Failed to load product details");
      }
    };
    fetchData();
  }, [id, dispatch]);

  /* ------------------------------
     Image & Variant Initialization
  ------------------------------ */
  useEffect(() => {
    if (!product) return;

    if (!selectedImage && product.images?.[0]?.url)
      setSelectedImage(product.images[0].url);

    if (!selectedVariant)
      setSelectedVariant(createSafeVariant(product.variants?.[0], product, true));
  }, [product, selectedImage, selectedVariant]);

  useEffect(() => {
  if (product?.images?.length) {
    setSelectedImage(product.images[0].url);
  }
}, [product?._id]);


  /* ------------------------------
     Handlers
  ------------------------------ */
  const handleVariantChange = useCallback(
    (variant: ProductVariant) => {
      if (!product) return;
      setSelectedVariant(createSafeVariant(variant, product));
      setQuantity(1);
    },
    [product]
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) return;
    const safeVariant = createSafeVariant(selectedVariant, product);

    if (quantity > safeVariant.stock)
      return toast.error("Not enough stock available");

    dispatch(
      addToCart({
        _id: `${product._id}-${safeVariant._id}`,
        productId: product._id,
        name: product.name,
        images: product.images?.map(({ url, public_id }) => ({ url, public_id })) ?? [],
        variant: safeVariant,
        quantity,
        price: safeVariant.price,
        stock: safeVariant.stock,
        supplier:
          typeof product.supplier === "string"
            ? product.supplier
            : product.supplier?._id ?? "unknown-supplier",
      })
    );
    toast.success(`${product.name} added to cart`);
  }, [product, selectedVariant, quantity, dispatch]);

  const stockDisplay = useMemo(() => {
    const stock = selectedVariant?.stock ?? 0;
    return stock > 10 ? (
      <span className="text-green-600">In Stock</span>
    ) : stock > 0 ? (
      <span className="text-orange-500">Low Stock: {stock} left</span>
    ) : (
      <span className="text-red-600">Out of Stock</span>
    );
  }, [selectedVariant]);

  /* ------------------------------
     Conditional States
  ------------------------------ */
  if (loading && !product)
    return <p className="text-center mt-20">Loading product details...</p>;
  if (error)
    return (
      <p className="text-center mt-20 text-red-600">Error: {error}</p>
    );
  if (!product)
    return <p className="text-center mt-20">Product not found.</p>;

  /* ------------------------------
     Render
  ------------------------------ */
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* ---------- Images ---------- */}
          <div>
            <img
              src={selectedImage}
              alt={product.name}
              loading="lazy"
              className="w-full max-h-[500px] object-contain rounded-2xl shadow-lg border border-gray-100"
            />
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${product.name} ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
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
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < Math.round(averageRating) ? "#facc15" : "none"}
                />
              ))}
              <span className="text-sm text-gray-600">
                ({averageRating.toFixed(1)} / {reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-3xl font-extrabold text-blue-600">
              KSh {selectedVariant?.price?.toLocaleString()}
            </p>

            {/* Colors */}
            {product.colors?.length && (
              <div>
                <p className="font-semibold mb-2">Available Colors:</p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        handleVariantChange({ ...selectedVariant!, color })
                      }
                      className={`px-5 py-2 rounded-full border-2 text-sm font-medium ${
                        selectedVariant?.color === color
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-300 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Stock */}
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <p className="font-semibold">Quantity:</p>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        q < (selectedVariant?.stock ?? 0) ? q + 1 : q
                      )
                    }
                    disabled={quantity >= (selectedVariant?.stock ?? 0)}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium">Stock: {stockDisplay}</p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(selectedVariant?.stock ?? 0) < 1}
              className="flex items-center justify-center gap-3 bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              <ShoppingCart size={22} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Tabs */}
        <section className="mt-12">
          <div className="flex flex-wrap gap-3 border-b border-gray-200 mb-6">
            {[
              { id: "description", label: "Description" },
              { id: "reviews", label: "Customer Reviews" },
              { id: "seller", label: "Seller Info" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2 font-medium ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "description" && (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {product.description || "No description available."}
                </p>
              )}

              {activeTab === "reviews" && (
                <>
                  {reviewsLoading ? (
                    <p>Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((r) => (
                        <div
                          key={r._id}
                          className="p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User size={18} className="text-gray-400" />
                              <span className="font-semibold">
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}
                </>
              )}

              {activeTab === "seller" && product.supplier && (
                <div className="p-5 border rounded-lg bg-white">
                  {typeof product.supplier !== "string" ? (
                    <>
                      {product.supplier.shopName && (
                        <p className="font-semibold flex items-center gap-2">
                          {product.supplier.shopName}
                          {product.supplier.verified && (
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          )}
                        </p>
                      )}
                      {product.supplier.name && (
                        <p>Owner: {product.supplier.name}</p>
                      )}
                      {product.supplier.rating && (
                        <p className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-400" />
                          {product.supplier.rating.toFixed(1)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Seller info not available.</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Lazy Loaded Related Products */}
        <Suspense fallback={<p>Loading related products...</p>}>
          <RelatedProducts
            categoryId={
              typeof product.category === "string"
                ? product.category
                : product.category?._id || ""
            }
            currentProductId={product._id}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default React.memo(ProductPage);
