import React, { useEffect } from "react";
import { FaHeart, FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  removeFromWishlist,
  syncWishlist,
} from "../../redux/slices/wishlistSlice";
import toast from "react-hot-toast";

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const items = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);

  // Sync wishlist with server on mount
  useEffect(() => {
    dispatch(syncWishlist())
      .unwrap()
      .catch((err) => toast.error(err));
  }, [dispatch]);

  const handleRemove = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (item: any) => {
    // TODO: connect with cart slice
    console.log("Added to cart:", item.name);
    toast.success(`${item.name} added to cart`);
  };

  if (loading)
    return (
      <p className="text-center py-20 text-blue-600">Loading wishlist...</p>
    );

  if (error)
    return (
      <p className="text-center py-20 text-red-600">Error: {error}</p>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <FaHeart className="text-pink-600 text-2xl" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Wishlist
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <FaHeart className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-500 mb-6">
            Your wishlist is empty. Start adding your favorite products!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <img
                src={item.image || "https://via.placeholder.com/80"}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.name}
                </h3>
                <p className="text-blue-600 font-bold mb-4">
                  Ksh {item.price.toLocaleString()}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove from wishlist"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
