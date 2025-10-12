// src/components/user/UserSidebar.tsx
import React, { useState } from "react";
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
  MdCardGiftcard,
  MdSettings,
  MdAccountBalanceWallet,
  MdHistory,
  MdOutlineSupportAgent,
  MdNotifications,
  MdExpandMore,
  MdExpandLess,
  MdChat,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import { clearAuthState, logout } from "../../redux/slices/authSlice";

// ---------- Type Definitions ----------
interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface DropdownSection {
  title: string;
  links: NavLinkItem[];
}

// ---------- Utility ----------
const baseLinkStyle =
  "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-medium transition duration-200 text-sm";
const activeLinkStyle = "bg-indigo-600 text-white shadow-md shadow-indigo-600/40";
const hoverLinkStyle = "hover:bg-indigo-100 hover:text-indigo-700";

const sectionHeaderStyle = (isOpen: boolean) =>
  `flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
    isOpen ? "text-indigo-700" : "text-gray-500 hover:text-indigo-600"
  }`;

const isSectionActive = (links: NavLinkItem[], currentPath: string): boolean =>
  links.some((link) => currentPath.startsWith(link.to));

// ---------- Component ----------
const UserSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const { user } = useSelector((state: RootState) => state.auth);

  const sections: DropdownSection[] = [
    {
      title: "OVERVIEW",
      links: [{ to: "/dashboard", label: "Dashboard Overview", icon: <MdDashboard size={20} /> }],
    },
    {
      title: "SHOPPING & HISTORY",
      links: [
        { to: "/user/orders", label: "My Orders", icon: <MdReceipt size={20} /> },
        { to: "/user/returns", label: "Returns & Refunds", icon: <MdHistory size={20} /> },
        { to: "/user/cart", label: "My Cart", icon: <MdShoppingCart size={20} /> },
        { to: "/user/wishlist", label: "Wishlist", icon: <MdFavorite size={20} /> },
      ],
    },
    {
      title: "WALLET & REWARDS",
      links: [
        { to: "/user/wallet", label: "Wallet Balance", icon: <MdAccountBalanceWallet size={20} /> },
        { to: "/user/transactions", label: "Transaction History", icon: <MdHistory size={20} /> },
        { to: "/user/coupons", label: "Coupons & Rewards", icon: <MdCardGiftcard size={20} /> },
      ],
    },
    {
      title: "PERSONAL SETTINGS",
      links: [
        { to: "/user/profile", label: "Profile", icon: <MdPerson size={20} /> },
        { to: "/user/addresses", label: "Addresses", icon: <MdLocationOn size={20} /> },
        { to: "/user/notifications", label: "Notifications", icon: <MdNotifications size={20} /> },
        { to: "/user/settings", label: "Account Settings", icon: <MdSettings size={20} /> },
        { to: "/change-password", label: "Change Password", icon: <MdLock size={20} /> },
      ],
    },
    {
      title: "SUPPORT",
      links: [
        { to: "/user/messages", label: "Messages", icon: <MdChat size={20} /> },
        { to: "/user/support", label: "Help & Support", icon: <MdOutlineSupportAgent size={20} /> },
      ],
    },
  ];

  const [openDropdown, setOpenDropdown] = useState<string | null>(() => {
    const activeSection = sections.find((section) => isSectionActive(section.links, currentPath));
    return activeSection ? activeSection.title : "OVERVIEW";
  });

  const toggleDropdown = (title: string) =>
    setOpenDropdown((prev) => (prev === title ? null : title));

  const handleLogout = async () => {
    try {
      dispatch(logout());
      dispatch(clearAuthState());
      toast.success("Signed out successfully ✅");
      navigate("/login");
    } catch {
      toast.error("Sign out failed ❌");
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkStyle} ${hoverLinkStyle} ${
      isActive ? activeLinkStyle : "text-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed top-0 left-0 bottom-0 z-30 shadow-2xl">
      {/* ---------- Header with Avatar + Name ---------- */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-3">
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.name || "User Avatar"}
            className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <span className="font-semibold text-gray-800 text-sm text-center mt-1">
          {user?.name || "Guest User"}
        </span>
      </div>

      {/* ---------- Navigation ---------- */}
      <nav className="flex flex-col flex-grow overflow-y-auto p-4 space-y-2">
        {sections.map((section) => {
          const isOpen = openDropdown === section.title;
          const isActive = isSectionActive(section.links, currentPath);

          return (
            <div key={section.title}>
              {/* Section Header */}
              <div
                onClick={() => toggleDropdown(section.title)}
                className={`
                  ${sectionHeaderStyle(isOpen || isActive)} 
                  rounded-lg 
                  ${(isOpen || isActive) ? "bg-indigo-50/70" : "hover:bg-gray-50"}
                  mb-1 
                  transition-colors
                `}
              >
                <span>{section.title}</span>
                {isOpen ? (
                  <MdExpandLess size={20} className="text-indigo-600" />
                ) : (
                  <MdExpandMore size={20} />
                )}
              </div>

              {/* Dropdown Links */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div className="flex flex-col space-y-1">
                  {section.links.map(({ to, label, icon }) => (
                    <NavLink key={to} to={to} className={navLinkClass} end>
                      {icon}
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* ---------- Logout Button ---------- */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-700 bg-red-100 hover:bg-red-200 rounded-xl font-bold transition-colors"
        >
          <MdLogout size={22} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default UserSidebar;
