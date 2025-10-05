// src/pages/Grocery.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchProducts,
  selectProducts,
  selectProductLoading,
  selectProductError,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";
import {
  addToCart,
  type CartItem,
} from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";

import {
  Apple,
  Carrot,
  Coffee,
  Cookie,
  Milk,
  ShoppingBasket,
  Heart,
  Percent,
  ShoppingCart,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const aisles = [
  { name: "All", icon: ShoppingBasket },
  { name: "Fruits", icon: Apple },
  { name: "Vegetables", icon: Carrot },
  { name: "Dairy", icon: Milk },
  { name: "Beverages", icon: Coffee },
  { name: "Snacks", icon: Cookie },
  { name: "Household", icon: Cookie },
  { name: "Bakery", icon: Cookie },
  { name: "Meat", icon: ShoppingBasket },
  { name: "Frozen", icon: ShoppingBasket },
];

const Grocery: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedAisle, setSelectedAisle] = useState("All");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const wishlist = useSelector(selectWishlistItems);

  // ✅ Fetch Grocery category products
  useEffect(() => {
    dispatch(fetchProducts({ category: "Grocery" }));
  }, [dispatch]);

  // ✅ Filter products by aisle/category
  const filteredProducts = useMemo(() => {
    if (selectedAisle === "All") return products;
    return products.filter((p) => {
      const categoryName =
        typeof p.category === "string" ? p.category : p.category?.name;
      return categoryName === selectedAisle;
    });
  }, [products, selectedAisle]);

  // ✅ SEO meta tags
  useEffect(() => {
    document.title = "Grocery - Fresh Food & Essentials | MKSTORE";

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
      "Shop fresh groceries including fruits, vegetables, dairy, snacks, beverages, and household essentials online at MKSTORE."
    );
    setMeta(
      "keywords",
      "Grocery, Fruits, Vegetables, Dairy, Snacks, Beverages, Household, MKSTORE"
    );

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, []);

  // ✅ Add to Cart safely
  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    const selected =
      variant || product.variants?.find((v) => v._id === selectedVariants[product._id]) || product.variants?.[0];

    if (!selected) {
      toast.error("Please select a variant before adding to cart.");
      return;
    }

    const stock = selected.stock ?? 0;
    if (stock <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    const cartItem: CartItem = {
      _id: `${product._id}-${selected._id ?? "default"}`,
      productId: product._id,
      name: product.name,
      price: selected.price ?? product.price ?? 0,
      stock,
      quantity: 1,
      images:
        product.images?.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        })) ?? [],
      brand: product.brand ?? "Unbranded",
      variant: {
        _id: selected._id ?? `${product._id}-variant`,
        price: selected.price ?? 0,
        stock,
        color: selected.color ?? "",
        size: selected.size ?? "",
        material: selected.material ?? "",
      },
      supplier:
        typeof product.supplier === "string"
          ? product.supplier
          : product.supplier?._id ?? "Unknown",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  // ✅ Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product._id);
    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.error(`${product.name} removed from wishlist.`);
    } else {
      dispatch(
        addToWishlist({
          productId: product._id,
          name: product.name,
          price: product.price ?? 0,
          image: product.images?.[0]?.url ?? "",
        })
      );
      toast.success(`${product.name} added to wishlist.`);
    }
  };

  // ✅ Variant selection handler
  const handleVariantSelect = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const stockColor = (stock: number) => (stock < 10 ? "#dc2626" : "#16a34a");

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-white shadow rounded-xl p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">🛒 Shop by Aisle</h2>
          <ul className="space-y-3">
            {aisles.map(({ name, icon: Icon }) => (
              <li key={name}>
                <button
                  onClick={() => setSelectedAisle(name)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${
                    selectedAisle === name
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Section */}
        <main className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-6">Groceries</h1>
          <h2 className="text-2xl font-semibold mb-4">
            {selectedAisle === "All" ? "All Products" : selectedAisle}
          </h2>

          {loading && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 h-64 rounded-2xl"
                ></div>
              ))}
            </div>
          )}

          {error && <p className="text-red-600">{error}</p>}
          {!loading && filteredProducts.length === 0 && (
            <p className="text-gray-500">No products found in this aisle.</p>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const selectedVariant =
                product.variants?.find(
                  (v) => v._id === selectedVariants[product._id]
                ) || product.variants?.[0];
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
                    className="w-full h-48 object-contain"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    {product.brand && (
                      <p className="text-gray-500 text-sm mt-1">
                        {product.brand}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-600 text-xl font-bold">
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

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 1 && (
                      <select
                        value={selectedVariants[product._id] ?? ""}
                        onChange={(e) =>
                          handleVariantSelect(product._id, e.target.value)
                        }
                        className="mt-3 border border-gray-300 rounded-lg px-2 py-1 text-sm w-full focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select variant</option>
                        {product.variants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {[
                              v.color,
                              v.size,
                              v.material,
                              v.price ? `KSh ${v.price}` : "",
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Stock indicator */}
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

                    {/* Buttons */}
                    <div className="flex mt-4 gap-2">
                      <button
                        onClick={() =>
                          handleAddToCart(product, selectedVariant!)
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
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
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Grocery;
