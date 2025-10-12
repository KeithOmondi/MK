import React, { useEffect, useMemo, useState } from "react";
import {
  MdInventory,
  MdShoppingCart,
  MdAttachMoney,
  MdStar,
  MdCreditCard,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchSupplierOrders } from "../../redux/slices/orderSlice";

// ==========================
// MetricCard Component
// ==========================
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}) => {
  const isPositive = trend?.startsWith("+");
  const trendColor = isPositive
    ? "text-green-600 bg-green-50"
    : trend
    ? "text-red-600 bg-red-50"
    : "text-gray-500 bg-gray-50";

  return (
    <div className="flex flex-col justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
          <Icon className={color} size={26} />
        </div>
        <p className="text-xs font-medium text-gray-400 uppercase">{title}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>

      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} px-2 py-1 rounded-md`}>
          {isPositive ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
          <span>{trend} vs last period</span>
        </div>
      )}
    </div>
  );
};

// ==========================
// OrderStatusBadge Component
// ==========================
interface OrderStatusBadgeProps {
  status: string;
  count: number;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, count }) => {
  const colors: Record<string, string> = {
    Total: "bg-gray-100 text-gray-700 border-gray-200",
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Shipped: "bg-blue-100 text-blue-800 border-blue-300",
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Returned: "bg-red-100 text-red-800 border-red-300",
  };

  const colorClass = colors[status] || "bg-gray-100 text-gray-600";

  return (
    <div
      className={`p-4 rounded-xl border-2 ${colorClass} transition duration-200 hover:shadow-md text-center`}
    >
      <p className="text-xs font-bold uppercase mb-1">{status}</p>
      <p className="text-2xl font-extrabold">{count}</p>
    </div>
  );
};

// ==========================
// Supplier Dashboard
// ==========================
const SupplierDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [totalProducts] = useState(120);
  const [averageRating] = useState(4.6);

  useEffect(() => {
    dispatch(fetchSupplierOrders());
  }, [dispatch]);

  const {
    totalOrders,
    pendingOrders,
    shippedOrders,
    deliveredOrders,
    returnedOrders,
    totalRevenue,
    pendingPayouts,
  } = useMemo(() => {
    if (!orders?.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        returnedOrders: 0,
        totalRevenue: 0,
        pendingPayouts: 0,
      };
    }

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "Pending").length,
      shippedOrders: orders.filter((o) => o.status === "Shipped").length,
      deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
      returnedOrders: orders.filter((o) => o.status === "Returned").length,
    };

    const revenue = orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const supplierShare = revenue * 0.9;
    const pending = supplierShare * 0.1;

    return { ...stats, totalRevenue: revenue, pendingPayouts: pending };
  }, [orders]);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {user ? `Welcome, ${user.name} 👋` : "Welcome Seller 👋"}
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s an overview of your store performance as of{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <MetricCard title="Total Products" value={totalProducts} icon={MdInventory} color="text-indigo-600" trend="+8%" />
        <MetricCard title="Total Orders" value={totalOrders} icon={MdShoppingCart} color="text-blue-600" trend="+12%" />
        <MetricCard title="Gross Revenue (KSh)" value={`KSh ${totalRevenue.toFixed(2)}`} icon={MdAttachMoney} color="text-teal-600" trend="+15%" />
        <MetricCard title="Pending Payouts (KSh)" value={`KSh ${pendingPayouts.toFixed(2)}`} icon={MdCreditCard} color="text-purple-600" trend="-2%" />
        <MetricCard title="Avg. Store Rating" value={averageRating.toFixed(1)} icon={MdStar} color="text-yellow-500" />
      </section>

      {/* Order Summary */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Order Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <OrderStatusBadge status="Total" count={totalOrders} />
          <OrderStatusBadge status="Pending" count={pendingOrders} />
          <OrderStatusBadge status="Shipped" count={shippedOrders} />
          <OrderStatusBadge status="Delivered" count={deliveredOrders} />
          <OrderStatusBadge status="Returned" count={returnedOrders} />
        </div>
      </section>

      {/* Inventory Alert */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
          <MdInventory size={24} />
          Inventory Alerts
        </h2>
        <p className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
          All inventory levels look healthy 🎉
        </p>
      </section>
    </div>
  );
};

export default SupplierDashboard;
