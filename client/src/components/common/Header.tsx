// src/components/Header/Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Heart, Star, User } from "lucide-react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import type { RootState } from "@/redux/store";
import Wishlist from "../Wishlist/Wishlist";

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const navigate = useNavigate();

  // Redux states
  const cartItems = useSelector((state: RootState) => state.cart.items || []);
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlist.items || []
  );

  // Simulated user (replace with actual auth)
  const isAuthenticated = false;
  const user = { name: "Dennis" };

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
          <div className="relative hidden flex-grow md:flex">
            <input
              type="text"
              placeholder="Search thousands of products..."
              className="w-full rounded-full border border-[#2D6A4F] bg-white/90 py-2 pl-4 pr-12 text-sm text-[#1E1E1E] placeholder-gray-500 outline-none transition-all duration-200 focus:border-[#FF6B35]"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-[#FF6B35] p-2 text-white transition-colors duration-200 hover:bg-orange-500">
              <Search size={20} />
            </button>
          </div>

          {/* ===== Right Side Nav ===== */}
          <div className="flex shrink-0 items-center gap-6">
            {/* Wishlist Button (Drawer Trigger) */}
           {/* Wishlist Button (Drawer Trigger) */}
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
            {/* Sidebar Toggle */}
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
