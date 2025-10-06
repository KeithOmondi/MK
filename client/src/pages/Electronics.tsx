// src/pages/Electronics.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchProductsByCategory,
  selectProducts,
  selectProductLoading,
  selectProductError,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";

import { ShoppingCart, Heart, Percent } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { addToCart, type CartItem } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";

const Electronics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const wishlist = useSelector(selectWishlistItems);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, ProductVariant>
  >({});

  // ⚠️ Replace this with your actual Electronics category ID
  const ELECTRONICS_CATEGORY_ID = "6700eaa258b...";

  // Fetch Electronics products
  useEffect(() => {
    if (ELECTRONICS_CATEGORY_ID) {
      dispatch(fetchProductsByCategory(ELECTRONICS_CATEGORY_ID));
    }
  }, [dispatch, ELECTRONICS_CATEGORY_ID]);

  // SEO
  useEffect(() => {
    document.title =
      "Electronics - Shop the Latest Electronics Online | MKSTORE";

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name='${name}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta(
      "description",
      "Discover the latest electronics including phones, laptops, TVs, headphones, and wearables. Shop featured electronics online at MKSTORE."
    );
    setMeta(
      "keywords",
      "Electronics, Phones, Laptops, TVs, Headphones, Wearables, MKSTORE"
    );

    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);

  // Handle variant selection
  const handleVariantChange = (productId: string, variant: ProductVariant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const selectedVariant = selectedVariants[product._id] ?? product.variants?.[0];

    const price = selectedVariant?.price ?? product.price ?? 0;
    const availableStock = selectedVariant?.stock ?? product.stock ?? 0;

    if (availableStock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    const cartItem: CartItem = {
      _id: product._id,
      productId: product._id,
      name: product.name,
      price,
      quantity: 1,
      stock: availableStock,
      images:
        product.images?.length && product.images[0]?.url
          ? [{ url: product.images[0].url, public_id: product.images[0].public_id }]
          : [{ url: "/assets/placeholder.png" }],
      variant: selectedVariant ?? undefined,
      supplier:
        typeof product.supplier === "string"
          ? product.supplier
          : product.supplier?.name ?? "Unknown",
      brand: product.brand ?? "Generic",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  // Toggle wishlist
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product._id);
    const selectedVariant = selectedVariants[product._id] ?? product.variants?.[0];
    const price = selectedVariant?.price ?? product.price ?? 0;

    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.error(`${product.name} removed from wishlist`);
    } else {
      dispatch(
        addToWishlist({
          productId: product._id,
          name: product.name,
          price,
          image: product.images?.[0]?.url ?? "/assets/placeholder.png",
        })
      );
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <section>
          <h1 className="text-2xl font-semibold mb-6">Featured Electronics</h1>

          {loading && <p className="text-gray-500">Loading products...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && products.length === 0 && (
            <p className="text-gray-500">No electronics products found.</p>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const inWishlist = wishlist.some(
                (item) => item.productId === product._id
              );
              const selectedVariant =
                selectedVariants[product._id] ?? product.variants?.[0];

              const price = selectedVariant?.price ?? product.price ?? 0;
              const availableStock = selectedVariant?.stock ?? product.stock ?? 0;
              const oldPrice = product.oldPrice ?? 0;
              const discount =
                oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
              const stockColor = availableStock < 10 ? "#dc2626" : "#16a34a";

              return (
                <article
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition relative group"
                >
                  <img
                    src={product.images?.[0]?.url ?? "/assets/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-contain"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    {product.brand && (
                      <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
                    )}

                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2">
                        <label className="text-sm font-medium">Select Variant:</label>
                        <select
                          value={selectedVariant?._id ?? ""}
                          onChange={(e) => {
                            const variant = product.variants?.find(
                              (v) => v._id === e.target.value
                            );
                            if (variant) handleVariantChange(product._id, variant);
                          }}
                          className="mt-1 w-full border px-2 py-1 rounded"
                        >
                          {product.variants.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.color ?? v.size ?? v.material ?? "Default"} - KSh{" "}
                              {v.price.toLocaleString()} ({v.stock} in stock)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-blue-600 text-xl font-bold">
                        KSh {price.toLocaleString()}
                      </span>
                      {oldPrice > price && (
                        <span className="line-through text-gray-400 text-sm">
                          KSh {oldPrice.toLocaleString()}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Percent className="w-3 h-3" />-{discount}%
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (availableStock / 30) * 100)}%`,
                            backgroundColor: stockColor,
                          }}
                        />
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          availableStock < 10 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {availableStock} left in stock {availableStock < 10 && "- Hurry!"}
                      </p>
                    </div>

                    <div className="flex mt-4 gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                      >
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`p-2 rounded-xl border transition flex items-center justify-center ${
                          inWishlist
                            ? "bg-red-100 text-red-600 border-red-300"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-red-100 hover:text-red-600"
                        }`}
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Electronics;
