import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotals,
} from "../../redux/slices/cartSlice";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const checkoutTotals = useSelector(selectCartTotals);
  const totalAmount = checkoutTotals.totalAmount;

  const handleQuantityChange = (id: string, quantity: number, stock?: number) => {
    if (quantity > 0 && quantity <= (stock ?? Infinity)) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  return (
    <>
      <Header />
      <section className="container mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <img
                    src={item.images?.[0]?.url || "/assets/placeholder.png"}
                    alt={item.name}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-green-700 font-bold">Ksh {item.price}</p>
                    <p className="text-sm text-gray-500">Brand: {item.brand ?? "N/A"}</p>
                    <p className="text-sm text-gray-500">
                      {item.stock && item.stock > 0 ? (
                        <span>Stock: {item.stock}</span>
                      ) : (
                        <span className="text-red-500 font-bold">Out of Stock</span>
                      )}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1, item.stock)
                      }
                      disabled={item.quantity === 1}
                      className={`px-2 py-1 rounded ${
                        item.quantity === 1
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1, item.stock)
                      }
                      disabled={item.quantity >= (item.stock ?? 0)}
                      className={`px-2 py-1 rounded ${
                        item.quantity >= (item.stock ?? 0)
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || "/assets/placeholder.png"}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        Qty: {item.quantity} × Ksh {item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-green-700">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <p className="flex justify-between font-semibold text-lg mb-4 border-t pt-4">
                <span>Total:</span>
                <span>Ksh {totalAmount.toLocaleString()}</span>
              </p>

              <button
                onClick={() => navigate("/checkout")}
                disabled={
                  cartItems.length === 0 || cartItems.every((i) => (i.stock ?? 0) < 1)
                }
                className={`w-full py-2 rounded-lg mb-3 text-white transition ${
                  cartItems.length === 0 || cartItems.every((i) => (i.stock ?? 0) < 1)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => dispatch(clearCart())}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
