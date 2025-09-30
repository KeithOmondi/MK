// src/pages/SupplierDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    MdInventory, 
    MdAddBox, 
    MdShoppingCart, 
    MdAccountCircle,
    MdPeople,
    MdTrendingUp, // Used for sales
    MdCreditCard, // Used for balance
    MdOpenInNew, // Used for action links
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchSupplierOrders } from "../../redux/slices/orderSlice";

// Helper component for the metric cards (Kpis)
const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; iconColor: string; bgColor: string }> = ({
    title,
    value,
    icon: Icon,
    iconColor,
    bgColor,
}) => (
    <div className={`p-6 ${bgColor} rounded-xl shadow-lg border border-gray-200 flex items-center justify-between transition duration-300 transform hover:scale-[1.01]`}>
        <div>
            <p className="text-sm font-medium text-gray-700 uppercase tracking-wider">{title}</p>
            <h2 className="mt-1 text-3xl font-extrabold text-gray-900 leading-none">
                {title.includes("KSh") ? `KSh ${value.toLocaleString()}` : value.toLocaleString()}
            </h2>
        </div>
        <div className={`p-3 rounded-full ${iconColor} bg-opacity-20`}>
            <Icon className={iconColor} size={30} />
        </div>
    </div>
);

// Helper component for the action links
const ActionCard: React.FC<{ to: string; title: string; description: string; icon: React.ElementType; iconColor: string }> = ({
    to,
    title,
    description,
    icon: Icon,
    iconColor,
}) => (
    <Link
        to={to}
        className="p-6 bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg hover:border-blue-300 transition duration-300 flex flex-col items-start"
    >
        <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-3 rounded-xl ${iconColor} bg-opacity-20`}>
                <Icon className={iconColor} size={30} />
            </div>
            <MdOpenInNew className="text-gray-400" size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 text-sm mt-1 flex-grow">{description}</p>
    </Link>
);


const SupplierDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders } = useSelector((state: RootState) => state.orders);

    const [totalSales, setTotalSales] = useState(0);
    const [accountBalance, setAccountBalance] = useState(0);
    const [totalBuyers, setTotalBuyers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        dispatch(fetchSupplierOrders());
    }, [dispatch]);

    useEffect(() => {
        if (orders) {
            setTotalOrders(orders.length);

            // Unique buyers
            const buyersSet = new Set(
                orders.map((order) =>
                    typeof order.buyer === "string" ? order.buyer : order.buyer?.email || order.buyer?.name
                )
            );
            setTotalBuyers(buyersSet.size);

            // Total sales (sum of delivered orders)
            const sales = orders
                .filter((o) => o.status !== "Cancelled" && o.status !== "Refunded")
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            setTotalSales(sales);

            // Account balance (sales minus refunded orders)
            const refunded = orders
                .filter((o) => o.status === "Refunded")
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            setAccountBalance(sales - refunded);
        }
    }, [orders]);

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                Supplier Dashboard 🚀
            </h1>

            {/* --- STATS OVERVIEW --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                
                {/* Total Sales */}
                <MetricCard
                    title="Total Sales (KSh)"
                    value={totalSales.toFixed(2)}
                    icon={MdTrendingUp}
                    iconColor="text-green-600"
                    bgColor="bg-white"
                />

                {/* Account Balance */}
                <MetricCard
                    title="Account Balance (KSh)"
                    value={accountBalance.toFixed(2)}
                    icon={MdCreditCard}
                    iconColor="text-blue-600"
                    bgColor="bg-white"
                />

                {/* Total Buyers */}
                <MetricCard
                    title="Total Buyers"
                    value={totalBuyers}
                    icon={MdPeople}
                    iconColor="text-purple-600"
                    bgColor="bg-white"
                />

                {/* Total Orders */}
                <MetricCard
                    title="Total Orders"
                    value={totalOrders}
                    icon={MdShoppingCart}
                    iconColor="text-orange-600"
                    bgColor="bg-white"
                />
            </div>

            {/* --- QUICK ACTIONS --- */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Manage Products */}
                <ActionCard
                    to="/supplier/products"
                    title="Manage Products"
                    description="View, edit, or remove your listed products."
                    icon={MdInventory}
                    iconColor="text-blue-600"
                />

                {/* Add Product */}
                <ActionCard
                    to="/supplier/products/add"
                    title="Add New Product"
                    description="Easily add new items to your marketplace catalog."
                    icon={MdAddBox}
                    iconColor="text-green-600"
                />

                {/* Orders */}
                <ActionCard
                    to="/supplier/orders"
                    title="Manage Orders"
                    description="Process, track, and update all customer orders."
                    icon={MdShoppingCart}
                    iconColor="text-purple-600"
                />

                {/* Profile / Account Settings */}
                <ActionCard
                    to="/supplier/profile"
                    title="Account Settings"
                    description="Update your business and personal profile information."
                    icon={MdAccountCircle}
                    iconColor="text-orange-600"
                />
            </div>
            
        </div>
    );
};

export default SupplierDashboard;