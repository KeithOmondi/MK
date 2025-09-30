// src/pages/SupplierOrderDetails.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchOrderById, updateOrderStatus } from "../../redux/slices/orderSlice";
import { MdAttachMoney, MdOutlineInventory, MdLocationOn, MdHistory, MdArrowBack } from "react-icons/md";
import { toast } from "react-toastify";

// Status options array remains the same
const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// Helper function for status badge styling (for visual consistency across the app)
const getStatusConfig = (status: string) => {
    switch (status) {
        case "Delivered":
            return "bg-green-100 text-green-700 border-green-400";
        case "Shipped":
            return "bg-blue-100 text-blue-700 border-blue-400";
        case "Processing":
            return "bg-indigo-100 text-indigo-700 border-indigo-400";
        case "Pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-400";
        case "Cancelled":
            return "bg-red-100 text-red-700 border-red-400";
        default:
            return "bg-gray-100 text-gray-700 border-gray-400";
    }
};

const SupplierOrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    // Destructure properties from the state.orders slice
    const { order, loading, error } = useSelector((state: RootState) => state.orders); 
    const [status, setStatus] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch order on mount
    useEffect(() => {
        if (id) dispatch(fetchOrderById(id));
    }, [dispatch, id]);

    // Set local status state
    useEffect(() => {
        if (order?.status) setStatus(order.status);
    }, [order]);

    // Handle status update
    const handleStatusChange = async (newStatus: string) => {
        if (order?._id) {
            setIsUpdating(true);
            try {
                await dispatch(updateOrderStatus({ id: order._id, status: newStatus })).unwrap();
                setStatus(newStatus); // Update local status only on success
                toast.success(`Order status updated to ${newStatus}!`);
            } catch (err) {
                toast.error("Failed to update status.");
            } finally {
                setIsUpdating(false);
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <MdHistory className="animate-spin text-blue-600 mr-2" size={30} />
            <p className="text-xl text-gray-600">Loading order details... ⏳</p>
        </div>
    );
    if (error) return <p className="text-center text-red-600 py-10 text-xl font-medium">Error: {error}</p>;
    if (!order) return <p className="text-center text-gray-500 py-10 text-xl">Order not found.</p>;

    const delivery = order.deliveryDetails || {};
    const statusClasses = getStatusConfig(status);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Header and Breadcrumb */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    Order Details
                </h1>
                <nav className="text-sm">
                    <Link to="/supplier/orders" className="text-blue-600 hover:text-blue-800 transition">
                        Orders Dashboard
                    </Link>{" "}
                    / <span className="font-semibold text-gray-600">#{order._id.substring(0, 8)}</span>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: Status & Actions (Top Left) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Card and Updater */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Order Status</h3>
                        
                        <div className="flex items-center justify-between mb-4">
                            <span 
                                className={`px-4 py-2 font-bold text-sm rounded-full uppercase tracking-wider border-2 ${statusClasses}`}
                            >
                                {status}
                            </span>
                            <span className="text-sm text-gray-500">
                                Since: {new Date(order.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <label className="font-medium text-gray-700 block mb-2">Update Status:</label>
                        <div className="flex gap-2">
                            <select
                                value={status}
                                onChange={(e) => {
                                    // Use local status for immediate feedback, update via thunk
                                    handleStatusChange(e.target.value);
                                }}
                                disabled={isUpdating}
                                className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleStatusChange(status)} // Re-fire just in case
                                disabled={isUpdating}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        
                    </div>

                    {/* Buyer Info Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MdLocationOn size={20} className="text-red-500" /> Buyer & Delivery
                        </h3>
                        
                        <div className="space-y-3 text-gray-700">
                            <p>
                                <span className="font-semibold block text-sm text-gray-500">Buyer:</span>
                                {typeof order.buyer === "string"
                                    ? order.buyer
                                    : order.buyer?.name || order.buyer?.email || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold block text-sm text-gray-500">Email:</span>
                                {typeof order.buyer === "string" ? "N/A" : order.buyer?.email || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold block text-sm text-gray-500">Phone:</span>
                                {delivery.phone || "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold block text-sm text-gray-500">Address:</span>
                                {delivery.address || "N/A"}, {delivery.city || "N/A"}
                                {delivery.state ? `, ${delivery.state}` : ""} {delivery.country ? `, ${delivery.country}` : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Order Items & Financial Summary (Right) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Financial Summary Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MdAttachMoney size={20} className="text-green-600" /> Financial Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 font-medium">
                            <div>
                                <span className="text-sm font-semibold text-gray-500 block">Total Items</span>
                                <span className="text-xl text-gray-800">{order.items?.length || 0}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-500 block">Payment Method</span>
                                <span className="text-xl capitalize">{order.paymentMethod || "N/A"}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-500 block">Shipping Cost</span>
                                <span className="text-xl">KSh {order.shippingCost?.toLocaleString() || '0.00'}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-gray-500 block">Grand Total</span>
                                <span className="text-2xl font-extrabold text-blue-700">
                                    KSh {order.totalAmount?.toLocaleString() || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Items Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MdOutlineInventory size={20} className="text-orange-500" /> Items in Order
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.productId} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-3">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-md border"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.name || "Product"}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-green-700">
                                        KSh {(item.price * item.quantity).toLocaleString() || '0.00'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
                <Link
                    to="/supplier/orders"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                    <MdArrowBack size={20} />
                    Back to Orders Dashboard
                </Link>
            </div>
        </div>
    );
};

export default SupplierOrderDetails;