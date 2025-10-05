// src/pages/UserDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdShoppingCart,
  MdLocalShipping,
  MdCancel,
  MdReplay,
  MdAttachMoney,
  MdStar,
} from "react-icons/md";

// ==========================
// Metric Card Component
// ==========================
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  bgColor?: string;
  trend?: string;
}> = ({ title, value, icon: Icon, iconColor, bgColor = "bg-white", trend }) => (
  <div className={`flex flex-col justify-between p-5 ${bgColor} rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition duration-300`}>
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
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</h2>
      <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
        <Icon className={iconColor} size={28} />
      </div>
    </div>
  </div>
);

// ==========================
// Chart Placeholder Component
// ==========================
const ChartPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-96 flex flex-col">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="flex items-center justify-center flex-grow text-gray-300 border border-dashed rounded-lg">
      Chart Placeholder - integrate chart library
    </div>
  </div>
);

// ==========================
// Quick Action Card
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
    </div>
    <div className="flex flex-col flex-grow">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 flex-grow">{description}</p>
    </div>
  </Link>
);

// ==========================
// User Dashboard Page
// ==========================
const UserDashboard: React.FC = () => {
  // Dummy state - replace with real API data
  const [ordersSummary, setOrdersSummary] = useState({
    totalOrders: 25,
    delivered: 15,
    cancelled: 5,
    returned: 2,
    totalSpent: 12450,
    loyaltyPoints: 320,
  });

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">My Dashboard</h1>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard title="Total Orders" value={ordersSummary.totalOrders} icon={MdShoppingCart} iconColor="text-blue-600" />
        <MetricCard title="Delivered" value={ordersSummary.delivered} icon={MdLocalShipping} iconColor="text-green-600" />
        <MetricCard title="Cancelled" value={ordersSummary.cancelled} icon={MdCancel} iconColor="text-red-600" />
        <MetricCard title="Returned" value={ordersSummary.returned} icon={MdReplay} iconColor="text-purple-600" />
        <MetricCard title="Total Spent (KSh)" value={ordersSummary.totalSpent.toFixed(2)} icon={MdAttachMoney} iconColor="text-teal-600" />
        <MetricCard title="Loyalty Points" value={ordersSummary.loyaltyPoints} icon={MdStar} iconColor="text-yellow-500" />
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <ChartPlaceholder title="Spending Over Time" />
        <ChartPlaceholder title="Loyalty Points Trend" />
      </div>

      {/* --- Quick Actions --- */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard to="/user/orders" title="View Orders" description="Check all your orders in one place." icon={MdShoppingCart} iconColor="text-blue-600" />
        <ActionCard to="/user/orders/delivered" title="Track Delivered" description="View delivered items and receipts." icon={MdLocalShipping} iconColor="text-green-600" />
        <ActionCard to="/user/orders/cancelled" title="Cancelled Orders" description="Review orders you have cancelled." icon={MdCancel} iconColor="text-red-600" />
        <ActionCard to="/user/orders/returned" title="Returned Items" description="Manage returned orders." icon={MdReplay} iconColor="text-purple-600" />
      </div>
    </div>
  );
};

export default UserDashboard;
