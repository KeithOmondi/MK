// src/pages/OrderDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  fetchOrderById,
  requestRefund,
  cancelOrder,
  selectOrderById,
  selectOrderLoading,
  selectOrderError,
} from "../../redux/slices/orderSlice";

import {
  addReview as addReviewSlice,
} from "../../redux/slices/reviewSlice";

import type { AppDispatch, RootState } from "../../redux/store";

/* ===========================
   ⭐ Star Rating Component
=========================== */
const StarRating: React.FC<{
  rating: number;
  setRating?: (r: number) => void;
  size?: string;
  readOnly?: boolean;
}> = ({ rating, setRating, size = "text-2xl", readOnly = false }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating && !readOnly && setRating(star)}
        className={`${size} ${
          star <= rating
            ? "text-yellow-500"
            : "text-gray-300 hover:text-yellow-400"
        } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        disabled={readOnly}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </button>
    ))}
  </div>
);

/* ===========================
   💬 Status Helpers
=========================== */
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-800 border-green-400";
    case "Processing": return "bg-blue-100 text-blue-800 border-blue-400";
    case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "Cancelled":
    case "Refunded": return "bg-red-100 text-red-800 border-red-400";
    default: return "bg-gray-100 text-gray-800 border-gray-400";
  }
};

const getDeliveryClasses = (status: string) => {
  switch (status) {
    case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "In Transit": return "bg-blue-100 text-blue-800 border-blue-400";
    case "Delivered": return "bg-green-100 text-green-800 border-green-400";
    case "Delayed": return "bg-orange-100 text-orange-800 border-orange-400";
    default: return "bg-gray-100 text-gray-800 border-gray-400";
  }
};

/* ===========================
   🧾 Order Details Page
=========================== */
const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const order = useSelector((state: RootState) => selectOrderById(state, id!));
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [reviewStates, setReviewStates] = useState<Record<string, { rating: number; comment: string }>>({});
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundReasonOther, setRefundReasonOther] = useState("");


  /* ============= Fetch Order ============= */
  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  /* ============= Review Handling ============= */
  const handleReviewChange = (productId: string, key: "rating" | "comment", value: number | string) => {
    setReviewStates(prev => ({ ...prev, [productId]: { ...prev[productId], [key]: value } }));
  };

  const handleReviewSubmit = (product: any) => {
    const productId = product?._id;
    const rating = reviewStates[productId]?.rating || 0;
    const comment = reviewStates[productId]?.comment?.trim() || "";
    if (!rating || !comment) return toast.error("Please provide both rating and comment.");

    dispatch(addReviewSlice({ productId, orderId: id!, rating, comment }))
      .unwrap()
      .then(() => toast.success("Review submitted successfully!"))
      .catch((err) => toast.error(err));
  };

  /* ============= Cancel & Refund ============= */
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrder(id!))
        .unwrap()
        .then(() => {
          toast.success("Order cancelled.");
          navigate("/user/orders");
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleRefundClick = () => setRefundModalOpen(true);

  const handleRefundSubmit = () => {
  const reason = refundReason === "Other" ? refundReasonOther.trim() : refundReason;
  if (!reason) return toast.error("Please provide a reason for the refund.");
  dispatch(requestRefund({ orderId: id!, reason }))
    .unwrap()
    .then(() => {
      toast.success("Refund request sent successfully.");
      setRefundReason("");
      setRefundReasonOther("");
      setRefundModalOpen(false);
      navigate("/user/orders");
    })
    .catch((err) => toast.error(err));
};

  /* ============= Render States ============= */
  if (loading) return <p className="text-center py-10 text-blue-600">Loading order details...</p>;
  if (error) return <p className="text-center text-red-600 py-10">Error: {error}</p>;
  if (!order) return <p className="text-center text-gray-500 py-10">Order not found.</p>;

  const delivery = order.deliveryDetails || {};
  const statusClasses = getStatusClasses(order.status || "");
  const deliveryClasses = getDeliveryClasses(order.deliveryStatus || "");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order #{order._id?.slice(0, 8)}</h1>
        <div className="flex gap-3 flex-wrap justify-center">
          <span className={`px-3 py-1 rounded-full font-semibold border-2 ${statusClasses}`}>{order.status}</span>
          <span className={`px-3 py-1 rounded-full font-semibold border-2 ${deliveryClasses}`}>Delivery: {order.deliveryStatus}</span>
          {(order.status === "Pending" || order.status === "Processing") && (
            <button onClick={handleCancel} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Cancel Order</button>
          )}
          {order.status === "Delivered" && (
            <button onClick={handleRefundClick} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Request Refund</button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Items in Your Order</h2>
          {order.items.map((item: any, idx: number) => {
            const product = item.product || {};
            const review = reviewStates[product._id] || { rating: 0, comment: "" };

            return (
              <div key={`${product._id}-${idx}`} className="bg-white border rounded-xl p-5 shadow-md hover:shadow-lg flex flex-col md:flex-row gap-5">
                <div className="flex items-center gap-4 w-full md:w-2/3">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded text-gray-400">No Image</div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-green-700 font-semibold">Ksh {item.price.toFixed(2)}</p>
                  </div>
                </div>

                {order.status === "Delivered" && (
                  <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                    <p className="font-semibold mb-2">Leave a Review</p>
                    <StarRating rating={review.rating} setRating={(r) => handleReviewChange(product._id, "rating", r)} />
                    <textarea
                      value={review.comment}
                      onChange={(e) => handleReviewChange(product._id, "comment", e.target.value)}
                      className="border rounded w-full p-2 mt-2 text-sm"
                      placeholder="Write a comment..."
                      rows={2}
                    />
                    <button onClick={() => handleReviewSubmit(product)} className="mt-2 w-full bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700">Submit Review</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-teal-500">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Order Summary</h2>
            <div className="flex justify-between py-1 text-sm"><span>Subtotal:</span><span>Ksh {order.totalAmount?.toFixed(2) || "0.00"}</span></div>
            <div className="flex justify-between py-1 text-sm"><span>Shipping Method:</span><span className="capitalize">{order.shippingMethod}</span></div>
            <div className="flex justify-between py-1 text-sm"><span>Shipping Distance:</span><span>{order.shippingDistance} km</span></div>
            <div className="flex justify-between py-1 text-sm"><span>Shipping Cost:</span><span>{order.shippingCost === 0 ? "Free" : `Ksh ${order.shippingCost?.toFixed(2)}`}</span></div>
            <div className="flex justify-between pt-3 font-semibold text-lg border-t mt-3"><span>Total:</span><span className="text-green-700">Ksh {(order.totalAmount + order.shippingCost).toFixed(2)}</span></div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Delivery Details</h2>
            <p className="font-semibold">{delivery.address}</p>
            <p>{delivery.city}</p>
            <p className="text-gray-600 mt-1">Phone: {delivery.phone}</p>
            <hr className="my-3" />
            <p><span className="font-semibold">Estimated Delivery:</span> {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : "N/A"}</p>
            {order.deliveredAt && <p><span className="font-semibold">Delivered On:</span> {new Date(order.deliveredAt).toLocaleDateString()}</p>}
            {Number(order.deliveryDuration) > 0 && <p><span className="font-semibold">Delivery Duration:</span> {order.deliveryDuration} day(s)</p>}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
{refundModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Refund</h2>

      <label className="block mb-2 font-medium text-gray-700">Select Reason</label>
      <select
        value={refundReason}
        onChange={(e) => setRefundReason(e.target.value)}
        className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">-- Choose a reason --</option>
        <option value="Item not delivered">Item not delivered</option>
        <option value="Wrong item received">Wrong item received</option>
        <option value="Item damaged">Item damaged</option>
        <option value="Item not as described">Item not as described</option>
        <option value="Changed mind">Changed mind</option>
        <option value="Other">Other</option>
      </select>

      {/* Optional textarea if "Other" is selected */}
      {refundReason === "Other" && (
        <textarea
          value={refundReasonOther}
          onChange={(e) => setRefundReasonOther(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="Please specify your reason..."
        />
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setRefundModalOpen(false);
            setRefundReason("");
            setRefundReasonOther("");
          }}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleRefundSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Submit Refund
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default OrderDetails;
