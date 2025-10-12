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
  MdClose, // Changed MdMenu to MdClose for the mobile close button
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

// ==========================
// 1. Mobile-First Admin Sidebar
// ==========================
const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // We use `collapsed` for desktop state, but manage mobile visibility locally for better UX
  const { collapsed: desktopCollapsed, toggleSidebar } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false); // New state for mobile visibility
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
        { to: "/admin/users/suppliers", label: "Sellers" },
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

  // Helper function to close mobile sidebar on navigation
  const handleNavClick = (isDropdownItem = false) => {
    if (isDropdownItem) {
        // Close dropdown when item is clicked
        setOpenDropdown(null);
    }
    if (mobileOpen) {
      setMobileOpen(false); // Close mobile menu after clicking an item
    }
  };

  const currentCollapsed = window.innerWidth >= 768 ? desktopCollapsed : !mobileOpen;

  return (
    <>
      {/* 1. Mobile Menu Button (Visible on mobile, controls mobileOpen state) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 md:hidden"
        aria-label="Open sidebar menu"
      >
        <MdClose size={22} /> {/* Use close as the default icon on mobile for consistency */}
      </button>

      {/* 2. Mobile Backdrop (Only visible on mobile when open) */}
      {mobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 3. Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white shadow-xl flex flex-col border-r border-gray-200 transition-transform duration-300 ease-in-out
          // Desktop States (md: screens)
          md:translate-x-0
          ${desktopCollapsed ? "w-20" : "w-64"}
          // Mobile States (default screens)
          ${mobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"} 
        `}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b border-gray-200 p-4">
            <div className="flex items-center">
                {!currentCollapsed ? (
                    <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
                ) : (
                    <MdDashboard size={26} className="text-indigo-600" />
                )}
            </div>
            
            {/* Desktop Collapse Button (Hidden on mobile) */}
            <button
                onClick={toggleSidebar}
                className="hidden md:block text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                aria-label="Toggle sidebar collapse"
            >
                {desktopCollapsed ? <MdExpandMore size={24} className="transform rotate-90" /> : <MdExpandMore size={24} className="transform -rotate-90" />}
            </button>

            {/* Mobile Close Button (Hidden on desktop) */}
            <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                aria-label="Close sidebar menu"
            >
                <MdClose size={24} />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-3 space-y-1 flex-grow overflow-y-auto scrollbar-hide">
          {navGroups.map(({ label, icon, to, subItems }) => (
            <div key={label}>
              {subItems ? (
                <>
                  <button
                    onClick={() => toggleDropdown(label)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 ${
                      openDropdown === label ? "bg-indigo-50 text-indigo-600" : ""
                    }`}
                    disabled={currentCollapsed} // Disable dropdown toggle if sidebar is collapsed
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      {!currentCollapsed && <span className="truncate text-sm">{label}</span>}
                    </div>
                    {!currentCollapsed &&
                      (openDropdown === label ? (
                        <MdExpandLess size={20} />
                      ) : (
                        <MdExpandMore size={20} />
                      ))}
                  </button>

                  {/* Dropdown Animation (Only visible when NOT collapsed) */}
                  <AnimatePresence>
                    {!currentCollapsed && openDropdown === label && (
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
                            onClick={() => handleNavClick(true)} // Close mobile menu on click
                            className={({ isActive }) =>
                              `px-3 py-1.5 text-sm rounded-md transition ${
                                isActive
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
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
                  onClick={() => handleNavClick(false)} // Close mobile menu on click
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 
                    ${currentCollapsed ? 'justify-center w-full' : ''} 
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-600"
                    }`
                  }
                >
                  {icon}
                  {!currentCollapsed && <span className="truncate text-sm">{label}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md font-medium transition-colors duration-200
                ${currentCollapsed ? 'justify-center' : ''}
            `}
          >
            <MdLogout size={20} />
            {!currentCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;