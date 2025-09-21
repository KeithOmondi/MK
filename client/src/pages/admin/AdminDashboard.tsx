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
} from "recharts";
import { Card, CardContent } from "../../components/ui/Card";

const AdminDashboard = () => {
  // Sample data – later replace with API data
  const revenueStats = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 7000 },
  ];

  const orderStats = [
    { name: "Pending", value: 10 },
    { name: "Processing", value: 25 },
    { name: "Delivered", value: 40 },
    { name: "Cancelled", value: 5 },
  ];

  const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF8042"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Revenue" value="KES 150,000" />
        <SummaryCard title="Orders" value="120" />
        <SummaryCard title="Users" value="500" />
        <SummaryCard title="Suppliers" value="35" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStats}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {orderStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }: { title: string; value: string }) => (
  <Card className="p-4 shadow-sm">
    <CardContent className="flex flex-col items-start">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </CardContent>
  </Card>
);

export default AdminDashboard;
