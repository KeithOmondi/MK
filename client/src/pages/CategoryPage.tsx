import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaShoppingCart, FaHeart, FaBolt, FaStore } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

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
  fetchCategories,
  selectCategories,
} from "../redux/slices/categorySlice";
import { addToCart, type CartItem } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";
import ProductModal from "./ProductModal";

export default function CategoryPage() {
  const { category, subcategory } = useParams<{
    category: string;
    subcategory?: string;
  }>();

  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector(selectProducts) ?? [];
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const categories =
    useSelector((state: RootState) => selectCategories(state)) ?? [];
  const wishlist = useSelector(selectWishlistItems) ?? [];

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, ProductVariant>
  >({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* ─────────── LOAD DATA ─────────── */
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  const categoryId = useMemo(() => {
    if (!categories.length) return undefined;
    const sub = subcategory
      ? categories.find((c) => c.slug === subcategory)
      : undefined;
    const main = categories.find((c) => c.slug === category);
    return sub?._id || main?._id;
  }, [categories, category, subcategory]);

  useEffect(() => {
    if (categoryId) dispatch(fetchProducts({ category: categoryId }));
  }, [dispatch, categoryId]);

  /* ─────────── FILTERING ─────────── */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const variant =
        selectedVariants[p._id] ??
        p.variants?.[0] ??
        { price: p.price ?? 0, stock: p.stock ?? 0 };
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand ?? "");
      const matchesPrice =
        variant.price >= priceRange[0] && variant.price <= priceRange[1];
      const matchesStock = !inStockOnly || variant.stock > 0;
      return matchesBrand && matchesPrice && matchesStock;
    });
  }, [products, selectedBrands, priceRange, inStockOnly, selectedVariants]);

  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand ?? "").filter(Boolean))
  );

  /* ─────────── HANDLERS ─────────── */
  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const handleVariantChange = (productId: string, variant: ProductVariant) =>
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));

  const handleAddToCart = (product: Product) => {
    const variant =
      selectedVariants[product._id] ??
      product.variants?.[0] ?? {
        _id: `${product._id}-default`,
        price: product.price ?? 0,
        stock: product.stock ?? 0,
      };

    if (variant.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const cartItem: CartItem = {
      _id: `${product._id}-${variant._id}`,
      productId: product._id,
      name: product.name,
      price: variant.price ?? product.price ?? 0,
      stock: variant.stock,
      quantity: 1,
      images: product.images?.length
        ? [product.images[0]]
        : [{ url: "/assets/placeholder.png" }],
      brand: product.brand,
      variant,
      supplier:
        typeof product.supplier === "string"
          ? product.supplier
          : product.supplier?.name ?? "Unknown",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product._id);
    const variant = selectedVariants[product._id] ?? product.variants?.[0];
    const price = variant?.price ?? product.price ?? 0;

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

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const pageTitle = subcategory
    ? `${subcategory.replace("-", " ")} in ${category} | ZenMart`
    : `${category} | ZenMart`;
  const pageDescription = `Explore high-quality ${subcategory || category} products at ZenMart. Compare prices, brands, and deals from trusted sellers.`;
  const canonicalUrl = `https://www.zenmart.com/${category}${
    subcategory ? `/${subcategory}` : ""
  }`;

  /* ─────────── RENDER ─────────── */
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`${category}, ${subcategory || ""}, online shopping, ZenMart, best deals, buy ${category} online`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <Toaster position="top-right" />
      <Header />

      {/* ─────────── MAIN SECTION ─────────── */}
      <section className="container mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 md:sticky md:top-24 h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3">
            Filters
          </h2>

          {/* Brand Filter */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Brand</h3>
            {availableBrands.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No brands</p>
            ) : (
              <div className="space-y-1">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-green-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="text-green-600 rounded-sm focus:ring-green-500"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
            <div className="flex space-x-3 items-center">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([+e.target.value, priceRange[1]])
                }
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500"
                placeholder="Min"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], +e.target.value])
                }
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Stock */}
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="text-green-600 rounded-sm focus:ring-green-500"
            />
            <span>In Stock Only</span>
          </label>
        </aside>

        {/* PRODUCT GRID */}
        <div className="md:col-span-3">
          <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-6 flex items-center gap-2">
            <FaStore className="text-green-600" />
            {subcategory
              ? `${subcategory.replace("-", " ")} in ${category}`
              : category}
          </h1>

          {loading && (
            <p className="text-gray-500 text-lg animate-pulse">
              Loading products...
            </p>
          )}
          {!loading && filteredProducts.length === 0 && (
            <p className="text-gray-500 text-lg">No products found.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const inWishlist = wishlist.some(
                (w) => w.productId === product._id
              );
              const variant =
                selectedVariants[product._id] ??
                product.variants?.[0] ?? {
                  _id: `${product._id}-default`,
                  price: product.price ?? 0,
                  stock: product.stock ?? 0,
                };

              const price = variant.price ?? product.price ?? 0;
              const flashActive = product.flashSale?.isActive;
              const sku = product.sku ?? "N/A";

              return (
                <motion.div
                  key={product._id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition relative group"
                >
                  {flashActive && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                      <FaBolt size={10} /> Flash Sale
                    </span>
                  )}

                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      title={
                        inWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                      }
                      className={`p-2 rounded-full bg-white shadow ${
                        inWishlist
                          ? "text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <FaHeart size={14} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      title="Add to Cart"
                      className="p-2 rounded-full bg-white text-gray-600 shadow hover:text-green-600"
                    >
                      <FaShoppingCart size={14} />
                    </button>
                  </div>

                  <img
                    src={product.images?.[0]?.url || "/assets/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-contain bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  />

                  <div className="p-4 space-y-1">
                    <h2 className="font-semibold text-base text-gray-800 truncate">
                      {product.name}
                    </h2>

                    {product.variants && product.variants.length > 1 && (
                      <select
                        value={variant._id}
                        onChange={(e) => {
                          const selected = product.variants?.find(
                            (v) => v._id === e.target.value
                          );
                          if (selected) handleVariantChange(product._id, selected);
                        }}
                        className="border border-gray-300 rounded-md p-1 text-sm w-full"
                      >
                        {product.variants.map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.color} / {v.size} – Ksh {v.price} ({v.stock})
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex justify-between items-center">
                      <p className="text-green-700 font-bold text-lg">
                        Ksh {price.toFixed(2)}
                      </p>
                      {product.oldPrice && (
                        <p className="text-sm line-through text-gray-400">
                          Ksh {product.oldPrice}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <p>SKU: {sku}</p>
                      <p>
                        {variant.stock > 0
                          ? `${variant.stock} left`
                          : "Out of stock"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </section>

      <Footer />
    </>
  );
}
