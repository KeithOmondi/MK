// src/pages/SupplierOrders.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchSupplierOrders, updateOrderStatus } from "../../redux/slices/orderSlice";

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const SupplierOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  // Fetch supplier orders on mount
  useEffect(() => {
    dispatch(fetchSupplierOrders());
  }, [dispatch]);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    dispatch(fetchSupplierOrders()); // Refresh to ensure sync
  };

  // Navigate to Supplier Order Details page
  const viewDetails = (orderId: string) => {
    navigate(`/supplier/order/${orderId}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Supplier Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          {orders.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{order._id}</td>
                    <td className="p-3">
                      {typeof order.buyer === "string"
                        ? order.buyer
                        : order.buyer?.name || order.buyer?.email || "N/A"}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">KSh {order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="p-3">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      <button
                        className="text-blue-500 hover:underline text-sm"
                        onClick={() => viewDetails(order._id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-gray-500">No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
