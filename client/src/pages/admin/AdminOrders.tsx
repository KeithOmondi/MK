import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateOrderStatus,
  deleteOrder,
  type Order,
} from "../../redux/slices/orderSlice";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../redux/store";

const AdminOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleUpdateStatus = (id: string, status: string) => {
    dispatch(updateOrderStatus({ id, status }))
      .unwrap()
      .then(() => toast.success(`Order ${status}`))
      .catch((err) => toast.error(err));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteOrder(id))
      .unwrap()
      .then(() => toast.success("Order deleted!"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📦 Orders Management</h1>

      {loading && <p className="text-indigo-600">Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="text-gray-600">No orders found.</p>}

      {!loading && orders.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-2xl">
          <table className="min-w-full table-auto text-sm text-left text-gray-600">
            <thead className="bg-indigo-600 text-white text-sm uppercase">
              <tr>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {typeof order.buyer === "string"
                      ? order.buyer
                      : order.buyer?.name || order.buyer?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4">{order.supplier || "N/A"}</td>
                  <td className="px-6 py-4 font-medium">
                    KSh {(order.totalAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{order.paymentMethod || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    {order.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order._id, "Approved")}
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order._id, "Rejected")}
                          className="text-red-600 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedOrderId(order._id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            {orders
              .filter((o) => o._id === selectedOrderId)
              .map((order: Order) => (
                <div key={order._id}>
                  <p>
                    <strong>Buyer:</strong>{" "}
                    {typeof order.buyer === "string"
                      ? order.buyer
                      : order.buyer?.name || order.buyer?.email || "N/A"}
                  </p>
                  <p><strong>Supplier:</strong> {order.supplier || "N/A"}</p>
                  <p><strong>Total:</strong> KSh {(order.totalAmount ?? 0).toLocaleString()}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod || "N/A"}</p>
                  <p>
                    <strong>Delivery:</strong>{" "}
                    {order.deliveryDetails?.address || "N/A"}, {order.deliveryDetails?.city || ""}{" "}
                    {order.deliveryDetails?.phone && `, ${order.deliveryDetails.phone}`}
                  </p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc ml-5">
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.name || item.productId || "Product"} x{item.quantity || 0} - KSh{" "}
                        {(item.price ?? 0).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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
