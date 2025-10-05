// src/components/Wishlist/Wishlist.tsx
import React from "react";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  selectWishlistItems,
  removeFromWishlist,
  clearWishlist,
} from "../../redux/slices/wishlistSlice";
import type { AppDispatch, RootState } from "../../redux/store";

interface WishlistProps {
  open: boolean;
  onClose: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const wishlist = useSelector((state: RootState) => selectWishlistItems(state));

  const handleRemove = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist ❤️‍🔥");
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      dispatch(clearWishlist());
      toast.success("Wishlist cleared 🧹");
    }
  };

  const handleViewProduct = (productId: string) => {
    onClose(); // Close drawer before navigating
    navigate(`/product/${productId}`);
  };

  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* ===== Drawer Header ===== */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Your Wishlist ❤️
        </h2>
        <div className="flex items-center gap-3">
          {wishlist.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* ===== Wishlist Items ===== */}
      <div className="flex flex-col gap-3 overflow-y-auto p-5 h-[calc(100%-4rem)]">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <img
              src="https://illustrations.popsy.co/gray/cart-empty.svg"
              alt="Empty wishlist"
              className="w-40 h-40 mb-5"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Your wishlist is empty 💔
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Add your favorite items to keep track of them.
            </p>
            <button
              onClick={() => {
                onClose();
                navigate("/");
              }}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-5 py-2 rounded-lg font-medium"
            >
              Browse Products
            </button>
          </div>
        ) : (
          wishlist.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 border-b pb-3 last:border-none"
            >
              <img
                src={
                  item.image ||
                  "https://via.placeholder.com/80x80?text=No+Image"
                }
                alt={item.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4
                  onClick={() => handleViewProduct(item.productId)}
                  className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-[#2D6A4F]"
                >
                  {item.name}
                </h4>
                <p className="text-sm text-green-700 font-medium mt-1">
                  Ksh {item.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wishlist;
