import React from "react";
import { Link } from "react-router-dom";
import { MdInventory, MdAddBox, MdShoppingCart, MdAccountCircle } from "react-icons/md";

const UserDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Supplier Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Products */}
        <Link
          to="/supplier/products"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdInventory className="text-blue-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Manage Products</h2>
          <p className="text-gray-600 text-sm mt-2">
            View and update your listed products.
          </p>
        </Link>

        {/* Add Product */}
        <Link
          to="/supplier/products/add"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdAddBox className="text-green-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Add Product</h2>
          <p className="text-gray-600 text-sm mt-2">
            Add new items to your catalog.
          </p>
        </Link>

        {/* Orders */}
        <Link
          to="/supplier/orders"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdShoppingCart className="text-purple-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">Orders</h2>
          <p className="text-gray-600 text-sm mt-2">
            Track and manage customer orders.
          </p>
        </Link>

        {/* Profile / Account Settings */}
        <Link
          to="/supplier/profile"
          className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition flex flex-col items-center text-center"
        >
          <MdAccountCircle className="text-orange-600" size={40} />
          <h2 className="mt-4 text-lg font-semibold">My Profile</h2>
          <p className="text-gray-600 text-sm mt-2">
            Update your personal and business info.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
