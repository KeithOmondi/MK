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

const UserSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const navLinks: NavLinkItem[] = [
    {
      to: "/user/dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
    },
    {
      to: "/user/orders",
      label: "My Orders",
      icon: <MdReceipt size={20} />,
    },
    {
      to: "/user/cart",
      label: "My Cart",
      icon: <MdShoppingCart size={20} />,
    },
    {
      to: "/user/wishlist",
      label: "Wishlist",
      icon: <MdFavorite size={20} />,
    },
    {
      to: "/user/profile",
      label: "Profile",
      icon: <MdPerson size={20} />,
    },
    {
      to: "/change-password",
      label: "Change Password",
      icon: <MdLock size={20} />,
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

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200 text-xl font-bold text-gray-800">
        User Panel
      </div>

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
