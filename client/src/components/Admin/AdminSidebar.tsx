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
  MdMenu,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import {
  clearAuthState,
  logout,
  logoutUser,
} from "../../redux/slices/authSlice";
import { useSidebar } from "./Context/SidebarContext";

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { collapsed, toggleSidebar } = useSidebar();

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={22} /> },
    { to: "/admin/orders", label: "Orders", icon: <MdShoppingCart size={22} /> },
    { to: "/admin/products", label: "Products", icon: <MdInventory size={22} /> },
    { to: "/admin/suppliers", label: "Suppliers", icon: <MdStore size={22} /> },
    { to: "/admin/customers", label: "Customers", icon: <MdPeople size={22} /> },
    { to: "/admin/analytics", label: "Analytics", icon: <MdBarChart size={22} /> },
    { to: "/admin/settings", label: "Settings", icon: <MdSettings size={22} /> },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully.");
    } catch {
      toast.warning("Session cleared locally.");
    } finally {
      dispatch(logout());
      dispatch(clearAuthState());
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* 🔹 Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 md:left-6"
      >
        <MdMenu size={22} />
      </button>

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white shadow-md flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out
          ${collapsed ? "w-20 translate-x-0" : "w-54 -translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-blue-600">MK Admin</h1>
          ) : (
            <MdDashboard size={26} className="text-blue-600" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-3 space-y-1 flex-grow overflow-y-auto scrollbar-hide">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-sm"
                     : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                 }`
              }
              onClick={() => window.innerWidth < 768 && toggleSidebar()} // Auto-close on mobile
            >
              {icon}
              {!collapsed && <span className="truncate text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition-colors duration-200"
          >
            <MdLogout size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
