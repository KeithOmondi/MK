// src/pages/Checkout.tsx
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  submitCartOrder,
  applyCoupon,
  removeCoupon,
  setShippingCost,
  type CartItem,
} from "../../redux/slices/cartSlice";
import {
  initiateMpesaPayment,
  resetPaymentState,
  fetchPaymentStatus,
  selectPaymentLoading,
  selectPaymentError,
  selectLastPaymentStatus,
} from "../../redux/slices/paymentSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import { MdPayment, MdAttachMoney } from "react-icons/md";
import Header from "../common/Header";
import Footer from "../common/Footer";

/* ------------------------ Types ------------------------ */
type PaymentMethod = "cod" | "mpesa";

interface DeliveryDetails {
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
}

interface ShippingOption {
  label: string;
  cost: number;
  desc: string;
}



/* ------------------------ Subcomponents ------------------------ */
const DeliveryForm = ({
  deliveryDetails,
  setDeliveryDetails,
  availableCountries,
  availableStates,
  availableCities,
}: {
  deliveryDetails: DeliveryDetails;
  setDeliveryDetails: React.Dispatch<React.SetStateAction<DeliveryDetails>>;
  availableCountries: any[];
  availableStates: any[];
  availableCities: any[];
}) => (
  <div>
    <h3 className="text-2xl font-bold mb-6 pb-2 border-b flex items-center gap-2">
      <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold">
        1
      </span>
      Shipping Address
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Country</label>
        <select
          className="w-full border p-3 rounded-xl"
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
          <option value="">Select Country</option>
          {availableCountries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">State</label>
        <select
          className="w-full border p-3 rounded-xl"
          value={deliveryDetails.state}
          disabled={!deliveryDetails.country}
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
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block mb-1 text-sm font-medium">City</label>
        <select
          className="w-full border p-3 rounded-xl"
          value={deliveryDetails.city}
          disabled={!deliveryDetails.state}
          onChange={(e) =>
            setDeliveryDetails({ ...deliveryDetails, city: e.target.value })
          }
        >
          <option value="">Select City</option>
          {availableCities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Phone</label>
        <input
          type="text"
          placeholder="+254 7XX XXX XXX"
          className="w-full border p-3 rounded-xl"
          value={deliveryDetails.phone}
          onChange={(e) =>
            setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })
          }
          required
        />
      </div>
    </div>
    <label className="block mb-1 mt-4 text-sm font-medium">Street Address</label>
    <textarea
      rows={3}
      placeholder="Apartment, suite, etc."
      className="w-full border p-3 rounded-xl"
      value={deliveryDetails.address}
      onChange={(e) =>
        setDeliveryDetails({ ...deliveryDetails, address: e.target.value })
      }
      required
    />
  </div>
);

