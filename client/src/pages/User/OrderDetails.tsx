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
  selectReviewsByProduct,
} from "../../redux/slices/reviewSlice";

import type { AppDispatch, RootState } from "../../redux/store";
import type { Review as ReviewSliceType } from "../../redux/slices/reviewSlice";

// ------------------------ Types ------------------------
interface Product {
  _id: string;
  name: string;
  image?: string;
  price: number;
}


interface ProductReviewState {
  [productId: string]: {
    rating: number;
    comment: string;
  };
}

// ------------------------ Star Rating Component ------------------------
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
        className={`${size} transition-colors ${
          star <= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
        } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        disabled={readOnly}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </button>
    ))}
  </div>
);

// ------------------------ Status Badge Helpers ------------------------
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-400";
    case "Processing":
      return "bg-blue-100 text-blue-800 border-blue-400";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    case "Cancelled":
    case "Refunded":
      return "bg-red-100 text-red-800 border-red-400";
    default:
      return "bg-gray-100 text-gray-800 border-gray-400";
  }
};

const getEscrowClasses = (status: "Held" | "Released" | "Refunded") => {
  switch (status) {
    case "Held":
      return "bg-yellow-200 text-yellow-800";
    case "Released":
      return "bg-green-200 text-green-800";
    case "Refunded":
      return "bg-red-200 text-red-800";
  }
};

// ------------------------ Main Component ------------------------
const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const order = useSelector((state: RootState) => selectOrderById(state, id!));
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [productReviewStates, setProductReviewStates] = useState<ProductReviewState>({});

  // Precompute reviews for all products
  const reviewsByProduct = useSelector((state: RootState) => {
    const obj: Record<string, ReviewSliceType[]> = {};
    order?.items.forEach((item) => {
      obj[item.productId] = selectReviewsByProduct(item.productId)(state);
    });
    return obj;
  });

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  // ------------------------ Handlers ------------------------
  const handleReviewChange = (productId: string, key: "rating" | "comment", value: number | string) => {
    setProductReviewStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [key]: value },
    }));
  };

  const handleReviewSubmit = (productId: string) => {
    if (order?.status !== "Delivered") {
      toast.error("You can only review delivered products.");
      return;
    }

    const reviewState = productReviewStates[productId];
    const rating = reviewState?.rating || 0;
    const comment = reviewState?.comment?.trim() || "";

    if (!rating || !comment) {
      toast.error("Please provide both rating and comment.");
      return;
    }

    dispatch(
      addReviewSlice({
        productId,
        orderId: id!,
        rating,
        comment,
      })
    )
      .unwrap()
      .then(() => toast.success("Review submitted!"))
      .catch((err) => toast.error(err));

    setProductReviewStates((prev) => ({
      ...prev,
      [productId]: { rating: 0, comment: "" },
    }));
  };

  const handleRefund = () => {
    if (window.confirm("Request a refund for this order?")) {
      dispatch(requestRefund(id!))
        .unwrap()
        .then(() => {
          toast.success("Refund request sent.");
          navigate("/user/orders");
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel this order? This action cannot be undone.")) {
      dispatch(cancelOrder(id!))
        .unwrap()
        .then(() => {
          toast.success("Order cancelled.");
          navigate("/user/orders");
        })
        .catch((err) => toast.error(err));
    }
  };

  // ------------------------ Render ------------------------
  if (loading) return <p className="text-center py-10 text-lg text-blue-600">Loading order details...</p>;
  if (error) return <p className="text-center text-xl text-red-600 font-medium p-10">Error: {error}</p>;
  if (!order) return <p className="text-center text-xl text-gray-500 p-10">Order not found.</p>;

  const delivery = order.deliveryDetails || {};
  const statusClasses = getStatusClasses(order.status || "");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <h1 className="text-3xl font-extrabold text-gray-800">Order #{order._id?.substring(0, 8)}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`px-4 py-1.5 font-semibold text-sm rounded-full uppercase tracking-wider border-2 ${statusClasses}`}
          >
            {order.status}
          </span>
          {(order.status === "Pending" || order.status === "Processing") && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel Order ❌
            </button>
          )}
          {order.status === "Delivered" && (
            <button
              onClick={handleRefund}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Request Refund ↩️
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Items in Your Order</h2>
          {order.items.map((item, index) => {
            // Type guard for product object
            const product: Product =
              typeof item.productId === "object"
                ? item.productId
                : { _id: item.productId, name: "Product", image: "", price: item.price };

            const existingReview = reviewsByProduct[item.productId]?.find(
              (r: ReviewSliceType) => r.orderId === order._id
            );

            const currentRating = productReviewStates[item.productId]?.rating || 0;
            const currentComment = productReviewStates[item.productId]?.comment || "";

            return (
              <div
                key={`${item.productId}-${index}`}
                className="bg-white border rounded-xl p-5 flex flex-col md:flex-row gap-5 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-4 w-full md:w-2/3">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg border" />
                  )}
                  <div>
                    <p className="font-extrabold text-lg text-gray-900 mb-1">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: <span className="font-semibold">{item.quantity}</span>
                    </p>
                    <p className="text-md font-bold text-green-700">Ksh {product.price.toFixed(2)}</p>
                    {item.escrowStatus && (
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getEscrowClasses(item.escrowStatus)}`}>
                        Escrow: {item.escrowStatus}
                      </span>
                    )}
                  </div>
                </div>

                {order.status === "Delivered" && (
                  <div className="w-full md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-5">
                    {existingReview ? (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          Your Review <span className="text-xs text-green-600">(Submitted)</span>
                        </p>
                        <StarRating rating={existingReview.rating} readOnly size="text-xl" />
                        <p className="text-sm text-gray-600 mt-2 italic">"{existingReview.comment}"</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-700 mb-2">Leave a Review</p>
                        <StarRating
                          rating={currentRating}
                          setRating={(r) => handleReviewChange(item.productId, "rating", r)}
                        />
                        <textarea
                          value={currentComment}
                          onChange={(e) => handleReviewChange(item.productId, "comment", e.target.value)}
                          placeholder="Tell us what you think..."
                          rows={2}
                          className="w-full border rounded-lg p-3 my-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleReviewSubmit(item.productId)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Post Review ✨
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary & Address */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-xl rounded-xl p-6 border-l-4 border-teal-500">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Order Date:</span>
                <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Total Items:</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Shipping Cost:</span>
                <span>Ksh {order.shippingCost?.toFixed(2) || "0.00"}</span>
              </div>
              {order.coupon && (
                <div className="flex justify-between border-b pb-2 text-red-500">
                  <span className="font-semibold">Coupon ({order.coupon.percentage}% OFF):</span>
                  <span>
                    - Ksh{" "}
                    {(
                      (order.totalAmount / (1 - order.coupon.percentage / 100)) *
                      (order.coupon.percentage / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-lg font-extrabold text-gray-900">Final Total:</span>
                <span className="text-lg font-extrabold text-green-700">
                  Ksh {order.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Delivery Address</h2>
            <p className="font-semibold text-gray-800">{delivery.address || "Address not provided"}</p>
            <p className="text-gray-600">{delivery.city || "N/A"}</p>
            <p className="text-gray-600 mt-2 font-medium">Phone: {delivery.phone || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
