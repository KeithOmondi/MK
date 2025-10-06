import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Heart, User } from "lucide-react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Wishlist from "../Wishlist/Wishlist";
import type { RootState } from "../../redux/store";
import type { Product } from "../../redux/slices/productSlice";

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Redux states
  const cartItems = useSelector((state: RootState) => state.cart.items || []);
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlist.items || []
  );
  const products = useSelector(
    (state: RootState) => state.products.products || []
  );

  // Simulated user (replace with actual auth)
  const isAuthenticated = false;
  const user = { name: "Dennis" };

  // 🔍 Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    const matches = products.filter((p: any) => {
      const name = p.name?.toLowerCase() || "";
      const sku = p.sku?.toLowerCase() || "";
      const description = p.description?.toLowerCase() || "";

      // Category may be string or object
      const category =
        typeof p.category === "string"
          ? p.category.toLowerCase()
          : p.category?.name?.toLowerCase() || "";

      return (
        name.includes(query) ||
        sku.includes(query) ||
        description.includes(query) ||
        category.includes(query)
      );
    });

    setFilteredResults(matches.slice(0, 6)); // Limit to top 6 suggestions
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setFilteredResults([]);
  };

  const handleSelectProduct = (id: string) => {
    navigate(`/product/${id}`);
    setSearchQuery("");
    setFilteredResults([]);
  };

  return (
    <>
      {/* ====================== HEADER ====================== */}
      <header className="sticky top-0 z-50 w-full bg-[#2D6A4F] text-white shadow-lg">
        {/* ===== Top Nav ===== */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* ===== Logo ===== */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.png"
              alt="MKStore"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden text-xl font-bold tracking-tight sm:inline">
              MKStore
            </span>
          </Link>

          {/* ===== Search Bar ===== */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden flex-grow md:flex"
          >
            <input
              type="text"
              placeholder="Search by product name, category, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#2D6A4F] bg-white/90 py-2 pl-4 pr-12 text-sm text-[#1E1E1E] placeholder-gray-500 outline-none transition-all duration-200 focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-[#FF6B35] p-2 text-white transition-colors duration-200 hover:bg-orange-500"
            >
              <Search size={20} />
            </button>

            {/* 🔎 Dropdown Suggestions */}
            {filteredResults.length > 0 && (
              <ul className="absolute top-11 left-0 right-0 bg-white text-gray-800 shadow-lg rounded-lg z-50 max-h-64 overflow-y-auto border border-gray-100">
                {filteredResults.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSelectProduct(product._id!)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                     {product.images?.[0] && (
  <img
    src={
      typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].url
    }
    alt={product.name}
    className="w-8 h-8 object-cover rounded"
  />
)}

                      <span className="font-medium text-sm">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* ===== Right Side Nav ===== */}
          <div className="flex shrink-0 items-center gap-6">
            {/* Wishlist Button */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative group"
              aria-label="Wishlist"
            >
              <Heart
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative group"
              aria-label="Cart"
            >
              <ShoppingCart
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
              {cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* User */}
            <Link to={isAuthenticated ? "/account" : "/login"} className="group">
              <User
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
            </Link>
          </div>
        </div>

        {/* ===== Bottom Nav ===== */}
        <nav className="border-t border-[#2D6A4F]/70 bg-[#2D6A4F] px-4 py-2 text-sm overflow-x-auto">
          <div className="mx-auto flex max-w-7xl items-center gap-6 text-white/90">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center whitespace-nowrap transition-colors duration-200 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 inline-block -mt-1 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              All
            </button>

            <Link to="/deals" className="whitespace-nowrap hover:text-white">
              Today's Deals
            </Link>
            <Link to="/electronics" className="whitespace-nowrap hover:text-white">
              Electronics
            </Link>
            <Link to="/fashion" className="whitespace-nowrap hover:text-white">
              Fashion
            </Link>
            <Link to="/grocery" className="whitespace-nowrap hover:text-white">
              Grocery
            </Link>
            <Link to="/prime" className="whitespace-nowrap hover:text-white">
              Prime
            </Link>
            <Link
              to="/customer-service"
              className="whitespace-nowrap hover:text-white"
            >
              Customer Service
            </Link>
            <Link to="/community" className="whitespace-nowrap hover:text-white">
              Become a Seller
            </Link>
          </div>
        </nav>
      </header>

      {/* ===== Sidebar (Categories) ===== */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ===== Wishlist Drawer ===== */}
      <Wishlist open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
};

export default Header;
