import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import { useLocation, Link } from "react-router-dom";

interface LocationState {
  orderId?: string;
  totalAmount?: number;
}

export default function ThankYou() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return (
    <>
      <Header />
      <section className="max-w-md mx-auto p-6 text-center">
        {/* ✅ Checkmark Animation */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 border-4 border-green-500 rounded-full flex items-center justify-center animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
        <p className="mb-6 text-gray-700">
          Your order has been placed successfully.
        </p>

        {state?.orderId ? (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
            <p className="mb-1">
              <span className="font-medium">Order ID:</span> {state.orderId}
            </p>
            <p className="mb-1">
              <span className="font-medium">Total Amount:</span>{" "}
              {typeof state.totalAmount === "number"
                ? `Ksh ${state.totalAmount.toFixed(2)}`
                : "N/A"}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
          {state?.orderId && (
            <Link
              to={`/orders/${state.orderId}`}
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              View Order Details
            </Link>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
