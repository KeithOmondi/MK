// src/pages/CategoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";

import { FaShoppingCart, FaHeart } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import {
  fetchProducts,
  selectProducts,
  selectProductLoading,
  selectProductError,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";
import {
  selectCategories,
  fetchCategories,
} from "../redux/slices/categorySlice";

import { addToCart, type CartItem } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";
import { getDisplayPrice } from "../utils/price";

export default function CategoryPage() {
  const { category, subcategory } = useParams<{
    category: string;
    subcategory?: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();

  // Safe defaults
  const products = useSelector(selectProducts) ?? [];
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const categories = useSelector((state: RootState) => selectCategories(state)) ?? [];
  const wishlist = useSelector(selectWishlistItems) ?? [];

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  // Load categories if empty
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // Determine category ID
  const categoryId = useMemo(() => {
    if (!categories.length) return undefined;

    if (subcategory) {
      const sub = categories.find((c) => c.slug === subcategory);
      if (sub) return sub._id;
    }

    const mainCat = categories.find((c) => c.slug === category);
    return mainCat?._id;
  }, [categories, category, subcategory]);

  // Fetch products for category
  useEffect(() => {
    if (categoryId) dispatch(fetchProducts({ category: categoryId }));
  }, [dispatch, categoryId]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const brand = p.brand ?? "";
      const variant =
        selectedVariants[p._id] ?? p.variants?.[0] ?? {
          _id: `${p._id}-default`,
          price: p.price ?? 0,
          stock: 0,
          color: "Default",
          size: "",
          material: "",
        };

      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(brand);
      const matchesPrice =
        variant.price >= priceRange[0] && variant.price <= priceRange[1];
      const matchesStock = !inStockOnly || variant.stock > 0;

      return matchesBrand && matchesPrice && matchesStock;
    });
  }, [products, selectedBrands, priceRange, inStockOnly, selectedVariants]);

  // Available brands
  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand ?? "").filter(Boolean))
  );

  // Brand toggle
  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  // Variant change
  const handleVariantChange = (productId: string, variant: ProductVariant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const variant =
      selectedVariants[product._id] ?? product.variants?.[0] ?? {
        _id: `${product._id}-default`,
        price: product.price ?? 0,
        stock: 0,
        color: "Default",
        size: "",
        material: "",
      };

    if (variant.stock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    const { price } = getDisplayPrice(product, variant);

    const cartItem: CartItem = {
      _id: `${product._id}-${variant._id}`,
      productId: product._id,
      name: product.name,
      price,
      stock: variant.stock,
      quantity: 1,
      images: product.images?.length ? [product.images[0]] : [{ url: "/assets/placeholder.png" }],
      brand: product.brand,
      variant,
      supplier: typeof product.supplier === "string" ? product.supplier : product.supplier?.name ?? "Unknown",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  // Toggle wishlist
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product._id);
    const variant = selectedVariants[product._id] ?? product.variants?.[0];
    const price = variant ? getDisplayPrice(product, variant).price : product.price ?? 0;

    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.error(`${product.name} removed from wishlist`);
    } else {
      dispatch(
        addToWishlist({
          productId: product._id,
          name: product.name,
          price,
          image: product.images?.[0]?.url || "/assets/placeholder.png",
        })
      );
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <section className="container mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6 md:sticky md:top-24 h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-3">Filters</h2>

          {/* Brand Filter */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Brand</h3>
            {availableBrands.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No brands available</p>
            ) : (
              <div className="space-y-1">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-green-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="form-checkbox text-green-600 rounded-sm focus:ring-green-500"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
            <div className="flex space-x-3 items-center">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500"
                placeholder="Max"
              />
            </div>
          </div>

          {/* In-stock filter */}
          <div>
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="form-checkbox text-green-600 rounded-sm focus:ring-green-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products */}
        <div className="md:col-span-3">
          <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-6">
            {subcategory ? `${subcategory.replace("-", " ")} in ${category}` : category}
          </h1>

          {loading && <p className="text-gray-500 text-lg">Loading products...</p>}
          {error && toast.error(`Error: ${error}`)}
          {!loading && filteredProducts.length === 0 && (
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const inWishlist = wishlist.some((item) => item.productId === product._id);
              const variant = selectedVariants[product._id] ?? product.variants?.[0] ?? {
                _id: `${product._id}-default`,
                price: product.price ?? 0,
                stock: 0,
                color: "Default",
                size: "",
                material: "",
              };
              const { price, oldPrice } = getDisplayPrice(product, variant);

              return (
                <div
                  key={product._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out relative group"
                >
                  {/* Wishlist & Cart buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                      onClick={() => handleToggleWishlist(product)}
                      className={`p-2 rounded-full shadow-md bg-white transition-colors ${
                        inWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <FaHeart className="w-4 h-4" />
                    </button>
                    <button
                      title="Add to Cart"
                      onClick={() => handleAddToCart(product)}
                      className="text-gray-600 bg-white p-2 rounded-full shadow-md hover:text-green-600 transition-colors"
                    >
                      <FaShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product image */}
                  <img
                    src={product.images?.[0]?.url || "/assets/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-contain p-4 bg-white"
                  />

                  {/* Product info */}
                  <div className="p-4 space-y-1">
                    <h2 className="font-semibold text-base text-gray-800 truncate">{product.name}</h2>

                    {/* Variant selector */}
                    {product.variants && product.variants.length > 1 && (
                      <select
                        value={variant._id}
                        onChange={(e) => {
                          const selected = product.variants?.find((v) => v._id === e.target.value);
                          if (selected) handleVariantChange(product._id, selected);
                        }}
                        className="border border-gray-300 rounded-md p-1 text-sm w-full"
                      >
                        {product.variants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.color} / {v.size} / {v.material} - Ksh {v.price} ({v.stock} in stock)
                          </option>
                        ))}
                      </select>
                    )}

                    <p className="text-green-700 font-bold text-lg">
                      Ksh {price.toFixed(2)}
                      {oldPrice && (
                        <span className="line-through text-gray-400 text-sm ml-2">
                          Ksh {oldPrice.toFixed(2)}
                        </span>
                      )}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <p>Stock: {variant.stock}</p>
                      {product.brand && <p className="font-medium text-gray-400">{product.brand}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
