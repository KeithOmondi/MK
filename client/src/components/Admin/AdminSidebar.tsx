// src/components/admin/AdminSidebar.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdShoppingCart,
  MdInventory,
  MdPeople,
  MdBarChart,
  MdStore,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import { clearAuthState, logout } from "../../redux/slices/authSlice";

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const navLinks: NavLinkItem[] = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
    },
    {
      to: "/admin/orders",
      label: "Orders",
      icon: <MdShoppingCart size={20} />,
    },
    {
      to: "/admin/products",
      label: "Products",
      icon: <MdInventory size={20} />,
    },
    {
      to: "/admin/suppliers",
      label: "Suppliers",
      icon: <MdStore size={20} />,
    },
    {
      to: "/admin/customers",
      label: "Customers",
      icon: <MdPeople size={20} />,
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: <MdBarChart size={20} />,
    },
    {
      to: "/admin/settings",
      label: "Settings",
      icon: <MdSettings size={20} />,
    },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      dispatch(clearAuthState());
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Logout failed.");
      } else {
        toast.error("Logout failed.");
      }
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 text-xl font-bold text-gray-800">
        Admin Panel
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col p-4 space-y-2 flex-grow">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition ${
                isActive ? "bg-blue-500 text-white" : ""
              }`
            }
            end
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition-colors"
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
