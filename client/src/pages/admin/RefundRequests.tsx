// src/pages/admin/RefundRequests.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateRefundStatus,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from "../../redux/slices/orderSlice";
import type { AppDispatch } from "../../redux/store";
import toast from "react-hot-toast";

const RefundRequests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleRefundDecision = (orderId: string, itemId: string, status: "Approved" | "Rejected") => {
    dispatch(updateRefundStatus({ orderId, itemId, status }))
      .unwrap()
      .then(() => toast.success(`Refund ${status}`))
      .catch((err) => toast.error(err || "Failed to update refund status"));
  };

  if (loading) return <p>Loading refund requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const refundOrders = orders.filter((o) =>
    o.items.some((item) => item.refundStatus === "Pending")
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Refund Requests</h1>

      {refundOrders.length === 0 ? (
        <p>No pending refund requests.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Buyer</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Refund Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {refundOrders.map((order) =>
              order.items
                .filter((item) => item.refundStatus === "Pending")
                .map((item) => (
                  <tr key={item._id}>
                    <td className="border p-2">{order._id}</td>
                    <td className="border p-2">{typeof order.buyer === "string" ? order.buyer : order.buyer.name}</td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2">{item.quantity}</td>
                    <td className="border p-2">{item.refundStatus}</td>
                    <td className="border p-2 space-x-2">
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRefundDecision(order._id, item._id!, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRefundDecision(order._id, item._id!, "Rejected")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RefundRequests;
