import React, { useEffect } from "react";
import { Clock, Percent, ShoppingCart, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import {
  fetchHomepageProducts,
  type Product,
  type ProductVariant,
} from "../redux/slices/productSlice";
import { addToCart, type CartItem } from "../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";

import type { RootState, AppDispatch } from "../redux/store";

/* ===========================================================
   Component: TodaysDeal
   Description: Displays daily deal products with add-to-cart 
   and wishlist functionality. Fully type-safe & optimized.
   =========================================================== */
const TodaysDeal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { homepage, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const deals: Product[] = homepage?.deals ?? [];
  const wishlist = useSelector(selectWishlistItems);

  // Fetch deals on mount
  useEffect(() => {
    dispatch(fetchHomepageProducts());
  }, [dispatch]);

  /* ----------------------- Handlers ----------------------- */
  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if ((variant.stock ?? 0) <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    const cartItem: CartItem = {
      _id: `${product._id}-${variant._id}`,
      productId: product._id,
      name: product.name,
      price: variant.price,
      stock: variant.stock,
      quantity: 1,
      images: product.images,
      brand: product.brand,
      variant,
      supplier:
        typeof product.supplier === "string"
          ? product.supplier
          : product.supplier?._id ?? "",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (product: Product, variant?: ProductVariant) => {
    const exists = wishlist.some((item) => item.productId === product._id);

    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.error(`${product.name} removed from wishlist`);
    } else {
      dispatch(
        addToWishlist({
          productId: product._id,
          name: product.name,
          price: variant?.price ?? product.price ?? 0,
          image: product.images?.[0]?.url ?? "",
        })
      );
      toast.success(`${product.name} added to wishlist`);
    }
  };

  /* ----------------------- Render ----------------------- */
  return (
    <>
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-7 h-7 text-red-600" />
          Today's Deals
        </h1>

        {loading && <p className="text-gray-500 text-lg">Loading deals...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && deals.length === 0 && (
          <p className="text-gray-500 text-lg">No deals available today.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {!loading &&
            deals.map((deal) => {
              const inWishlist = wishlist.some(
                (item) => item.productId === deal._id
              );

              // ✅ Safe fallback variant
              const variant: ProductVariant = {
                _id: deal.variants?.[0]?._id ?? `${deal._id}-default`,
                price: deal.variants?.[0]?.price ?? deal.price ?? 0,
                stock: deal.variants?.[0]?.stock ?? 0,
                color: deal.variants?.[0]?.color ?? "Default",
                size: deal.variants?.[0]?.size ?? "N/A",
                material: deal.variants?.[0]?.material ?? "N/A",
                sku: deal.variants?.[0]?.sku ?? "",
                image:
                  deal.variants?.[0]?.image ??
                  deal.images?.[0]?.url ??
                  "/assets/placeholder.png",
              };

              const discount =
                deal.oldPrice && variant.price
                  ? Math.round(
                      ((deal.oldPrice - variant.price) / deal.oldPrice) * 100
                    )
                  : 0;

              const stockPercent = Math.min(
                100,
                ((variant.stock ?? 0) / 30) * 100
              );

              return (
                <div
                  key={deal._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition relative group"
                >
                  <img
                    src={variant.image}
                    alt={deal.name}
                    className="w-full h-48 object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold truncate">
                      {deal.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-red-600 text-xl font-bold">
                        KSh {variant.price.toLocaleString()}
                      </span>
                      {deal.oldPrice && (
                        <span className="line-through text-gray-400 text-sm">
                          KSh {deal.oldPrice.toLocaleString()}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <Percent className="w-3 h-3" />-{discount}%
                        </span>
                      )}
                    </div>

                    {/* Stock Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${stockPercent}%`,
                            backgroundColor:
                              variant.stock < 10 ? "#dc2626" : "#16a34a",
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {variant.stock} left in stock
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex mt-4 gap-2">
                      <button
                        onClick={() => handleAddToCart(deal, variant)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(deal, variant)}
                        className={`p-2 rounded-xl border ${
                          inWishlist
                            ? "bg-red-100 text-red-600 border-red-300"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-red-100 hover:text-red-600"
                        } transition flex items-center justify-center`}
                        title={
                          inWishlist
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TodaysDeal;
