// src/components/admin/AdminSidebar.tsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdStore,
  MdInventory,
  MdShoppingCart,
  MdPayment,
  MdLocalOffer,
  MdSettings,
  MdBarChart,
  MdPerson,
  MdLogout,
  MdExpandMore,
  MdExpandLess,
  MdMenu,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import { clearAuthState, logout, logoutUser } from "../../redux/slices/authSlice";
import { useSidebar } from "./Context/SidebarContext";

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  subItems?: { to: string; label: string }[];
  to?: string;
}

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { collapsed, toggleSidebar } = useSidebar();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

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

  const navGroups: NavGroup[] = [
    { label: "Dashboard", icon: <MdDashboard size={22} />, to: "/admin/dashboard" },
    {
      label: "Users",
      icon: <MdPeople size={22} />,
      subItems: [
        { to: "/admin/users", label: "All Users" },
        { to: "/admin/users/buyers", label: "Buyers" },
        { to: "/admin/users/sellers", label: "Sellers" },
        { to: "/admin/users/add", label: "Add User" },
      ],
    },
    {
      label: "Sellers",
      icon: <MdStore size={22} />,
      subItems: [
        { to: "/admin/sellers/applications", label: "Seller Applications" },
        { to: "/admin/sellers/verified", label: "Verified Sellers" },
        { to: "/admin/sellers/reports", label: "Reports / Flags" },
      ],
    },
    {
      label: "Products",
      icon: <MdInventory size={22} />,
      subItems: [
        { to: "/admin/products", label: "All Products" },
        { to: "/admin/categories", label: "Categories" },
        { to: "/admin/reviews", label: "Reviews & Ratings" },
      ],
    },
    {
      label: "Orders",
      icon: <MdShoppingCart size={22} />,
      subItems: [
        { to: "/admin/orders", label: "All Orders" },
        { to: "/admin/refunds", label: "Refund Requests" },
        { to: "/admin/disputes", label: "Disputes" },
      ],
    },
    {
      label: "Payments",
      icon: <MdPayment size={22} />,
      subItems: [
        { to: "/admin/transactions", label: "Transactions" },
        { to: "/admin/payouts", label: "Payout Requests" },
        { to: "/admin/fees", label: "Platform Fees" },
      ],
    },
    {
      label: "Promotions",
      icon: <MdLocalOffer size={22} />,
      subItems: [
        { to: "/admin/campaigns", label: "Active Campaigns" },
        { to: "/admin/coupons", label: "Coupons" },
        { to: "/admin/featured", label: "Featured Ads" },
      ],
    },
    {
      label: "Settings",
      icon: <MdSettings size={22} />,
      subItems: [
        { to: "/admin/settings", label: "Platform Settings" },
        { to: "/admin/roles", label: "Roles & Permissions" },
        { to: "/admin/notifications", label: "Notifications" },
      ],
    },
    {
      label: "Reports",
      icon: <MdBarChart size={22} />,
      subItems: [
        { to: "/admin/reports/sales", label: "Sales Reports" },
        { to: "/admin/reports/users", label: "User Analytics" },
        { to: "/admin/reports/inventory", label: "Inventory Reports" },
      ],
    },
    {
      label: "Admin Account",
      icon: <MdPerson size={22} />,
      subItems: [
        { to: "/admin/profile", label: "Profile" },
        { to: "/admin/activity-log", label: "Activity Log" },
      ],
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300 md:left-6"
      >
        <MdMenu size={22} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white shadow-md flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out
          ${collapsed ? "w-20 translate-x-0" : "w-60 -translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          ) : (
            <MdDashboard size={26} className="text-blue-600" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-3 space-y-1 flex-grow overflow-y-auto scrollbar-hide">
          {navGroups.map(({ label, icon, to, subItems }) => (
            <div key={label}>
              {subItems ? (
                <>
                  <button
                    onClick={() => toggleDropdown(label)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 ${
                      openDropdown === label ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      {!collapsed && <span className="truncate text-sm">{label}</span>}
                    </div>
                    {!collapsed &&
                      (openDropdown === label ? (
                        <MdExpandLess size={20} />
                      ) : (
                        <MdExpandMore size={20} />
                      ))}
                  </button>

                  {/* Dropdown Animation */}
                  <AnimatePresence>
                    {!collapsed && openDropdown === label && (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="ml-9 mt-1 flex flex-col space-y-1 overflow-hidden"
                      >
                        {subItems.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                              `px-3 py-1.5 text-sm rounded-md transition ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                              }`
                            }
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={to!}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                    }`
                  }
                >
                  {icon}
                  {!collapsed && <span className="truncate text-sm">{label}</span>}
                </NavLink>
              )}
            </div>
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
