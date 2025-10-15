import React, { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Country,
  State,
  City,
  type ICountry,
  type IState,
  type ICity,
} from "country-state-city";
import { MdPayment, MdAttachMoney, MdAccountBalanceWallet } from "react-icons/md";
import { IoCheckmarkCircle, IoCarOutline, IoLocationOutline } from "react-icons/io5";

import Header from "../common/Header";
import Footer from "../common/Footer";

import type { AppDispatch, RootState } from "../../redux/store";
import type { OrderPayload } from "../../types/orders";

import {
  submitCartOrder,
  applyCoupon,
  removeCoupon,
  selectCartTotals,
  selectCartItems,
  selectCartCoupon,
} from "../../redux/slices/cartSlice";

import {
  initiateMpesaPayment,
  fetchPaymentStatus,
  resetPaymentState,
  selectPaymentLoading,
  selectPaymentError,
  selectLastPaymentStatus,
} from "../../redux/slices/paymentSlice";

import {
  fetchShippingEstimate,
  resetShippingEstimate,
} from "../../redux/slices/orderSlice";

/* ---------------- Types ---------------- */

type PaymentMethod = "cod" | "mpesa" | "wallet"; // Added 'wallet'

interface DeliveryDetails {
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  shippingMethod: "standard" | "express" | "pickup";
}

// Helper component for styled form inputs/selects
const FormField: React.FC<React.PropsWithChildren<{ label: string; className?: string }>> = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

