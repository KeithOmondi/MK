import React, { useState } from "react";
import {
  FaGift,
  FaTag,
  FaTrophy,
  FaCoins,
  FaCheckCircle,
  FaTimesCircle,
  FaRedoAlt, // Icon for 'Apply Coupon'
} from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md"; // For consistency in date display

// --- Type Definitions ---
interface Coupon {
  id: string;
  code: string;
  discount: string;
  expiry: string;
  status: "active" | "expired" | "redeemed";
  description: string;
}

// ==========================
// 1. Coupon Card Component (Voucher Style)
// ==========================
interface CouponCardProps {
  coupon: Coupon;
  onApply: (code: string) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply }) => {
  const isExpired = coupon.status === "expired";
  const isRedeemed = coupon.status === "redeemed";
  const isActive = coupon.status === "active";

  // Dynamic styling for the voucher
  const cardClasses = `
    p-6 rounded-xl border-2 transition duration-300 relative overflow-hidden
    ${
      isActive
        ? "bg-white border-indigo-200 shadow-md hover:shadow-lg"
        : isRedeemed
        ? "bg-green-50 border-green-200 shadow-sm opacity-80"
        : "bg-gray-100 border-gray-300 shadow-sm opacity-60"
    }
  `;

  const buttonClasses = `
    mt-4 w-full py-2 rounded-lg font-bold transition duration-200 flex items-center justify-center gap-2 text-sm
    ${
      isActive
        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }
  `;

  // Status icon and color
  const statusIcon = isRedeemed ? FaCheckCircle : isExpired ? FaTimesCircle : FaCoins;
  const statusColor = isRedeemed ? "text-green-600" : isExpired ? "text-red-500" : "text-yellow-500";
  const statusLabel = isActive ? "Ready" : isRedeemed ? "Used" : "Expired";

  return (
    <div className={cardClasses}>
      
      {/* Discount Badge (Prominent) */}
      <div className={`absolute top-0 right-0 p-2 px-4 rounded-bl-xl font-extrabold text-xl text-white ${isActive ? 'bg-indigo-600' : 'bg-gray-400'}`}>
        {coupon.discount}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          {/* Coupon Code */}
          <h3 className={`text-2xl font-black tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
            {coupon.code}
          </h3>
          {/* Description */}
          <p className="text-gray-600 text-sm mt-1">{coupon.description}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-dashed border-gray-300 flex justify-between items-center text-xs">
          {/* Expiry Date */}
          <p className="text-gray-500 flex items-center gap-1">
            <MdOutlineDateRange size={14} />
            <span className="font-semibold">Expires:</span> {coupon.expiry}
          </p>

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            {React.createElement(statusIcon, { size: 14, className: statusColor })}
            <span className={`font-bold uppercase ${statusColor}`}>{statusLabel}</span>
          </div>
      </div>


      <button
        disabled={!isActive}
        onClick={() => onApply(coupon.code)}
        className={buttonClasses}
      >
        {isActive ? (
            <>
                <FaRedoAlt size={14} /> Apply Now
            </>
        ) : (
            statusLabel
        )}
      </button>
    </div>
  );
};


// ==========================
// 2. CouponsRewards Main Component
// ==========================
const CouponsRewards: React.FC = () => {
  const [rewardPoints, setRewardPoints] = useState(320);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: "1", code: "WELCOME10", discount: "10% OFF", expiry: "2025-12-31", status: "active", description: "Get 10% off your first order above KSh 1,000" },
    { id: "2", code: "FREESHIP", discount: "Free Shipping", expiry: "2025-10-30", status: "redeemed", description: "Free delivery on your next order" },
    { id: "3", code: "FESTIVE25", discount: "25% OFF", expiry: "2024-12-25", status: "expired", description: "Celebrate the holidays with a 25% discount" },
  ]);

  const redeemPoints = () => {
    if (rewardPoints < 100) return alert("You need at least 100 points to redeem.");
    setRewardPoints((prev) => prev - 100);
    alert("🎉 You’ve redeemed 100 points for KSh 100 wallet credit!");
  };

  const handleApplyCoupon = (code: string) => {
    alert(`Coupon ${code} applied successfully 🎉 (Implementation would link this to your checkout process)`);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FaGift className="text-indigo-700 text-3xl" />
          My Rewards Hub
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your exclusive coupons and loyalty points.</p>
      </div>

      {/* REWARD SUMMARY (Dominant Card) */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 sm:p-8 mb-12 transform hover:scale-[1.01] transition duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-widest text-indigo-200">
              <FaTrophy /> Loyalty Points Balance
            </h2>
            <p className="text-5xl font-black mt-2">
              {rewardPoints.toLocaleString()} <span className="text-3xl font-semibold opacity-90">pts</span>
            </p>
            <p className="text-sm text-indigo-300 mt-2">
              100 points = KSh 100 wallet credit. You are ${320-rewardPoints} points away from the next tier!
            </p>
          </div>
          
          <button
            onClick={redeemPoints}
            disabled={rewardPoints < 100}
            className={`mt-6 md:mt-0 px-8 py-3 rounded-xl font-extrabold transition text-lg flex-shrink-0
              ${
                rewardPoints < 100
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-yellow-400 text-indigo-900 hover:bg-yellow-300 shadow-md shadow-yellow-500/50"
              }`}
          >
            Redeem 100 pts
          </button>
        </div>
      </div>

      {/* COUPONS SECTION */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaTag className="text-indigo-700" /> My Vouchers & Discounts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onApply={handleApplyCoupon} />
        ))}
      </div>

      {/* REWARD HISTORY */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaCoins className="text-yellow-600" /> Points History
        </h2>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="border-b text-left text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Action/Source</th>
                <th className="py-2 px-3 text-center">Points</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Dummy data for history */}
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-3">2025-10-10</td>
                <td className="py-3 px-3">Purchase - Laptop (Order #4531)</td>
                <td className="py-3 px-3 text-center text-green-600 font-bold">+120</td>
                <td className="py-3 px-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    Credited
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-3">2025-10-09</td>
                <td className="py-3 px-3">Redeemed for KSh 100 Credit</td>
                <td className="py-3 px-3 text-center text-red-600 font-bold">-100</td>
                <td className="py-3 px-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                    Used
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CouponsRewards;