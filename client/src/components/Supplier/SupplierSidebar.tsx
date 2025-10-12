import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdInventory,
  MdReceipt,
  MdPerson,
  MdLogout,
  MdChat,
  MdExpandMore,
  MdExpandLess,
  MdStore,
  MdAttachMoney,
  MdLocalOffer,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import { clearAuthState, logout } from "../../redux/slices/authSlice";

// --- Utility Classes ---
const baseLinkStyle =
  "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition duration-200";
const activeLinkStyle = "bg-teal-500 text-white shadow-lg shadow-teal-500/50";
const hoverLinkStyle = "hover:bg-teal-100 hover:text-teal-700";
const subLinkStyle =
  "flex items-center gap-2 text-sm px-4 py-1.5 rounded-lg hover:bg-gray-100 hover:text-teal-600 transition duration-150";

// --- Utility Function ---
const isPathActive = (paths: string[], currentPath: string): boolean => {
  return paths.some((path) => currentPath.startsWith(path));
};

const SupplierSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleLogout = async () => {
    try {
      dispatch(logout());
      dispatch(clearAuthState());
      toast.success("Logged out successfully ✅");
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || "Logout failed ❌");
      else toast.error("Logout failed ❌");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col fixed top-0 left-0 bottom-0 z-30 shadow-xl">
      {/* --- Header: Profile Section --- */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-center">
        <div className="relative mb-2">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-teal-500"
            />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center bg-teal-100 text-teal-600 font-bold text-3xl rounded-full border-4 border-teal-500">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          {user?.name || "Supplier"}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {/* --- Navigation --- */}
      <nav className="flex flex-col p-4 flex-grow space-y-2 text-gray-700 overflow-y-auto">
        {/* Dashboard */}
        <NavLink
          to="/supplier/dashboard"
          className={({ isActive }) =>
            `${baseLinkStyle} ${hoverLinkStyle} ${
              isActive ? activeLinkStyle : "text-gray-700"
            }`
          }
          end
        >
          <MdDashboard size={22} />
          Dashboard
        </NavLink>

        {/* Products */}
        <SidebarDropdown
          title="Products"
          icon={<MdInventory size={22} />}
          dropdownKey="products"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/products", label: "My Products" },
            { to: "/supplier/products/add", label: "Add Product" },
            { to: "/supplier/stock", label: "Stock Management" },
          ]}
        />

        {/* Orders */}
        <SidebarDropdown
          title="Orders"
          icon={<MdReceipt size={22} />}
          dropdownKey="orders"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/orders", label: "Orders Received" },
            { to: "/supplier/returns", label: "Returns / Disputes" },
          ]}
        />

        {/* Earnings */}
        <SidebarDropdown
          title="Earnings"
          icon={<MdAttachMoney size={22} />}
          dropdownKey="earnings"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/earnings", label: "Overview" },
            { to: "/supplier/payouts", label: "Payouts" },
            { to: "/supplier/fees", label: "Fees & Charges" },
          ]}
        />

        {/* Promotions */}
        <SidebarDropdown
          title="Promotions"
          icon={<MdLocalOffer size={22} />}
          dropdownKey="promotions"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/discounts", label: "Discounts / Coupons" },
            { to: "/supplier/featured", label: "Featured Listings" },
          ]}
        />

        {/* Store Settings */}
        <SidebarDropdown
          title="Store Settings"
          icon={<MdStore size={22} />}
          dropdownKey="settings"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/store-profile", label: "Store Profile" },
            { to: "/supplier/policies", label: "Policies" },
            { to: "/supplier/business-info", label: "Business Info" },
          ]}
        />

        {/* Messages */}
        <NavLink
          to="/supplier/messages"
          className={({ isActive }) =>
            `${baseLinkStyle} ${hoverLinkStyle} ${
              isActive ? activeLinkStyle : "text-gray-700"
            }`
          }
          end
        >
          <MdChat size={22} />
          Messages
        </NavLink>

        {/* Account */}
        <SidebarDropdown
          title="Account"
          icon={<MdPerson size={22} />}
          dropdownKey="account"
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentPath={window.location.pathname}
          subLinks={[
            { to: "/supplier/profile", label: "Profile" },
            { to: "/switch-to-buyer", label: "Switch to Buyer Mode" },
          ]}
          logoutHandler={handleLogout}
        />
      </nav>

      {/* --- Footer Logout --- */}
      {openDropdown !== "account" && (
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-red-700 bg-red-100 hover:bg-red-200 rounded-xl font-medium transition-colors"
          >
            <MdLogout size={22} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default SupplierSidebar;

/* ---------------------- Helper Dropdown Component ---------------------- */
interface SidebarDropdownProps {
  title: string;
  icon: React.ReactNode;
  dropdownKey: string;
  openDropdown: string | null;
  toggleDropdown: (key: string) => void;
  currentPath: string;
  subLinks: { to: string; label: string }[];
  logoutHandler?: () => void;
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  title,
  icon,
  dropdownKey,
  openDropdown,
  toggleDropdown,
  currentPath,
  subLinks,
  logoutHandler,
}) => {
  const isActive = isPathActive(
    subLinks.map((link) => link.to),
    currentPath
  );
  const isOpen = openDropdown === dropdownKey || isActive;

  return (
    <div>
      <button
        onClick={() => toggleDropdown(dropdownKey)}
        className={`${baseLinkStyle} justify-between ${hoverLinkStyle} ${
          isOpen ? "bg-teal-50 text-teal-700" : "text-gray-700"
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {title}
        </span>
        {isOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
      </button>

      {isOpen && (
        <div className="ml-5 mt-1 flex flex-col space-y-0.5 border-l border-gray-200 pl-3 transition-all duration-300 ease-in-out">
          {subLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${subLinkStyle} ${
                  isActive
                    ? "text-teal-600 font-semibold bg-gray-100"
                    : "text-gray-600"
                }`
              }
            >
              <MdKeyboardArrowRight size={18} />
              {link.label}
            </NavLink>
          ))}
          {logoutHandler && (
            <button
              onClick={logoutHandler}
              className="text-left text-sm px-4 py-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150 flex items-center gap-2"
            >
              <MdLogout size={18} />
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
};
