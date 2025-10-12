import React from "react";
import { FaTrashAlt, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

const MyCart: React.FC = () => {
  const navigate = useNavigate();

  // Temporary static data — replace with cart from Redux or backend later
  const cartItems: CartItem[] = [
    {
      _id: "1",
      name: "Wireless Mouse",
      image: "https://via.placeholder.com/80",
      price: 1200,
      quantity: 2,
      variant: "Black",
    },
    {
      _id: "2",
      name: "USB-C Charger",
      image: "https://via.placeholder.com/80",
      price: 1800,
      quantity: 1,
      variant: "45W",
    },
  ];

  const handleRemove = (id: string) => {
    // TODO: implement remove logic
    console.log("Removed item:", id);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <FaShoppingCart className="text-blue-600 text-2xl" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Cart
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <FaShoppingCart className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-500 mb-6">Your cart is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        Variant: {item.variant}
                      </p>
                    )}
                    <p className="text-blue-600 font-semibold">
                      Ksh {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={() => {}}
                    className="w-16 border border-gray-300 rounded-lg text-center py-1"
                  />
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Remove item"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800 font-semibold">
                Ksh {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-800 font-semibold">Ksh 300</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>Ksh {(subtotal + 300).toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-lg font-semibold transition"
            >
              Proceed to Checkout
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCart;
