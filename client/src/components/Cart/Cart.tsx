// src/pages/Cart.tsx
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { removeFromCart, updateQuantity, clearCart } from "../../redux/slices/cartSlice";
import Header from "../common/Header";
import Footer from "../common/Footer";



export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
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
                    <p className="text-green-700 font-bold">Ksh{item.price}</p>
                    <p className="text-sm text-gray-500">Brand: {item.brand ?? "N/A"}</p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <p className="flex justify-between mb-2">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </p>
              <p className="flex justify-between font-semibold text-lg mb-4">
                <span>Total:</span>
                <span>Ksh{totalAmount.toLocaleString()}</span>
              </p>

              <button className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 mb-3">
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