const ShippingForm = ({
  cart,
  handleShippingChange,
}: {
  cart: { shippingCost: number };
  handleShippingChange: (cost: number) => void;
}) => {
  const options: ShippingOption[] = [
    { label: "Free Shipping", cost: 0, desc: "7-10 days" },
    { label: "Standard", cost: 500, desc: "3-5 days" },
    { label: "Express", cost: 1500, desc: "1-2 days" },
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 pb-2 border-b flex items-center gap-2">
        <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold">
          2
        </span>
        Shipping
      </h3>
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.label}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name="shipping"
              checked={cart.shippingCost === opt.cost}
              onChange={() => handleShippingChange(opt.cost)}
            />
            <div>
              <p className="font-semibold">{opt.label}</p>
              <p className="text-sm text-gray-500">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const PaymentForm = ({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: PaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
}) => {
  const options = [
    { method: "cod", label: "Cash on Delivery", icon: <MdAttachMoney /> },
    { method: "mpesa", label: "M-Pesa", icon: <MdPayment /> },
  ] as const;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 pb-2 border-b flex items-center gap-2">
        <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold">
          3
        </span>
        Payment Method
      </h3>
      <div className="space-y-3">
        {options.map((opt) => (
          <label
            key={opt.method}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === opt.method}
              onChange={() => setPaymentMethod(opt.method as PaymentMethod)}
            />
            <div className="flex items-center gap-2">
              {opt.icon}
              <span>{opt.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const OrderSummary = ({
  cart,
  discountCode,
  setDiscountCode,
  handleApplyDiscount,
  handleRemoveDiscount,
}: {
  cart: {
    items: CartItem[];
    totalAmount: number;
    shippingCost: number;
    coupon?: { code: string; percentage: number } | null;
  };
  discountCode: string;
  setDiscountCode: React.Dispatch<React.SetStateAction<string>>;
  handleApplyDiscount: () => void;
  handleRemoveDiscount: () => void;
}) => (
  <aside className="bg-white p-6 rounded-2xl shadow-xl space-y-6 border border-gray-100">
    <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
    <ul className="divide-y divide-gray-200">
      {cart.items.map((item) => (
        <li key={item._id} className="py-2 flex justify-between">
          <span>
            {item.name} x {item.quantity}
          </span>
          <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
        </li>
      ))}
    </ul>
    <div className="flex justify-between pt-4 border-t border-gray-200">
      <span>Shipping</span>
      <span>Ksh {cart.shippingCost.toFixed(2)}</span>
    </div>
    {cart.coupon && (
      <div className="flex justify-between pt-2 text-green-600">
        <span>Discount ({cart.coupon.code})</span>
        <span>-{cart.coupon.percentage}%</span>
      </div>
    )}
    <div className="pt-4 border-t border-gray-200 text-xl font-bold flex justify-between">
      <span>Total</span>
      <span>Ksh {cart.totalAmount.toFixed(2)}</span>
    </div>
    <div className="mt-4 space-y-2">
      {!cart.coupon ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="flex-1 border p-2 rounded-lg"
          />
          <button
            type="button"
            onClick={handleApplyDiscount}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Apply
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleRemoveDiscount}
          className="bg-red-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Remove Discount
        </button>
      )}
    </div>
  </aside>
);

/* ------------------------ Main Component ------------------------ */
export default function Checkout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const cart = useSelector((state: RootState) => state.cart);
  const paymentLoading = useSelector(selectPaymentLoading);
  const paymentError = useSelector(selectPaymentError);
  const lastPayment = useSelector(selectLastPaymentStatus);

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    country: "KE",
    state: "",
    city: "",
    address: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  const pollingRef = useRef<number | null>(null);

  const availableCountries = Country.getAllCountries();
  const availableStates = deliveryDetails.country
    ? State.getStatesOfCountry(deliveryDetails.country)
    : [];
  const availableCities =
    deliveryDetails.country && deliveryDetails.state
      ? City.getCitiesOfState(deliveryDetails.country, deliveryDetails.state)
      : [];

  /* ------------------------ Effects ------------------------ */
  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!lastOrderId || !showLoader) return;
    pollingRef.current = window.setInterval(() => {
      dispatch(fetchPaymentStatus({ orderId: lastOrderId }));
    }, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dispatch, lastOrderId, showLoader]);

  useEffect(() => {
    if (!lastPayment || !lastOrderId) return;
    const status = lastPayment.paymentStatus;
    if (status === "paid") {
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.success("Payment successful!");
      navigate("/thank-you", {
        state: {
          orderId: lastOrderId,
          totalAmount: lastPayment.totalAmount ?? cart.totalAmount,
          transactionId: lastPayment.transactionId,
        },
      });
    } else if (status === "failed" || status === "refunded") {
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
      toast.error("Payment was not completed. Please try again.");
    }
  }, [lastPayment, lastOrderId, navigate, cart.totalAmount]);

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
      setShowLoader(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [paymentError]);

  /* ------------------------ Handlers ------------------------ */
  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === "save10") {
      dispatch(
        applyCoupon({ code: discountCode.toUpperCase(), percentage: 10 })
      );
      toast.success("Discount applied: 10% off");
    } else toast.error("Invalid discount code");
  };

  const handleRemoveDiscount = () => {
    dispatch(removeCoupon());
    setDiscountCode("");
    toast.info("Discount removed");
  };

  const handleShippingChange = (cost: number) => {
    dispatch(setShippingCost(cost));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!cart.items?.length) {
    toast.error("Your cart is empty.");
    return;
  }

  // Sanitize phone number for M-Pesa
  let sanitizedPhone = deliveryDetails.phone;
  if (paymentMethod === "mpesa") {
    if (!sanitizedPhone) {
      toast.error("Please enter a phone number for M-Pesa.");
      return;
    }
    sanitizedPhone = sanitizedPhone.replace(/^0/, "254").replace(/\D/g, "");
    if (!/^2547\d{8}$/.test(sanitizedPhone)) {
      toast.error("Invalid phone number. Use 07XXXXXXXX or 2547XXXXXXXX.");
      return;
    }
  }

  // Build type-safe payload
  const orderPayload = {
    cartItems: cart.items
      .filter((i) => i.supplier)
      .map((i) => ({ productId: i._id, quantity: i.quantity })),
    deliveryDetails: { ...deliveryDetails, phone: sanitizedPhone },
    shippingCost: Number(cart.shippingCost),
    coupon: cart.coupon || null,
    paymentMethod,
  };

  try {
    const orderResult = await dispatch(submitCartOrder(orderPayload)).unwrap();

    if (paymentMethod === "mpesa") {
      await dispatch(
        initiateMpesaPayment({
          orderId: orderResult._id,
          phoneNumber: sanitizedPhone,
        })
      ).unwrap();

      setShowLoader(true);
      setLastOrderId(orderResult._id);
      toast.info("Enter your PIN on your phone to complete payment.");
    } else {
      toast.success("Order placed successfully!");
      navigate("/thank-you", {
        state: { orderId: orderResult._id, totalAmount: orderResult.totalAmount },
      });
    }
  } catch (err: any) {
    console.error("Checkout error:", err);
    toast.error(err?.message || "Failed to place order");
  }
};



  /* ------------------------ Render ------------------------ */
  return (
    <>
      <Header />
      <section className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen relative">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Checkout
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white p-6 md:p-10 rounded-2xl shadow-xl space-y-10 border border-gray-100"
          >
            <DeliveryForm
              deliveryDetails={deliveryDetails}
              setDeliveryDetails={setDeliveryDetails}
              availableCountries={availableCountries}
              availableStates={availableStates}
              availableCities={availableCities}
            />
            <ShippingForm
              cart={cart}
              handleShippingChange={handleShippingChange}
            />
            <PaymentForm
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
            <button
              type="submit"
              disabled={paymentLoading || !cart.items.length || showLoader}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {paymentLoading || showLoader
                ? "Processing..."
                : `Pay Ksh ${cart.totalAmount.toFixed(2)} & Place Order`}
            </button>
          </form>
          <OrderSummary
            cart={cart}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            handleApplyDiscount={handleApplyDiscount}
            handleRemoveDiscount={handleRemoveDiscount}
          />
        </div>
        {(paymentLoading || showLoader) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <p className="text-lg font-semibold">
                Waiting for payment confirmation...
              </p>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
