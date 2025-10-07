import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Heart, User, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Product } from "../../redux/slices/productSlice";

const Sidebar = React.lazy(() => import("./Sidebar"));
const Wishlist = React.lazy(() => import("../Wishlist/Wishlist"));

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Redux states
  const cartItems = useSelector((state: RootState) => state.cart.items || []);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items || []);
  const products = useSelector((state: RootState) => state.products.products || []);

  // Simulated auth (replace later)
  const isAuthenticated = false;
  const user = { name: "Dennis" };

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredResults([]);
        return;
      }

      const query = searchQuery.toLowerCase();
      const matches = products.filter((p: any) => {
        const name = p.name?.toLowerCase() || "";
        const sku = p.sku?.toLowerCase() || "";
        const description = p.description?.toLowerCase() || "";
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

      setFilteredResults(matches.slice(0, 6));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setFilteredResults([]);
    setShowMobileSearch(false);
  };

  const handleSelectProduct = (id: string) => {
    navigate(`/product/${id}`);
    setSearchQuery("");
    setFilteredResults([]);
    setShowMobileSearch(false);
  };

  return (
    <>
      {/* ===== Top Offer Banner ===== */}
      <div className="bg-[#FF6B35] text-center text-white text-sm py-1">
        🎉 Free shipping on orders over KSh 5,000 — Shop now!
      </div>

      {/* ===== Header Section ===== */}
      <header className="sticky top-0 z-50 bg-[#2D6A4F] text-white shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          {/* ===== Logo ===== */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white hover:text-[#FF6B35]"
            >
              <Menu size={26} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="MKStore" className="h-9 object-contain" />
              <span className="font-bold text-xl hidden sm:inline">MKStore</span>
            </Link>
          </div>

          {/* ===== Desktop Search Bar ===== */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:flex flex-grow mx-4"
          >
            <input
              type="text"
              placeholder="Search for products, categories or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#2D6A4F] bg-white/90 py-2 pl-4 pr-12 text-sm text-[#1E1E1E] placeholder-gray-500 outline-none focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-[#FF6B35] p-2 hover:bg-orange-500"
            >
              <Search size={20} />
            </button>

            {/* Dropdown suggestions */}
            {filteredResults.length > 0 && (
              <ul className="absolute top-11 left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto border border-gray-100">
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
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-sm">{product.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                  </li>
                ))}
                <li
                  onClick={handleSearchSubmit}
                  className="px-4 py-2 text-center text-[#FF6B35] hover:bg-gray-50 cursor-pointer"
                >
                  View all results →
                </li>
              </ul>
            )}
          </form>

          {/* ===== Right Section ===== */}
          <div className="flex items-center gap-5">
            {/* Mobile search icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden text-white hover:text-[#FF6B35]"
            >
              <Search size={24} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative group"
              aria-label="Wishlist"
            >
              <Heart
                size={26}
                className="transition-colors duration-200 group-hover:text-[#FF6B35]"
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
                className="transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
              {cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="group"
              >
                <User
                  size={26}
                  className="transition-colors duration-200 group-hover:text-[#FF6B35]"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-md shadow-lg z-50 py-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm border-b">
                        Hi, {user.name}
                      </div>
                      <Link
                        to="/account"
                        className="block px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        Orders
                      </Link>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Navigation Links ===== */}
        <nav className="border-t border-[#2D6A4F]/70 bg-[#2D6A4F] px-4 py-2 text-sm overflow-x-auto">
          <div className="max-w-7xl mx-auto flex gap-6 text-white/90">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center whitespace-nowrap hover:text-white"
            >
              <Menu className="w-5 h-5 mr-1" /> All Categories
            </button>
            <Link to="/deals" className="hover:text-white">
              Today's Deals
            </Link>
            <Link to="/electronics" className="hover:text-white">
              Electronics
            </Link>
            <Link to="/fashion" className="hover:text-white">
              Fashion
            </Link>
            <Link to="/grocery" className="hover:text-white">
              Grocery
            </Link>
            <Link to="/prime" className="hover:text-white">
              Prime
            </Link>
            <Link to="/customer-service" className="hover:text-white">
              Customer Service
            </Link>
            <Link to="/community" className="hover:text-white">
              Sell on MKStore
            </Link>
          </div>
        </nav>
      </header>

      {/* ===== Mobile Search Modal ===== */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
          <div className="bg-white p-4 flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
            />
            <button
              onClick={handleSearchSubmit}
              className="ml-2 bg-[#FF6B35] text-white rounded-full p-2"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="ml-3 text-gray-600"
            >
              ✕
            </button>
          </div>

          {filteredResults.length > 0 && (
            <ul className="bg-white text-gray-800 max-h-96 overflow-y-auto">
              {filteredResults.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleSelectProduct(product._id!)}
                  className="px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
                >
                  {product.images?.[0] && (
                    <img
                      src={
                        typeof product.images[0] === "string"
                          ? product.images[0]
                          : product.images[0].url
                      }
                      alt={product.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span>{product.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ===== Lazy Loaded Drawers ===== */}
      <React.Suspense fallback={null}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Wishlist open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      </React.Suspense>
    </>
  );
};

export default Header;
