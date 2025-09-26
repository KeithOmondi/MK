// src/pages/MyOrders.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MdLocalShipping,
  MdCancel,
  MdShoppingCart,
  MdPending,
} from "react-icons/md";
import type { AppDispatch } from "../../redux/store";
import {
  fetchOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from "../../redux/slices/orderSlice";

// ✅ Supported filters
type FilterStatus = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const MyOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status.toLowerCase() === filter;
  });

  if (loading)
    return <p className="text-center text-gray-500 py-10 text-lg">Loading orders...</p>;

  if (error)
    return <p className="text-center text-red-600 py-10 text-lg">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as FilterStatus)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? status === "all"
                    ? "bg-blue-600 text-white"
                    : status === "delivered"
                    ? "bg-green-600 text-white"
                    : status === "cancelled"
                    ? "bg-red-600 text-white"
                    : status === "shipped"
                    ? "bg-purple-600 text-white"
                    : status === "processing"
                    ? "bg-indigo-600 text-white"
                    : "bg-yellow-500 text-white"
                  : "bg-white border text-gray-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Order Info */}
              <div>
                <p className="text-gray-700 font-semibold">Order #{order._id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-lg font-bold text-gray-900">
                  Total: Ksh {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {order.status === "Delivered" && (
                  <MdLocalShipping className="text-green-600" size={24} />
                )}
                {order.status === "Cancelled" && (
                  <MdCancel className="text-red-600" size={24} />
                )}
                {order.status === "Pending" && (
                  <MdShoppingCart className="text-yellow-500" size={24} />
                )}
                {order.status === "Processing" && (
                  <MdPending className="text-indigo-600" size={24} />
                )}
                {order.status === "Shipped" && (
                  <MdLocalShipping className="text-purple-600" size={24} />
                )}
                <span className="font-medium">{order.status}</span>
              </div>

              {/* View Details */}
              <Link
                to={`/user/orders/${order._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
