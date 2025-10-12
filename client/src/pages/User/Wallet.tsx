import React, { useState } from "react";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaPlus, // Changed to FaPlus for cleaner button icon
  FaHistory,
  FaExchangeAlt,
} from "react-icons/fa";
import { MdAccessTime } from "react-icons/md"; // Changed to MdAccessTime for consistency with minimalist theme

// --- Type Definitions ---
interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

// ==========================
// 1. Transaction Row Component (Minimalist List Item)
// ==========================
interface TransactionRowProps {
  tx: Transaction;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx }) => {
  const isCredit = tx.type === "credit";
  const icon = isCredit ? FaArrowDown : FaArrowUp;
  const amountColor = isCredit ? "text-green-600" : "text-red-600";
  // Subtle background for the icon
  const iconBg = isCredit ? "bg-green-50" : "bg-red-50"; 
  const amountPrefix = isCredit ? "+" : "-";

  const formattedDate = new Date(tx.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    // Clean, two-column layout optimized for scanning
    <div className="grid grid-cols-6 items-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition duration-150">
      
      {/* Type Icon & Description (Column 1-4) */}
      <div className="col-span-4 flex items-center min-w-0 pr-4">
        <div className={`p-2 rounded-lg mr-4 ${iconBg} flex-shrink-0`}>
          {React.createElement(icon, { size: 16, className: amountColor })}
        </div>
        <div className="truncate">
          <p className="text-gray-900 font-medium truncate">{tx.description}</p>
          <div className="flex items-center text-xs text-gray-500 mt-0.5">
            <MdAccessTime size={13} className="mr-1 opacity-70" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      {/* Amount (Column 5-6) */}
      <div className="col-span-2 text-right font-semibold text-base flex-shrink-0">
        <span className={amountColor}>
          {amountPrefix} Ksh {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};


// ==========================
// 2. Wallet Main Component (Monochromatic/Premium Style)
// ==========================
const Wallet: React.FC = () => {
  const [balance] = useState<number>(3450.75);

  const transactions: Transaction[] = [
    { id: "1", type: "credit", amount: 1500, description: "Refund from cancelled order", date: "2025-10-10" },
    { id: "2", type: "debit", amount: 2300, description: "Payment for Bluetooth Headphones", date: "2025-10-09" },
    { id: "3", type: "credit", amount: 1000, description: "Manual top-up via M-Pesa", date: "2025-10-08" },
    { id: "4", type: "debit", amount: 450.75, description: "Purchase: Smartwatch Charger", date: "2025-10-07" },
  ];

  const handleAction = (action: string) => {
    alert(`Action: ${action} initiated!`);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      
      {/* Main Header */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <FaWallet className="text-indigo-700 text-3xl" />
          My Wallet
        </h1>
      </div>

      {/* Balance Card and Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          
          {/* Balance */}
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Current Balance</p>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Ksh {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Action Buttons (Compact, Outlined Style) */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAction("Add Funds")}
              className="flex items-center gap-2 border border-green-500 text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2.5 rounded-lg font-semibold transition"
            >
              <FaPlus size={16} /> Add Funds
            </button>
            <button
              onClick={() => handleAction("Withdraw")}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 px-4 py-2.5 rounded-lg font-semibold transition"
            >
              <FaExchangeAlt size={16} /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Transactions History Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        
        {/* Header and View All */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Recent Activity
          </h2>
          <button
            onClick={() => handleAction("View All History")}
            className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 text-sm font-medium transition"
          >
            <FaHistory size={14} /> View Full History
          </button>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No transactions recorded recently.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table-like headers for the list (since we removed the actual table) */}
            <div className="grid grid-cols-6 text-xs uppercase font-bold text-gray-500 py-2 border-b border-gray-200">
                <span className="col-span-4 pl-10">Transaction Details</span>
                <span className="col-span-2 text-right">Amount</span>
            </div>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;