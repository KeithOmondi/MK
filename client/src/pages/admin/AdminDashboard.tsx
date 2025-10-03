import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent } from "../../components/ui/Card";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchLatestSuppliers,
  fetchTopProducts,
  fetchLatestReviews,
} from "../../redux/slices/adminDashboardSlice";
import type { RootState, AppDispatch } from "../../redux/store";

const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF8042", "#A855F7"];

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, suppliers, products, reviews, loading, error } =
    useSelector((state: RootState) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchLatestSuppliers());
    dispatch(fetchTopProducts());
    dispatch(fetchLatestReviews());
  }, [dispatch]);

  if (loading)
    return <p className="text-center p-4">Loading dashboard...</p>;
  if (error)
    return <p className="text-center p-4 text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Total Revenue" value={`KES ${stats?.totalRevenue || 0}`} />
        <SummaryCard title="Orders" value={`${stats?.totalOrders || 0}`} />
        <SummaryCard title="Sellers" value={`${stats?.totalSuppliers || 0}`} />
        <SummaryCard title="Users" value={`${stats?.totalUsers || 0}`} />
        <SummaryCard title="Pending Payments" value={`${stats?.pendingPayments || 0}`} />
        <SummaryCard title="Completed Payments" value={`${stats?.completedPayments || 0}`} />
        <SummaryCard title="Pending Refunds" value={`${stats?.pendingRefunds || 0}`} />
        <SummaryCard title="Completed Refunds" value={`${stats?.completedRefunds || 0}`} />
        <SummaryCard title="Total Refund Amount" value={`KES ${stats?.totalRefundAmount || 0}`} />
        <SummaryCard title="Products" value={`${stats?.totalProducts || 0}`} />
        <SummaryCard title="Average Order Value" value={`KES ${stats?.averageOrderValue?.toFixed(2) || 0}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Weekly Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.weeklyRevenue || []}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.monthlyRevenue || []}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Payments Overview */}
<DashboardCard title="Payments Overview">
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={[
          { name: "Pending Payments", value: stats?.pendingPayments || 0 },
          { name: "Completed Payments", value: stats?.completedPayments || 0 },
        ]}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        label={({ name, percent }) =>
          `${name}: ${(percent * 100).toFixed(0)}%`
        }
      >
        {COLORS.map((c, i) => (
          <Cell key={i} fill={c} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value: number, name: string) =>
          `${value} orders`
        }
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</DashboardCard>

{/* Refunds Overview */}
<DashboardCard title="Refunds Overview">
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
  data={[
    { name: "Pending Payments", value: stats?.pendingPayments || 0 },
    { name: "Completed Payments", value: stats?.completedPayments || 0 },
  ]}
  cx="50%"
  cy="50%"
  outerRadius={100}
  dataKey="value"
  label={({ name, percent }) =>
    `${name}: ${(percent as number * 100).toFixed(0)}%`
  }
>
  {COLORS.map((c, i) => (
    <Cell key={i} fill={c} />
  ))}
</Pie>

      <Tooltip
        formatter={(value: number, name: string) =>
          `${value} orders`
        }
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</DashboardCard>


        <DashboardCard title="Refunds Overview">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Pending Refunds", value: stats?.pendingRefunds || 0 },
                  { name: "Completed Refunds", value: stats?.completedRefunds || 0 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Latest Suppliers, Products & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Latest Registered Suppliers">
          <ul className="space-y-2">
            {suppliers.map((supplier) => (
              <li key={supplier._id} className="flex justify-between text-sm">
                <span>{supplier.name}</span>
                <span className="text-gray-500">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Most Purchased Products">
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product._id} className="flex justify-between text-sm">
                <span>{product.name}</span>
                <span className="font-semibold">{product.sales} sales</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Recent Reviews">
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review._id} className="text-sm">
                <p className="font-semibold">
                  {review.user} → {review.product}
                </p>
                <p className="text-gray-500">
                  ⭐ {review.rating} - {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
};

// ===============================
// Reusable Components
// ===============================
const SummaryCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="p-4 shadow-sm">
    <CardContent className="flex flex-col items-start">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </CardContent>
  </Card>
);

const DashboardCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="p-4 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <CardContent>{children}</CardContent>
  </Card>
);

export default AdminDashboard;