// Helper component for styled section headers
const CheckoutSection: React.FC<React.PropsWithChildren<{ title: string; step: number; icon: React.ReactNode }>> = ({
  title,
  step,
  icon,
  children,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
    <h3 className="text-xl md:text-2xl font-extrabold mb-6 flex items-center gap-3 text-gray-800 border-b border-gray-100 pb-3">
      <span className="text-blue-600 text-3xl">{icon}</span>
      {step}. {title}
    </h3>
    {children}
  </div>
);

/* ---------------- Main Component ---------------- */

export default function Checkout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux selectors
  const cartItems = useSelector(selectCartItems);
  const cartCoupon = useSelector(selectCartCoupon);
  const checkoutTotals = useSelector(selectCartTotals);
  const { shippingEstimate, loading: shippingLoading } = useSelector(
    (state: RootState) => state.orders
  );
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);
  const lastPayment = useSelector(selectLastPaymentStatus);

  // Local state
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    country: "KE",
    state: "",
    city: "",
    address: "",
    phone: "",
    shippingMethod: "standard",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa"); // Changed default to mpesa
  const [discountCode, setDiscountCode] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  const pollingRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Country/State/City options
  const availableCountries: ICountry[] = Country.getAllCountries();
  const availableStates: IState[] = deliveryDetails.country
    ? State.getStatesOfCountry(deliveryDetails.country)
    : [];
  const availableCities: ICity[] =
    deliveryDetails.country && deliveryDetails.state
      ? City.getCitiesOfState(deliveryDetails.country, deliveryDetails.state)
      : [];

  /* ---------------- Lifecycle & Effects (Unchanged Logic) ---------------- */

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
      dispatch(resetShippingEstimate());
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch]);

  // Poll M-Pesa Status
  useEffect(() => {
    if (!lastOrderId || !showLoader || paymentMethod !== "mpesa") return;
    pollingRef.current = window.setInterval(() => {
      dispatch(fetchPaymentStatus({ orderId: lastOrderId }));
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dispatch, lastOrderId, showLoader, paymentMethod]);

  // React to Payment Updates
  useEffect(() => {
    if (!lastPayment || !lastOrderId) return;

    if (lastPayment.paymentStatus === "paid") {
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.success("Payment successful! 🎉");
      navigate("/thank-you", {
        state: {
          orderId: lastOrderId,
          totalAmount: lastPayment.totalAmount,
          transactionId: lastPayment.transactionId,
        },
      });
    } else if (["failed", "refunded"].includes(lastPayment.paymentStatus)) {
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.error("Payment failed. Please try again.");
    }
  }, [lastPayment, lastOrderId, navigate]);

  // Handle Payment Errors
  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [paymentError]);

  // Fetch Shipping Estimate (debounced)
  useEffect(() => {
    if (!deliveryDetails.address || cartItems.length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      dispatch(
        fetchShippingEstimate({
          items: cartItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
          deliveryAddress: deliveryDetails.address,
          shippingMethod: deliveryDetails.shippingMethod,
        })
      ).catch(() => {});
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    deliveryDetails.address,
    deliveryDetails.shippingMethod,
    cartItems,
    dispatch,
  ]);

  /* ---------------- Derived Totals (Unchanged Logic) ---------------- */

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0),
    [cartItems]
  );

  const discountAmount = useMemo(() => {
    if (!cartCoupon) return 0;
    // Assuming cartCoupon.percentage is between 0 and 100
    return (subtotal * (cartCoupon.percentage || 0)) / 100;
  }, [cartCoupon, subtotal]);

  const effectiveShippingCost = useMemo(() => {
    if (shippingEstimate?.shippingCost != null)
      return Number(shippingEstimate.shippingCost);
    if (checkoutTotals?.shippingCost != null)
      return Number(checkoutTotals.shippingCost);
    return 0;
  }, [shippingEstimate, checkoutTotals]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + effectiveShippingCost);
  }, [subtotal, discountAmount, effectiveShippingCost]);

  /* ---------------- Handlers (Unchanged Logic/Minor Adjustments) ---------------- */

  const handleApplyDiscount = () => {
    if (discountCode.trim().toLowerCase() === "save10") {
      dispatch(applyCoupon({ code: "SAVE10", percentage: 10 }));
      toast.success("Discount applied: 10% off! 🏷️");
      setDiscountCode("");
    } else toast.error("Invalid discount code");
  };

  const handleRemoveDiscount = () => {
    dispatch(removeCoupon());
    setDiscountCode("");
    toast.info("Discount removed");
  };

  const normalizePhone = (phone: string) => {
    let s = phone.replace(/\s+/g, "").replace(/\D/g, "");
    if (s.startsWith("0")) s = "254" + s.slice(1);
    else if (/^[17]/.test(s)) s = "254" + s; // Basic check for 1/7 prefix after removing 0
    return s;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    if (!cartItems.length) return toast.error("Your cart is empty.");
    if (!deliveryDetails.address) return toast.error("Please enter your delivery address.");

    let phone = deliveryDetails.phone.trim();
    if (paymentMethod === "mpesa") {
      phone = normalizePhone(phone);
      if (!/^254(7|1)\d{8}$/.test(phone))
        return toast.error(
          "Invalid phone number. Use 07XXXXXXXX or 01XXXXXXXX format for M-Pesa."
        );
    }
    
    // NOTE: Wallet payment logic will go here in a real application, 
    // e.g., checking wallet balance against totalAmount.
    if (paymentMethod === "wallet") {
        // Example: If the total amount is more than a hypothetical wallet balance of 500
        if (totalAmount > 500) {
            return toast.error("Insufficient funds in your wallet. Total: Ksh " + totalAmount.toFixed(2));
        }
    }

    const orderPayload: OrderPayload = {
      items: cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
      deliveryDetails: { ...deliveryDetails, phone },
      paymentMethod,
      coupon: cartCoupon?.code ?? null,
      shippingCost: effectiveShippingCost,
    };

    try {
      const order = await dispatch(submitCartOrder(orderPayload)).unwrap();

      if (paymentMethod === "mpesa") {
        setShowLoader(true);
        await dispatch(
          initiateMpesaPayment({ orderId: order._id, phoneNumber: phone })
        ).unwrap();
        toast.info("Check your phone to complete the M-Pesa payment.");
        setLastOrderId(order._id);
      } else {
        // COD and Wallet go to thank you page directly (assuming success)
        toast.success("Order placed successfully! Thank you. 🙏");
        navigate("/thank-you", {
          state: { orderId: order._id, totalAmount: order.totalAmount },
        });
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setShowLoader(false);
      toast.error(err?.message || "Failed to process your order. Please try again.");
    }
  };

  const estDelivery = shippingEstimate?.estimatedDeliveryDate
    ? new Date(shippingEstimate.estimatedDeliveryDate).toDateString()
    : null;

  /* ---------------- UI (Styled) ---------------- */
  return (
    <>
      <Header />
      <section className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen relative">
        <h2 className="text-4xl font-black mb-10 text-center text-gray-900 tracking-tight">
          Secure Checkout
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form (Main Content) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-8"
          >
            {/* 1. Shipping Address */}
            <CheckoutSection title="Shipping Address" step={1} icon={<IoLocationOutline />}>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Country">
                  <select
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    value={deliveryDetails.country}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        country: e.target.value,
                        state: "",
                        city: "",
                      })
                    }
                  >
                    {availableCountries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="State/County">
                  <select
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    value={deliveryDetails.state}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        state: e.target.value,
                        city: "",
                      })
                    }
                  >
                    <option value="">Select State</option>
                    {availableStates.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="City">
                  <select
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    value={deliveryDetails.city}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        city: e.target.value,
                      })
                    }
                  >
                    <option value="">Select City</option>
                    {availableCities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Phone Number (e.g., 07XX XXX XXX)">
                  <input
                    type="tel"
                    placeholder="+254 7XX XXX XXXX"
                    className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    value={deliveryDetails.phone}
                    onChange={(e) =>
                      setDeliveryDetails({
                        ...deliveryDetails,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </FormField>
              </div>
              <FormField label="Detailed Address (Street, Building, etc.)" className="mt-4">
                <textarea
                  rows={3}
                  placeholder="Enter your full street address..."
                  className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  value={deliveryDetails.address}
                  onChange={(e) =>
                    setDeliveryDetails({
                      ...deliveryDetails,
                      address: e.target.value,
                    })
                  }
                  required
                />
              </FormField>
            </CheckoutSection>

            {/* 2. Shipping Method */}
            <CheckoutSection title="Shipping Method" step={2} icon={<IoCarOutline />}>
              <div className="space-y-3">
                {["standard", "express"].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition border ${
                      deliveryDetails.shippingMethod === method
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        className="form-radio text-blue-600 h-5 w-5"
                        checked={deliveryDetails.shippingMethod === method}
                        onChange={() =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            shippingMethod: method as any,
                          })
                        }
                      />
                      <div>
                        <p className="font-semibold capitalize text-gray-800">{method} Shipping</p>
                        <p className="text-sm text-gray-500">
                          {method === "express" ? "1–2 Business Days" : "3–5 Business Days"}
                        </p>
                      </div>
                    </div>
                    {/* Placeholder Cost/Estimate on the right */}
                    <div className="text-right">
                      {shippingLoading && deliveryDetails.shippingMethod === method ? (
                        <p className="text-sm text-blue-500">Loading...</p>
                      ) : (
                        <p className="font-bold text-gray-800">
                          {deliveryDetails.shippingMethod === method && shippingEstimate
                            ? `Ksh ${shippingEstimate.shippingCost.toFixed(2)}`
                            : "TBD"}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {shippingEstimate && !shippingLoading && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-center gap-2">
                    <IoCheckmarkCircle className="text-xl" />
                    Delivery by **{estDelivery}**
                </div>
              )}
            </CheckoutSection>

            {/* 3. Payment Method */}
            <CheckoutSection title="Payment Method" step={3} icon={<MdPayment />}>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    method: "mpesa",
                    label: "M-Pesa",
                    icon: <MdPayment className="text-green-600 text-2xl" />,
                    desc: "Pay instantly via Safaricom M-Pesa.",
                  },
                  {
                    method: "wallet",
                    label: "My Wallet",
                    icon: <MdAccountBalanceWallet className="text-indigo-600 text-2xl" />, // New icon for wallet
                    desc: "Use available balance in your account.",
                  },
                  {
                    method: "cod",
                    label: "Cash on Delivery",
                    icon: <MdAttachMoney className="text-orange-600 text-2xl" />,
                    desc: "Pay when your order arrives.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.method}
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition border-2 ${
                      paymentMethod === opt.method
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="payment"
                        className="form-radio text-blue-600 h-4 w-4"
                        checked={paymentMethod === opt.method}
                        onChange={() =>
                          setPaymentMethod(opt.method as PaymentMethod)
                        }
                      />
                      {opt.icon}
                      <span className="font-semibold text-gray-800">{opt.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </CheckoutSection>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={paymentLoading || showLoader || cartItems.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:shadow-none"
            >
              {paymentLoading || showLoader
                ? "Processing..."
                : `Pay Ksh ${totalAmount.toFixed(2).toLocaleString()} & Place Order`}
            </button>
          </form>

          {/* Order Summary (Sidebar) */}
          <aside className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit sticky top-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
              Order Summary
            </h3>
            {/* Item List */}
            <ul className="divide-y divide-gray-100 space-y-3 max-h-80 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <li
                  key={item._id}
                  className="flex items-start justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || "/assets/placeholder.png"}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-lg border-2 border-gray-100"
                    />
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} @ Ksh {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-green-700 whitespace-nowrap ml-4">
                    Ksh {(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            
            {/* Totals Breakdown */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toFixed(2).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping ({deliveryDetails.shippingMethod})</span>
                <span className="font-medium">Ksh {effectiveShippingCost.toFixed(2).toLocaleString()}</span>
              </div>
              {cartCoupon && (
                <div className="flex justify-between text-green-600 font-semibold text-sm">
                  <span>Discount ({cartCoupon.code})</span>
                  <span>-Ksh {discountAmount.toFixed(2).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {/* Final Total */}
            <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-4 text-2xl font-extrabold flex justify-between text-gray-900">
              <span>Order Total</span>
              <span>Ksh {totalAmount.toLocaleString()}</span>
            </div>

            {/* Coupon Input */}
            <div className="mt-6 space-y-2 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Have a coupon code?</p>
              {!cartCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={!discountCode.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg">
                  <span className="font-semibold text-green-800">
                    Coupon **{cartCoupon.code}** Applied!
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              )}{" "}
            </div>{" "}
          </aside>{" "}
        </div>{" "}

        {/* Full-Screen Loader/Modal */}
        {(paymentLoading || showLoader) && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            {" "}
            <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-sm w-full animate-pulse">
              <svg className="w-12 h-12 mx-auto text-blue-600 animate-spin" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" className="opacity-25" />
                <path d="M82 50C82 30.716 66.284 15 47 15" stroke="currentColor" strokeWidth="6" className="opacity-75" />
              </svg>
              <p className="text-xl font-bold mt-4 text-gray-800">
                Awaiting Payment
              </p>{" "}
              <p className="text-sm text-gray-500 mt-2">
                Please check your phone for the **M-Pesa STK Push** to complete payment. This window will update automatically.
              </p>
            </div>{" "}
          </div>
        )}{" "}
      </section>{" "}
      <Footer />{" "}
    </>
  );
}