import React from "react";
import { Link } from "react-router-dom";
import {
  MdShoppingCart,
  MdLocalShipping,
  MdCancel,
  MdReplay,
} from "react-icons/md";

const UserDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* All Orders */}
        <Link
          to="/user/orders"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdShoppingCart className="text-blue-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">All Orders</h2>
          <p className="text-gray-600 text-sm mt-2">
            View and manage all your orders.
          </p>
        </Link>

        {/* Delivered */}
        <Link
          to="/user/orders/delivered"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdLocalShipping className="text-green-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Delivered</h2>
          <p className="text-gray-600 text-sm mt-2">
            Check your successfully delivered orders.
          </p>
        </Link>

        {/* Cancelled */}
        <Link
          to="/user/orders/cancelled"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdCancel className="text-red-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Cancelled</h2>
          <p className="text-gray-600 text-sm mt-2">
            Review orders you have cancelled.
          </p>
        </Link>

        {/* Returned */}
        <Link
          to="/user/orders/returned"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdReplay className="text-purple-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Returned</h2>
          <p className="text-gray-600 text-sm mt-2">
            Manage items you have returned.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
