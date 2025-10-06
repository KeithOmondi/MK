import React from "react";
import { MdNotifications, MdMessage, MdLocalOffer, MdSearch } from "react-icons/md";
import { useSidebar } from "../Context/SidebarContext";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";
import { setSearchQuery } from "../../../redux/slices/productSlice";

const AdminHeader: React.FC = () => {
  const { collapsed } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <motion.header
      layout
      className={`sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 md:px-6 shadow-sm transition-all duration-300 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      }`}
    >
      {/* 🔍 Search bar */}
      <div className="flex items-center gap-2 w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
        <MdSearch className="text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search by SKU..."
          onChange={handleSearch}
          className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* 🔔 Icons + Profile */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <MdLocalOffer size={22} className="text-gray-600" />
        </button>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <MdMessage size={22} className="text-gray-600" />
          <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] rounded-full px-1.5">3</span>
        </button>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <MdNotifications size={22} className="text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">5</span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition">
          <img
            src="https://i.pravatar.cc/40?img=3"
            alt="Profile"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
          <span className="hidden md:inline text-sm font-semibold text-gray-700">Keith</span>
        </div>
      </div>
    </motion.header>
  );
};

export default AdminHeader;
