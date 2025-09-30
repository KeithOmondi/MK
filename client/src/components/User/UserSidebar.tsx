import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdShoppingCart,
  MdFavorite,
  MdReceipt,
  MdPerson,
  MdLock,
  MdLogout,
  MdLocationOn,
  MdPayment,
  MdCardGiftcard,
  MdHelp,
  MdSettings,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import { clearAuthState, logout } from "../../redux/slices/authSlice";

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const UserSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const navLinks: NavLinkItem[] = [
    // === Main ===
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
      section: "Main",
    },
    {
      to: "/user/orders",
      label: "My Orders",
      icon: <MdReceipt size={20} />,
      section: "Main",
    },
    {
      to: "/user/cart",
      label: "My Cart",
      icon: <MdShoppingCart size={20} />,
      section: "Main",
    },
    {
      to: "/user/wishlist",
      label: "Wishlist",
      icon: <MdFavorite size={20} />,
      section: "Main",
    },

    // === Account ===
    {
      to: "/user/profile",
      label: "Profile",
      icon: <MdPerson size={20} />,
      section: "Account",
    },
    {
      to: "/user/addresses",
      label: "Addresses",
      icon: <MdLocationOn size={20} />,
      section: "Account",
    },
    {
      to: "/user/payments",
      label: "Payment Methods",
      icon: <MdPayment size={20} />,
      section: "Account",
    },
    {
      to: "/user/coupons",
      label: "Coupons & Rewards",
      icon: <MdCardGiftcard size={20} />,
      section: "Account",
    },
    {
      to: "/user/settings",
      label: "Account Settings",
      icon: <MdSettings size={20} />,
      section: "Account",
    },
    {
      to: "/change-password",
      label: "Change Password",
      icon: <MdLock size={20} />,
      section: "Account",
    },

    // === Support ===
    {
      to: "/user/support",
      label: "Help & Support",
      icon: <MdHelp size={20} />,
      section: "Support",
    },
  ];

  const handleLogout = async () => {
    try {
      dispatch(logout());
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

  // Group links by section
  const groupedLinks = navLinks.reduce((acc, link) => {
    const section = link.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(link);
    return acc;
  }, {} as Record<string, NavLinkItem[]>);

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 text-xl font-bold text-gray-800">
        User Panel
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-4 flex-grow space-y-6">
        {Object.entries(groupedLinks).map(([section, links]) => (
          <div key={section}>
            <h3 className="px-4 mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wide">
              {section}
            </h3>
            <div className="flex flex-col space-y-2">
              {links.map(({ to, label, icon }) => (
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
            </div>
          </div>
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

export default UserSidebar;
