// src/pages/SupplierDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    MdInventory, MdAddBox, MdShoppingCart, MdAccountCircle,
    MdPeople, MdAttachMoney, MdCreditCard, MdAssignment, MdOpenInNew
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchSupplierOrders } from "../../redux/slices/orderSlice";

// ==========================
// KPI Card Component
// ==========================
const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    bgColor?: string;
    trend?: string;
}> = ({ title, value, icon: Icon, iconColor, bgColor = "bg-white", trend }) => (
    <div className={`flex flex-col justify-between p-5 ${bgColor} rounded-xl shadow-md hover:shadow-xl border border-gray-100 transition duration-300`}>
        <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase">{title}</p>
            {trend && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    trend.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                }`}>
                    {trend}
                </span>
            )}
        </div>
        <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {typeof value === "number" ? value.toLocaleString() : value}
            </h2>
            <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
                <Icon className={iconColor} size={28} />
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Jan 01, 2024 - Mar 30, 2024</p>
    </div>
);

// ==========================
// Action Card Component
// ==========================
const ActionCard: React.FC<{
    to: string;
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
}> = ({ to, title, description, icon: Icon, iconColor }) => (
    <Link
        to={to}
        className="group p-6 bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg hover:border-indigo-300 transition duration-300 flex flex-col justify-between h-full"
    >
        <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-full ${iconColor} bg-opacity-10 transition duration-300 group-hover:bg-opacity-20`}>
                <Icon className={iconColor} size={28} />
            </div>
            <MdOpenInNew className="text-gray-400 group-hover:text-indigo-600 transition" size={20} />
        </div>
        <div className="flex flex-col flex-grow">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 flex-grow">{description}</p>
        </div>
    </Link>
);

// ==========================
// Chart Placeholder
// ==========================
const TransactionChartPlaceholder: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Transaction Activity</h3>
            <span className="text-sm text-gray-400">Jan 01, 2024 - Mar 30, 2024</span>
        </div>
        <div className="flex items-center justify-center flex-grow text-gray-300 border border-dashed rounded-lg">
            Graph Placeholder - integrate chart library
        </div>
    </div>
);

// ==========================
// Supplier Dashboard Page
// ==========================
const SupplierDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { orders } = useSelector((state: RootState) => state.orders);

    const [totalSales, setTotalSales] = useState(0);
    const [accountBalance, setAccountBalance] = useState(0);
    const [totalBuyers, setTotalBuyers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        dispatch(fetchSupplierOrders("SUPPLIER_ID_HERE")); // <-- replace with actual supplierId
    }, [dispatch]);

    useEffect(() => {
        if (orders) {
            setTotalOrders(orders.length);

            const buyersSet = new Set(
                orders.map(o => typeof o.buyer === "string" ? o.buyer : o.buyer?.email || o.buyer?.name)
            );
            setTotalBuyers(buyersSet.size);

            const sales = orders.filter(o => o.status !== "Cancelled" && o.status !== "Refunded")
                                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            setTotalSales(sales);

            const refunded = orders.filter(o => o.status === "Refunded")
                                   .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            setAccountBalance(sales - refunded);
        }
    }, [orders]);

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Welcome Back, Supplier! 👋</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="font-medium">Today: {new Date().toLocaleDateString()}</span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Export Data</button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard title="Total Revenue (KSh)" value={totalSales.toFixed(2)} icon={MdAttachMoney} iconColor="text-teal-600" trend="+15%" />
                <MetricCard title="Account Balance (KSh)" value={accountBalance.toFixed(2)} icon={MdCreditCard} iconColor="text-indigo-600" trend="-3%" />
                <MetricCard title="Total Buyers" value={totalBuyers} icon={MdPeople} iconColor="text-pink-600" trend="+5%" />
                <MetricCard title="Total Orders" value={totalOrders} icon={MdAssignment} iconColor="text-orange-600" trend="+12%" />
            </div>

            {/* CHART */}
            <TransactionChartPlaceholder />

            {/* ACTION CARDS */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Management Shortcuts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard to="/supplier/products" title="Product Inventory" description="View, edit, or remove your listed products." icon={MdInventory} iconColor="text-blue-600" />
                <ActionCard to="/supplier/products/add" title="Create New Listing" description="Quickly add new items to your marketplace catalog." icon={MdAddBox} iconColor="text-green-600" />
                <ActionCard to="/supplier/orders" title="Customer Orders" description="Process, track, and update all shipments." icon={MdShoppingCart} iconColor="text-purple-600" />
                <ActionCard to="/supplier/profile" title="Payout & Settings" description="Manage your payment details and account profile." icon={MdAccountCircle} iconColor="text-orange-600" />
            </div>
        </div>
    );
};

export default SupplierDashboard;
