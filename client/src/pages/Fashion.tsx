// src/pages/Fashion.tsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../redux/store";
import {
  fetchProducts,
  selectProducts,
  selectProductLoading,
  selectProductError,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";

import { Heart, Percent, ShoppingCart } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { addToCart } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";

const Fashion: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const wishlist = useSelector(selectWishlistItems);

  // Fetch fashion products
  useEffect(() => {
    dispatch(fetchProducts({ category: "Fashion" }));
  }, [dispatch]);

  // Filter products safely by category
  const fashionProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryName =
        typeof p.category === "string" ? p.category : p.category?.name;
      return categoryName === "Fashion";
    });
  }, [products]);

  // SEO setup
  useEffect(() => {
    document.title = "Fashion - Trendy Clothes & Accessories Online | MKSTORE";

    const metaDescription =
      document.querySelector("meta[name='description']") ||
      Object.assign(document.createElement("meta"), { name: "description" });
    metaDescription.setAttribute(
      "content",
      "Shop the latest fashion for men, women, and kids. Discover trending clothes, shoes, accessories, and more at MKSTORE."
    );
    if (!metaDescription.parentElement) document.head.appendChild(metaDescription);

    const metaKeywords =
      document.querySelector("meta[name='keywords']") ||
      Object.assign(document.createElement("meta"), { name: "keywords" });
    metaKeywords.setAttribute(
      "content",
      "Fashion, Clothes, Shoes, Accessories, Men, Women, Kids, MKSTORE"
    );
    if (!metaKeywords.parentElement) document.head.appendChild(metaKeywords);

    const canonicalLink =
      document.querySelector("link[rel='canonical']") ||
      Object.assign(document.createElement("link"), { rel: "canonical" });
    canonicalLink.setAttribute("href", window.location.href);
    if (!canonicalLink.parentElement) document.head.appendChild(canonicalLink);
  }, []);

  // Add to cart
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    const selected = variant || product.variants?.[0];
    if (!selected) {
      toast.error("No variant available for this product.");
      return;
    }
    if ((selected.stock ?? 0) <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        productId: product._id,
        name: product.name,
        price: selected.price,
        stock: selected.stock ?? 0,
        quantity: 1,
        images: product.images,
        brand: product.brand,
        variant: selected,
        supplier:
          typeof product.supplier === "string"
            ? product.supplier
            : product.supplier?.shopName ||
              product.supplier?.name ||
              "Unknown",
      })
    );
    toast.success(`${product.name} added to cart!`);
  }; // ✅ <— this closing brace was missing

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product._id);
    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.error(`${product.name} removed from wishlist`);
    } else {
      dispatch(
        addToWishlist({
          productId: product._id,
          name: product.name,
          price: product.price ?? 0,
          image: product.images?.[0]?.url ?? "",
        })
      );
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const stockColor = (stock: number) => (stock < 10 ? "#dc2626" : "#16a34a");

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <section>
          <h1 className="text-2xl font-semibold mb-6">Trending Fashion</h1>

          {loading && <p className="text-gray-500">Loading products...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && fashionProducts.length === 0 && (
            <p className="text-gray-500">No fashion products found.</p>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {fashionProducts.map((product) => {
              const selectedVariant = product.variants?.[0] || null;
              const inWishlist = wishlist.some(
                (item) => item.productId === product._id
              );
              const discount =
                selectedVariant && product.oldPrice
                  ? Math.round(
                      ((product.oldPrice - selectedVariant.price) /
                        product.oldPrice) *
                        100
                    )
                  : 0;
              const stock = selectedVariant?.stock ?? 0;

              return (
                <article
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition relative group"
                >
                  <img
                    src={product.images?.[0]?.url ?? "/assets/placeholder.png"}
                    alt={product.name}
                    className="w-full h-60 object-contain"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    {product.brand && (
                      <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-pink-600 text-xl font-bold">
                        KSh {selectedVariant?.price?.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="line-through text-gray-400 text-sm">
                          KSh {product.oldPrice?.toLocaleString()}
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
                            width: `${Math.min(100, (stock / 30) * 100)}%`,
                            backgroundColor: stockColor(stock),
                          }}
                        />
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          stock < 10 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {stock} left in stock {stock < 10 && "- Hurry!"}
                      </p>
                    </div>

                    <div className="flex mt-4 gap-2">
                      <button
                        onClick={() =>
                          handleAddToCart(product, selectedVariant!)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
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

export default Fashion;
