// src/pages/Checkout.tsx
import React, { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Country, State, City, type ICountry, type IState, type ICity } from "country-state-city";
import { MdPayment, MdAttachMoney } from "react-icons/md";

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

type PaymentMethod = "cod" | "mpesa";

interface DeliveryDetails {
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  shippingMethod: "standard" | "express" | "pickup";
}

export default function Checkout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartCoupon = useSelector(selectCartCoupon);
  const checkoutTotals = useSelector(selectCartTotals);

  // orderSlice shippingEstimate + loading
  const { shippingEstimate, loading: shippingLoading } = useSelector(
    (state: RootState) => state.orders
  );

  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);
  const lastPayment = useSelector(selectLastPaymentStatus);

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    country: "KE",
    state: "",
    city: "",
    address: "",
    phone: "",
    shippingMethod: "standard",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const pollingRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  const availableCountries: ICountry[] = Country.getAllCountries();
  const availableStates: IState[] = deliveryDetails.country
    ? State.getStatesOfCountry(deliveryDetails.country)
    : [];
  const availableCities: ICity[] =
    deliveryDetails.country && deliveryDetails.state
      ? City.getCitiesOfState(deliveryDetails.country, deliveryDetails.state)
      : [];

  /* ---------------------------
     Lifecycle cleanup
  --------------------------- */
  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
      dispatch(resetShippingEstimate());
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch]);

  /* ---------------------------
     Poll M-Pesa status while waiting
  --------------------------- */
  useEffect(() => {
    if (!lastOrderId || !showLoader) return;
    pollingRef.current = window.setInterval(() => {
      dispatch(fetchPaymentStatus({ orderId: lastOrderId }));
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dispatch, lastOrderId, showLoader]);

  /* ---------------------------
     React to payment updates
  --------------------------- */
  useEffect(() => {
    if (!lastPayment || !lastOrderId) return;

    if (lastPayment.paymentStatus === "paid") {
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.success("Payment successful!");
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

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [paymentError]);

  /* ---------------------------
    Fetch shipping estimate (debounced)
     - triggers when address text or shipping method or cart items change
  --------------------------- */
  useEffect(() => {
    // require an address string and at least one cart item
    if (!deliveryDetails.address || cartItems.length === 0) return;

    // debounce to avoid spamming backend while user types
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
      ).catch((e) => {
        // swallow; fetchShippingEstimate already sets error in slice
        console.warn("Shipping estimate error:", e);
      });
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

  /* ---------------------------
     Derived totals (memoized)
  --------------------------- */
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!cartCoupon) return 0;
    return (subtotal * (cartCoupon.percentage || 0)) / 100;
  }, [cartCoupon, subtotal]);

  // shippingCost preference: backend estimate (if available) -> checkoutTotals.shippingCost -> 0
  const effectiveShippingCost = useMemo(() => {
    if (shippingEstimate?.shippingCost != null) return Number(shippingEstimate.shippingCost);
    if (checkoutTotals?.shippingCost != null) return Number(checkoutTotals.shippingCost);
    return 0;
  }, [shippingEstimate, checkoutTotals]);

  const totalAmount = useMemo(() => {
    const total = Math.max(0, subtotal - discountAmount + effectiveShippingCost);
    return Number(total);
  }, [subtotal, discountAmount, effectiveShippingCost]);

  /* ---------------------------
     Handlers
  --------------------------- */
  const handleApplyDiscount = () => {
    if (discountCode.trim().toLowerCase() === "save10") {
      dispatch(applyCoupon({ code: discountCode.trim().toUpperCase(), percentage: 10 }));
      toast.success("Discount applied: 10% off");
      setDiscountCode("");
    } else {
      toast.error("Invalid discount code");
    }
  };

  const handleRemoveDiscount = () => {
    dispatch(removeCoupon());
    setDiscountCode("");
    toast.info("Discount removed");
  };

  const normalizePhone = (phone: string) => {
    let s = phone.replace(/\s+/g, "").replace(/\D/g, "");
    if (s.startsWith("0")) s = "254" + s.slice(1);
    else if (/^[17]/.test(s)) s = "254" + s;
    return s;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartItems.length) return toast.error("Your cart is empty.");
    if (!deliveryDetails.address) return toast.error("Enter your address.");

    let sanitizedPhone = deliveryDetails.phone.trim();
    if (paymentMethod === "mpesa") {
      sanitizedPhone = normalizePhone(sanitizedPhone);
      if (!/^254(7|1)\d{8}$/.test(sanitizedPhone))
        return toast.error("Invalid phone number. Use 07XXXXXXXX or 01XXXXXXXX.");
    }

    const shippingCostToUse = shippingEstimate?.shippingCost ?? checkoutTotals.shippingCost ?? 0;

    const orderPayload: OrderPayload = {
      items: cartItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
      deliveryDetails: { ...deliveryDetails, phone: sanitizedPhone },
      paymentMethod,
      coupon: cartCoupon?.code ?? null,
      shippingCost: shippingCostToUse,
    };

    try {
      const order = await dispatch(submitCartOrder(orderPayload)).unwrap();

      if (paymentMethod === "mpesa") {
        setShowLoader(true);
        await dispatch(initiateMpesaPayment({ orderId: order._id, phoneNumber: sanitizedPhone })).unwrap();
        toast.info("Check your phone to complete the M-Pesa payment.");
        setLastOrderId(order._id);
      } else {
        toast.success("Order placed successfully!");
        navigate("/thank-you", { state: { orderId: order._id, totalAmount: order.totalAmount } });
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setShowLoader(false);
      toast.error(err?.message || "Failed to process your order.");
    }
  };

  const estDelivery = shippingEstimate?.estimatedDeliveryDate
    ? new Date(shippingEstimate.estimatedDeliveryDate).toDateString()
    : null;

  /* ---------------------------
     Render
  --------------------------- */
  return (
    <>
      <Header />
      <section className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen relative">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">Checkout</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 md:p-10 rounded-2xl shadow-xl space-y-10 border border-gray-100">
            {/* Shipping Address */}
            <div>
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b">1. Shipping Address</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Country</label>
                  <select className="w-full border p-3 rounded-xl" value={deliveryDetails.country}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, country: e.target.value, state: "", city: "" })}>
                    <option value="">Select Country</option>
                    {availableCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">State</label>
                  <select className="w-full border p-3 rounded-xl" value={deliveryDetails.state} disabled={!deliveryDetails.country}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value, city: "" })}>
                    <option value="">Select State</option>
                    {availableStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm mb-1">City</label>
                  <select className="w-full border p-3 rounded-xl" value={deliveryDetails.city} disabled={!deliveryDetails.state}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}>
                    <option value="">Select City</option>
                    {availableCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <input type="text" placeholder="+254 7XX XXX XXX" className="w-full border p-3 rounded-xl"
                    value={deliveryDetails.phone} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })} required />
                </div>
              </div>

              <label className="block mb-1 mt-4 text-sm font-medium">Address</label>
              <textarea rows={3} className="w-full border p-3 rounded-xl" value={deliveryDetails.address}
                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })} required />
            </div>

            {/* Shipping Method */}
            <div>
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b">2. Shipping Method</h3>
              <div className="space-y-3">
                {["standard", "express"].map(method => (
                  <label key={method} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="shipping" checked={deliveryDetails.shippingMethod === method}
                      onChange={() => setDeliveryDetails({ ...deliveryDetails, shippingMethod: method as any })} />
                    <div>
                      <p className="font-semibold capitalize">{method}</p>
                      <p className="text-sm text-gray-500">{method === "express" ? "1–2 days" : "3–5 days"}</p>
                    </div>
                  </label>
                ))}
              </div>

              {shippingLoading ? (
                <p className="text-sm text-gray-500 mt-2">Calculating shipping...</p>
              ) : shippingEstimate ? (
                <p className="mt-2 text-sm text-green-700">Estimated: Ksh {shippingEstimate.shippingCost.toFixed(2)} — Delivery by {estDelivery}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Shipping will be calculated from your address.</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b">3. Payment Method</h3>
              <div className="space-y-3">
                {[
                  { method: "cod", label: "Cash on Delivery", icon: <MdAttachMoney /> },
                  { method: "mpesa", label: "M-Pesa", icon: <MdPayment /> },
                ].map(opt => (
                  <label key={opt.method} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentMethod === opt.method}
                      onChange={() => setPaymentMethod(opt.method as PaymentMethod)} />
                    <div className="flex items-center gap-2">{opt.icon}<span>{opt.label}</span></div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={paymentLoading || showLoader}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
              {paymentLoading || showLoader ? "Processing..." : `Pay Ksh ${totalAmount.toFixed(2)} & Place Order`}
            </button>
          </form>

          {/* ORDER SUMMARY */}
          <aside className="bg-white p-6 rounded-2xl shadow-xl space-y-6 border border-gray-100">
            <h3 className="text-2xl font-bold mb-4">Order Summary</h3>

            <ul className="divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item._id} className="py-2 flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between pt-4 border-t">
              <span>Shipping</span>
              <span>Ksh {(effectiveShippingCost || 0).toFixed(2)}</span>
            </div>

            {cartCoupon && (
              <div className="flex justify-between pt-2 text-green-600">
                <span>Discount ({cartCoupon.code})</span>
                <span>-Ksh {((subtotal * cartCoupon.percentage) / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="pt-4 border-t text-xl font-bold flex justify-between">
              <span>Total</span>
              <span>Ksh {totalAmount.toFixed(2)}</span>
            </div>

            {/* Coupon */}
            <div className="mt-4 space-y-2">
              {!cartCoupon ? (
                <div className="flex gap-2">
                  <input type="text" placeholder="Discount code" value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)} className="flex-1 border p-2 rounded-lg" />
                  <button type="button" onClick={handleApplyDiscount} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Apply</button>
                </div>
              ) : (
                <button type="button" onClick={handleRemoveDiscount} className="bg-red-600 text-white px-4 py-2 rounded-lg w-full">Remove Discount</button>
              )}
            </div>
          </aside>
        </div>

        {(paymentLoading || showLoader) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <p className="text-lg font-semibold">Waiting for payment confirmation...</p>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
