// src/components/Header.tsx

import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";

export default function Header() {
  const isAuthenticated = false; // 🔒 Replace with Redux/AuthContext
  const user = { name: "Dennis" }; // Example user
  const cartCount = 3; // 🔒 Replace with Redux cart state

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-lg">
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
            className="w-full rounded-full border border-gray-700 bg-gray-800 py-2 pl-4 pr-12 text-sm text-white placeholder-gray-400 outline-none transition-all duration-200 focus:border-yellow-400 focus:bg-gray-700"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-yellow-400 p-2 text-slate-900 transition-colors duration-200 hover:bg-yellow-500">
            <Search size={20} />
          </button>
        </div>

        {/* Right Side Nav */}
        <div className="flex shrink-0 items-center gap-6">
          <div className="hidden lg:block">
            <Link to="/orders" className="group block text-sm">
              <span className="text-gray-400 transition-colors duration-200 group-hover:text-white">
                Returns
              </span>
              <span className="block font-bold leading-tight transition-colors duration-200 group-hover:text-yellow-400">
                & Orders
              </span>
            </Link>
          </div>

          <Link to="/login" className="group hidden lg:block">
            <div className="flex-col items-start text-sm">
              <span className="text-gray-400 transition-colors duration-200 group-hover:text-white">
                Hello, {isAuthenticated ? user.name : "Sign in"}
              </span>
              <span className="block font-bold leading-tight transition-colors duration-200 group-hover:text-yellow-400">
                Account & Lists
              </span>
            </div>
          </Link>

          <Link to="/cart" className="group relative flex items-center">
            <ShoppingCart size={28} className="text-gray-400 transition-colors duration-200 group-hover:text-yellow-400" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-slate-900">
                {cartCount}
              </span>
            )}
            <span className="ml-2 hidden font-bold transition-colors duration-200 group-hover:text-yellow-400 sm:inline">
              Cart
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="border-t border-gray-700 bg-slate-800 px-4 py-2 text-sm overflow-x-auto">
        <div className="mx-auto flex max-w-7xl items-center gap-6 text-gray-300">
          <Link to="#" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block -mt-1 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            All
          </Link>
          <Link to="/deals" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Today's Deals
          </Link>
          <Link to="/electronics" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Electronics
          </Link>
          <Link to="/fashion" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Fashion
          </Link>
          <Link to="/grocery" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Grocery
          </Link>
          <Link to="/prime" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Prime
          </Link>
          <Link to="/customer-service" className="whitespace-nowrap transition-colors duration-200 hover:text-white">
            Customer Service
          </Link>
        </div>
      </nav>
    </header>
  );
}