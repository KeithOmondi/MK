import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateOrderStatus,
  deleteOrder,
  fetchOrderPaymentStatus,
  type Order,
} from "../../redux/slices/orderSlice";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../redux/store";

// =========================
// Helpers
// =========================

// Status badge with distinct colors
const getStatusBadge = (status: string) => {
  let classes = "bg-gray-100 text-gray-800";
  switch (status) {
    case "Pending":
      classes = "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400";
      break;
    case "Approved":
      classes = "bg-green-100 text-green-700 ring-1 ring-green-400";
      break;
    case "Rejected":
      classes = "bg-red-100 text-red-700 ring-1 ring-red-400";
      break;
    case "Shipped":
      classes = "bg-blue-100 text-blue-700 ring-1 ring-blue-400";
      break;
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${classes}`}
    >
      {status}
    </span>
  );
};

// Payment status badge
const getPaymentBadge = (status?: string) => {
  if (!status) return getStatusBadge("Pending");
  switch (status.toLowerCase()) {
    case "paid":
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          Paid
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Failed
        </span>
      );
    case "refunded":
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          Refunded
        </span>
      );
    default:
      return getStatusBadge(status);
  }
};

// Primary action button
const PrimaryButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-gray-200 transition duration-150 ${className}`}
    title={typeof children === "string" ? children : "Action"}
  >
    {children}
  </button>
);

// Reusable Detail Item
const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <strong className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </strong>
    <p className="mt-1 text-base font-medium text-gray-900">{children}</p>
  </div>
);

// =========================
// Main Component
// =========================
const AdminOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  // Fetch all orders on mount
  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Show errors via toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Fetch payment status when an order is selected
  useEffect(() => {
    if (selectedOrderId) dispatch(fetchOrderPaymentStatus(selectedOrderId));
  }, [dispatch, selectedOrderId]);

  // Update order status
  const handleUpdateStatus = (id: string, status: string) => {
    dispatch(updateOrderStatus({ orderId: id, status }))
      .unwrap()
      .then(() => toast.success(`Order status updated to ${status}`))
      .catch((err) => toast.error(err));
  };

  // Delete order with confirmation
  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action is irreversible."
      )
    ) {
      dispatch(deleteOrder(id))
        .unwrap()
        .then(() => toast.success("Order deleted successfully!"))
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-2 text-gray-900 flex items-center">
        Orders Management 📈
      </h1>
      <p className="text-gray-500 mb-8">
        Review and manage all customer orders.
      </p>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center p-10 bg-white rounded-xl shadow-md">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-indigo-600 font-medium">
            Fetching the latest orders...
          </span>
        </div>
      )}

      {/* No orders */}
      {!loading && orders.length === 0 && (
        <div className="p-10 text-center bg-white rounded-xl shadow-md">
          <p className="text-gray-600 text-lg font-medium">
            No orders found yet. Time for a coffee break! ☕
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-indigo-600 text-white shadow-lg">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Buyer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm tracking-wider uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {orders.map((order: Order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-indigo-50/50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {typeof order.buyer === "string"
                        ? order.buyer
                        : order.buyer?.name || order.buyer?.email || "Unknown Buyer"}
                    </td>
                    <td className="px-6 py-4">
                      {typeof order.supplier === "string"
                        ? order.supplier
                        : order.supplier?.shopName || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      KSh {(order.totalAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{order.paymentMethod || "—"}</td>
                    <td className="px-6 py-4">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 flex gap-1 justify-center items-center">
                      {order.status === "Pending" && (
                        <>
                          <PrimaryButton
                            onClick={() => handleUpdateStatus(order._id, "Approved")}
                            className="text-green-600 hover:text-white hover:bg-green-500"
                          >
                            ✔
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={() => handleUpdateStatus(order._id, "Rejected")}
                            className="text-red-600 hover:text-white hover:bg-red-500"
                          >
                            ✖
                          </PrimaryButton>
                        </>
                      )}
                      <PrimaryButton
                        onClick={() => setSelectedOrderId(order._id)}
                        className="text-blue-600 hover:text-white hover:bg-blue-500"
                      >
                        ℹ
                      </PrimaryButton>
                      <PrimaryButton
                        onClick={() => handleDelete(order._id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        🗑
                      </PrimaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedOrderId && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform scale-100 transition-transform duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Order Details:{" "}
                <span className="text-indigo-600 font-mono text-xl">
                  {selectedOrder._id.substring(0, 8)}...
                </span>
              </h2>
              <PrimaryButton
                onClick={() => setSelectedOrderId(null)}
                className="text-gray-500 hover:bg-gray-100"
              >
                ✖
              </PrimaryButton>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* General Info */}
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <DetailItem label="Buyer">
                  {typeof selectedOrder.buyer === "string"
                    ? selectedOrder.buyer
                    : selectedOrder.buyer?.name ||
                      selectedOrder.buyer?.email ||
                      "N/A"}
                </DetailItem>
                <DetailItem label="Supplier">
                  {typeof selectedOrder.supplier === "string"
                    ? selectedOrder.supplier
                    : selectedOrder.supplier?.shopName || "N/A"}
                </DetailItem>
                <DetailItem label="Total Amount">
                  <span className="font-bold text-lg text-green-700">
                    KSh {(selectedOrder.totalAmount ?? 0).toLocaleString()}
                  </span>
                </DetailItem>
                <DetailItem label="Status">
                  {getStatusBadge(selectedOrder.status)}
                </DetailItem>
                <DetailItem label="Payment Status">
                  {getPaymentBadge(selectedOrder.paymentStatus)}
                </DetailItem>
                <DetailItem label="Payment Method">
                  {selectedOrder.paymentMethod || "N/A"}
                </DetailItem>
                <DetailItem label="Order Date">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString()
                    : "—"}
                </DetailItem>
              </div>

              {/* Delivery Details */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Delivery Details 🚚
                </h3>
                <DetailItem label="Address">
                  {selectedOrder.deliveryDetails?.address || "N/A"}
                  {selectedOrder.deliveryDetails?.city &&
                    `, ${selectedOrder.deliveryDetails.city}`}
                </DetailItem>
                <DetailItem label="Contact Phone">
                  {selectedOrder.deliveryDetails?.phone || "N/A"}
                </DetailItem>
              </div>

              {/* Items */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Ordered Items 🛍️
                </h3>
                {selectedOrder.items?.length ? (
                  <ul className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {item.name || item.productId || "Product"}{" "}
                          <span className="ml-2 text-sm text-indigo-600">
                            x{item.quantity || 0}
                          </span>
                        </span>
                        <span className="font-bold text-gray-800">
                          KSh {(item.price ?? 0).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No items listed.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
