// src/pages/SupplierOrders.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchSupplierOrders, updateOrderStatus } from "../../redux/slices/orderSlice";
import { MdVisibility } from "react-icons/md"; // For the View Details button

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// Helper component for styled status badges (better than a raw select box for viewing)
const StatusBadge = ({ status }: { status: string }) => {
    let colorClasses = "bg-gray-200 text-gray-700";
    switch (status) {
        case "Pending":
            colorClasses = "bg-yellow-100 text-yellow-700 ring-yellow-300";
            break;
        case "Processing":
            colorClasses = "bg-blue-100 text-blue-700 ring-blue-300";
            break;
        case "Shipped":
            colorClasses = "bg-indigo-100 text-indigo-700 ring-indigo-300";
            break;
        case "Delivered":
            colorClasses = "bg-green-100 text-green-700 ring-green-300";
            break;
        case "Cancelled":
            colorClasses = "bg-red-100 text-red-700 ring-red-300";
            break;
        default:
            break;
    }

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ring-1 ${colorClasses}`}
        >
            {status}
        </span>
    );
};


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
        // Optimistic UI update could be done here, but sticking to original flow for now
        await dispatch(updateOrderStatus({ orderId, status: newStatus }));
        // Using a toast for success/failure is highly recommended here!
        dispatch(fetchSupplierOrders()); // Refresh to ensure sync
    };

    // Navigate to Supplier Order Details page
    const viewDetails = (orderId: string) => {
        navigate(`/supplier/order/${orderId}`);
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            
            {/* Header */}
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">📦 Manage Customer Orders</h2>

            {/* Loading/Error States */}
            {loading && orders.length === 0 && (
                 <div className="flex items-center justify-center p-10 bg-white rounded-xl shadow-md">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-indigo-600 font-medium">Loading orders...</span>
                 </div>
            )}
            {error && (
                <p className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg shadow-md">
                    Error fetching orders: {error}
                </p>
            )}

            {/* Order Table */}
            {!loading && !error && (
                <div className="overflow-x-auto bg-white shadow-2xl rounded-xl border border-gray-100">
                    {orders.length > 0 ? (
                        <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-gray-800 text-white shadow-lg">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Buyer</th>
                                    <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Order Date</th>
                                    <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Status</th>
                                    <th className="px-6 py-3 text-center font-semibold text-sm tracking-wider uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-indigo-50/50 transition">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {order._id.substring(0, 10)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {typeof order.buyer === "string"
                                                ? order.buyer
                                                : order.buyer?.name || order.buyer?.email || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-700">
                                            KSh {order.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Status Update Dropdown */}
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                // Combine the select with the badge aesthetic
                                                className={`py-1 pl-3 pr-8 text-sm font-medium border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white transition cursor-pointer`}
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition duration-150 shadow-sm flex items-center justify-center mx-auto"
                                                onClick={() => viewDetails(order._id)}
                                                title="View Order Details"
                                            >
                                                <MdVisibility size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center">
                            <p className="text-xl text-gray-500 italic">🎉 Congratulations! You have no pending orders.</p>
                            <p className="text-sm text-gray-400 mt-2">All orders are up-to-date or the list is empty.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupplierOrders;