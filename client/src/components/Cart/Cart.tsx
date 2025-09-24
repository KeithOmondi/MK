// src/pages/Cart.tsx
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../redux/slices/cartSlice";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { addToCart } from "../../redux/slices/cartSlice";
import { toast } from "react-toastify";
import type { Product } from "../../types";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  // Suggested products from product slice
  const products = useSelector((state: RootState) => state.products.products);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      ...product,
      quantity: 1,
      stock: product.stock ?? 0,
    };

    if (cartItem.stock > 0) {
      dispatch(addToCart(cartItem));
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(`${product.name} is out of stock!`);
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
                    <p className="text-sm text-gray-500">
                      Brand: {item.brand ?? "N/A"}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
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

        {/* Suggested Products */}
{products.length > 0 && (
  <div className="mt-16">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
      You might also like
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.slice(0, 4).map((product) => (
        <div
          key={product._id}
          className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col group"
        >
          <div className="relative">
            <img
              src={product.images?.[0]?.url || "/assets/placeholder.png"}
              alt={product.name}
              className="w-full h-48 object-contain p-4 bg-gray-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleAddToCart(product)}
                className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transform hover:scale-110 transition-transform"
                aria-label="Add to cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-xl font-extrabold text-green-700 mb-2">
              Ksh{product.price}
            </p>
            <p className="text-sm text-gray-500 mb-4 flex-grow">
              Brand: <span className="font-semibold">{product.brand ?? "N/A"}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      </section>
      <Footer />
    </>
  );
}
