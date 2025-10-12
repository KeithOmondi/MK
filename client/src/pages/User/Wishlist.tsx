import React from "react";
import { FaHeart, FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  variant?: string;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();

  // Temporary static data — will connect to Redux or backend later
  const wishlistItems: WishlistItem[] = [
    {
      _id: "1",
      name: "Bluetooth Headphones",
      image: "https://via.placeholder.com/80",
      price: 2500,
      variant: "Black",
    },
    {
      _id: "2",
      name: "Gaming Keyboard",
      image: "https://via.placeholder.com/80",
      price: 4500,
      variant: "RGB Backlight",
    },
  ];

  const handleRemove = (id: string) => {
    // TODO: implement remove logic
    console.log("Removed from wishlist:", id);
  };

  const handleAddToCart = (item: WishlistItem) => {
    // TODO: implement add-to-cart logic
    console.log("Added to cart:", item.name);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <FaHeart className="text-pink-600 text-2xl" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Wishlist
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
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
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.name}
                </h3>
                {item.variant && (
                  <p className="text-sm text-gray-500 mb-2">
                    Variant: {item.variant}
                  </p>
                )}
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
                    onClick={() => handleRemove(item._id)}
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
