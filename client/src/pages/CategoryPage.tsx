// src/pages/CategoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";

import { FaShoppingCart, FaHeart, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import {
  fetchProducts,
  selectProducts,
  selectProductLoading,
  selectProductError,
} from "../redux/slices/productSlice";
import {
  selectCategories,
  fetchCategories,
} from "../redux/slices/categorySlice";

import {
  addToCart,
  removeFromCart,
  updateQuantity,
  type CartItem,
} from "../redux/slices/cartSlice";
import type { Product } from "@/types";

export default function CategoryPage() {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const categories = useSelector((state: RootState) => selectCategories(state));
  const cart = useSelector((state: RootState) => state.cart);

  // Local filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Ensure categories loaded
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // Resolve categoryId
  const categoryId = useMemo(() => {
    if (subcategory) {
      const sub = categories.find((c) => c.slug === subcategory);
      if (sub) return sub._id;
    }
    return categories.find((c) => c.slug === category)?._id;
  }, [categories, category, subcategory]);

  // Fetch products
  useEffect(() => {
    if (categoryId) dispatch(fetchProducts({ category: categoryId }));
  }, [dispatch, categoryId]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const brand = p.brand ?? "";
      const stock = p.stock ?? 0;
      const price = p.price ?? 0;

      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesStock = !inStockOnly || stock > 0;

      return matchesBrand && matchesPrice && matchesStock;
    });
  }, [products, selectedBrands, priceRange, inStockOnly]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand ?? "").filter(Boolean))
  );

  const handleAddToCart = (product: Product) => {
  const cartItem = {
    ...product,
    quantity: 1,
    stock: product.stock ?? 0, // ✅ convert null to 0
  };

  if (cartItem.stock > 0) {
    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  } else {
    toast.error(`${product.name} is out of stock!`);
  }
};



  // Increment/decrement quantity
  const handleIncrement = (item: CartItem) => {
    if (item.stock && item.quantity < item.stock) {
      dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }));
    } else {
      toast.error("Cannot exceed stock quantity!");
    }
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }));
    } else {
      toast.error("Quantity cannot be less than 1!");
    }
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed from cart!");
  };

  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <section className="container mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6 md:sticky md:top-24 h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-3">Filters</h2>
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
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
            <div className="flex space-x-3 items-center">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Max"
              />
            </div>
          </div>
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

        {/* Main Products */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-6">
            {subcategory ? `${subcategory.replace("-", " ")} in ${category}` : category}
          </h1>

          {loading && <p className="text-gray-500 text-lg">Loading products...</p>}
          {error && toast.error(`Error: ${error}`)}
          {!loading && filteredProducts.length === 0 && (
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out relative group"
              >
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    title="Add to Wishlist"
                    className="text-gray-600 bg-white p-2 rounded-full shadow-md hover:text-red-500 transition-colors"
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
                <img
                  src={product.images?.[0]?.url || "/assets/placeholder.png"}
                  alt={product.name}
                  className="w-full h-48 object-contain p-4 bg-gray-50"
                />
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-base text-gray-800 truncate">{product.name}</h2>
                  <p className="text-green-700 font-bold text-lg">Ksh{product.price ?? 0}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <p>Stock: {product.stock ?? "N/A"}</p>
                    {product.brand && <p className="font-medium text-gray-400">{product.brand}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <aside className="md:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4 md:sticky md:top-24 h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-3">Cart</h2>
          {cart.items.length === 0 ? (
            <p className="text-gray-500 text-sm">Your cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1">
                    <p className="text-gray-700 truncate">{item.name}</p>
                    <p className="text-green-700 font-semibold">Ksh{item.price}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FaPlus size={12} />
                      </button>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <p className="font-bold text-gray-800">Total: Ksh{cart.totalAmount}</p>
            </div>
          )}
        </aside>
      </section>

      <Footer />
    </>
  );
}
