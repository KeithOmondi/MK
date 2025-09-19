import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Heart, Star, User } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const isAuthenticated = false; // 🔒 Replace with Redux/AuthContext
  const user = { name: "Dennis" }; // Example user
  const cartCount = 3; // 🔒 Replace with Redux cart state

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#2D6A4F] text-white shadow-lg">
        {/* Top Nav */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Logo */}
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

          {/* Search Bar */}
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

          {/* Right Side Nav (Icons) */}
          <div className="flex shrink-0 items-center gap-6">
            <Link to="/wishlist" className="relative group">
              <Heart
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
            </Link>

            <Link to="/favourites" className="relative group">
              <Star
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
            </Link>

            <Link to="/cart" className="relative group">
              <ShoppingCart
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to={isAuthenticated ? "/account" : "/login"} className="group">
              <User
                size={26}
                className="text-white transition-colors duration-200 group-hover:text-[#FF6B35]"
              />
            </Link>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="border-t border-[#2D6A4F]/70 bg-[#2D6A4F] px-4 py-2 text-sm overflow-x-auto">
          <div className="mx-auto flex max-w-7xl items-center gap-6 text-white/90">
            {/* All button triggers sidebar */}
            <button
              onClick={toggleSidebar}
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
          </div>
        </nav>
      </header>

      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
