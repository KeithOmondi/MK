// src/pages/MyOrders.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MdLocalShipping,
  MdCancel,
  MdPending,
  MdCheckCircle,
  MdOutlinePayment,
  MdInfoOutline,
  MdHistory, // Added a common icon for the loading state
} from "react-icons/md";
import type { AppDispatch } from "../../redux/store";
import {
  fetchOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  type Order, // Import the Order type for clarity
} from "../../redux/slices/orderSlice";

// ===================================
// Helper Functions
// ===================================

interface StatusConfig {
  icon: React.ElementType;
  classes: string;
  text: string;
}

const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "Delivered":
      return {
        icon: MdCheckCircle,
        classes: "bg-green-100 text-green-700 border-green-400",
        text: "Delivered",
      };
    case "Shipped":
      return {
        icon: MdLocalShipping,
        classes: "bg-blue-100 text-blue-700 border-blue-400",
        text: "Shipped",
      };
    case "Processing":
      return {
        icon: MdOutlinePayment,
        classes: "bg-indigo-100 text-indigo-700 border-indigo-400",
        text: "Processing",
      };
    case "Pending":
      return {
        icon: MdPending,
        classes: "bg-yellow-100 text-yellow-700 border-yellow-400",
        text: "Pending Payment",
      };
    case "Cancelled":
      return {
        icon: MdCancel,
        classes: "bg-red-100 text-red-700 border-red-400",
        text: "Cancelled",
      };
    case "Refunded":
      return {
        icon: MdCancel,
        classes: "bg-red-100 text-red-700 border-red-400",
        text: "Refunded",
      };
    default:
      return {
        icon: MdInfoOutline,
        classes: "bg-gray-100 text-gray-700 border-gray-400",
        text: status || "Unknown",
      };
  }
};

// ===================================
// Order Card Component
// ===================================

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const { icon: Icon, classes, text: statusText } = getStatusConfig(order.status || "");

    return (
        <div 
            key={order._id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center"
        >
            {/* 1. Order ID & Date */}
            <div className="col-span-2 sm:col-span-1 border-r sm:pr-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order ID</p>
                {/* Displaying only the first 8 chars for brevity/readability */}
                <p className="text-base font-semibold text-gray-800 break-all">#{order._id.substring(0, 8)}...</p> 
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* 2. Total & Items */}
            <div className="border-r sm:pr-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-lg font-extrabold text-green-700">
                    Ksh {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{order.items.length} items</p>
            </div>

            {/* 3. Status Badge */}
            <div className="sm:pr-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <div className={`flex items-center gap-2 px-3 py-1 font-semibold text-xs rounded-full border ${classes}`}>
                    <Icon size={16} />
                    <span>{statusText}</span>
                </div>
            </div>

            {/* 4. Action Button */}
            <div className="col-span-2 sm:col-span-1 sm:text-right">
                <Link
                    to={`/user/orders/${order._id}`}
                    className="w-full sm:w-auto inline-block text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                    View Details →
                </Link>
            </div>
        </div>
    );
};

// ===================================
// Main Component
// ===================================

const MyOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Sort orders by date descending (most recent first)
  const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading)
    // Updated loading state for better UX
    return (
        <div className="text-center py-20">
            <MdHistory className="mx-auto text-blue-500 animate-spin" size={40} />
            <p className="text-blue-600 mt-4 text-xl font-medium">Loading your order history...</p>
        </div>
    );

  if (error)
    return <p className="text-center text-red-600 py-20 text-xl font-medium">Error loading orders: {error}</p>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-3">
        My Order History 📦
      </h1>

      <div className="space-y-6">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-xl font-medium">
                You haven't placed any orders yet.
            </p>
            <Link 
                to="/" 
                className="mt-4 inline-block px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition shadow-md"
            >
                Start Shopping
            </Link>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;