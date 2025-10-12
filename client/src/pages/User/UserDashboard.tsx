import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdShoppingCart,
  MdLocalShipping,
  MdCancel,
  MdReplay,
  MdAttachMoney,
  MdStar,
} from "react-icons/md";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

// ==========================
// Metric Card Component
// ==========================
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
}) => (
  <div className="flex flex-col justify-between p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
    <p className="text-xs font-medium text-gray-400 uppercase mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>
      <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
        <Icon className={iconColor} size={28} />
      </div>
    </div>
  </div>
);

// ==========================
// Quick Action Card
// ==========================
interface ActionCardProps {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  to,
  title,
  description,
  icon: Icon,
  iconColor,
}) => (
  <Link
    to={to}
    className="group p-6 bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg hover:border-indigo-300 transition duration-300 flex flex-col justify-between h-full"
  >
    <div className={`p-3 rounded-full ${iconColor} bg-opacity-10 mb-4`}>
      <Icon className={iconColor} size={28} />
    </div>
    <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
      {title}
    </h2>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

// ==========================
// User Dashboard Page
// ==========================
const UserDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [summary] = useState({
    totalOrders: 25,
    delivered: 15,
    cancelled: 5,
    returned: 2,
    totalSpent: 12450,
    loyaltyPoints: 320,
  });

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* --- User Greeting --- */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {user ? `Welcome, ${user.name} 👋` : "Welcome 👋"}
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s your recent shopping overview and quick actions.
        </p>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard
          title="Total Orders"
          value={summary.totalOrders}
          icon={MdShoppingCart}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Delivered"
          value={summary.delivered}
          icon={MdLocalShipping}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Cancelled"
          value={summary.cancelled}
          icon={MdCancel}
          iconColor="text-red-600"
        />
        <MetricCard
          title="Returned"
          value={summary.returned}
          icon={MdReplay}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Total Spent (KSh)"
          value={summary.totalSpent.toFixed(2)}
          icon={MdAttachMoney}
          iconColor="text-teal-600"
        />
        <MetricCard
          title="Loyalty Points"
          value={summary.loyaltyPoints}
          icon={MdStar}
          iconColor="text-yellow-500"
        />
      </div>

      {/* --- Quick Actions --- */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          to="/user/orders"
          title="View Orders"
          description="Check all your orders in one place."
          icon={MdShoppingCart}
          iconColor="text-blue-600"
        />
        <ActionCard
          to="/user/orders/delivered"
          title="Track Delivered"
          description="View delivered items and receipts."
          icon={MdLocalShipping}
          iconColor="text-green-600"
        />
        <ActionCard
          to="/user/orders/cancelled"
          title="Cancelled Orders"
          description="Review your cancelled orders."
          icon={MdCancel}
          iconColor="text-red-600"
        />
        <ActionCard
          to="/user/orders/returned"
          title="Returned Items"
          description="Manage returned items."
          icon={MdReplay}
          iconColor="text-purple-600"
        />
      </div>
    </div>
  );
};

export default UserDashboard;
