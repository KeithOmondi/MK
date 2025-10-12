import React, { useState, useMemo } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaSearch,
  FaFilter,
  FaWallet,
} from "react-icons/fa";
import { MdOutlineAccessTime, MdOutlineInfo } from "react-icons/md"; // Added for status clarity

// --- Type Definitions ---
interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
}

// ==========================
// 1. Transaction Row Component (Replaced standard <tr> for better styling)
// ==========================
interface TransactionRowProps {
  tx: Transaction;
}

const getStatusBadgeClasses = (status: Transaction["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const TransactionRow: React.FC<TransactionRowProps> = ({ tx }) => {
  const isCredit = tx.type === "credit";
  const directionIcon = isCredit ? FaArrowDown : FaArrowUp;
  const directionColor = isCredit ? "text-green-600" : "text-red-600";
  const amountPrefix = isCredit ? "+" : "-";

  const statusClasses = getStatusBadgeClasses(tx.status);

  return (
    // This div serves as the table row (tr) but is more flexible
    <div className="grid grid-cols-6 lg:grid-cols-[1fr_0.8fr_3fr_1.5fr_1.5fr_1.2fr] items-center py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition duration-150 text-sm">
      
      {/* 1. Txn ID */}
      <div className="hidden lg:block text-gray-500 font-mono text-xs px-3">
        #{tx.id}
      </div>
      
      {/* 2. Type */}
      <div className="col-span-1 flex items-center gap-2 px-3">
        <div className={`p-1 rounded-full ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
            {React.createElement(directionIcon, { size: 14, className: directionColor })}
        </div>
        <span className={`hidden sm:block font-semibold ${directionColor}`}>
          {isCredit ? "Credit" : "Debit"}
        </span>
      </div>
      
      {/* 3. Description (Primary field on mobile) */}
      <div className="col-span-3 lg:col-span-1 font-medium text-gray-800 px-3 truncate">
        {tx.description}
      </div>
      
      {/* 4. Amount */}
      <div className={`col-span-1 lg:col-span-1 font-extrabold text-right sm:text-left px-3 ${directionColor}`}>
        {amountPrefix} Ksh {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
      
      {/* 5. Date */}
      <div className="hidden lg:flex items-center gap-1 text-gray-500 px-3 text-xs">
        <MdOutlineAccessTime size={14} />
        {tx.date}
      </div>
      
      {/* 6. Status */}
      <div className="col-span-1 lg:col-span-1 text-right sm:text-left px-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider ${statusClasses}`}>
          {tx.status}
        </span>
      </div>
    </div>
  );
};

// ==========================
// 2. Transactions Main Component
// ==========================
const Transactions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">(
    "all"
  );

  const transactions: Transaction[] = [
    { id: "4531", type: "credit", amount: 1500, description: "Refund from Order #4531", date: "2025-10-10", status: "Completed" },
    { id: "4530", type: "debit", amount: 2200, description: "Purchase - Smart Watch", date: "2025-10-09", status: "Completed" },
    { id: "4529", type: "credit", amount: 1000, description: "Wallet top-up via M-Pesa", date: "2025-10-08", status: "Pending" },
    { id: "4528", type: "debit", amount: 750, description: "Purchase - Wireless Mouse", date: "2025-10-05", status: "Completed" },
    { id: "4527", type: "credit", amount: 1200, description: "Refund for Returned Item", date: "2025-10-04", status: "Completed" },
    { id: "4526", type: "debit", amount: 300, description: "M-Pesa Withdrawal Fee", date: "2025-10-03", status: "Failed" },
  ];

  // Filter + Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        filterType === "all" ? true : tx.type === filterType;
      const matchesSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FaWallet className="text-indigo-700 text-3xl" />
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review all credits, debits, and status updates for your wallet.</p>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Search Input */}
        <div className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl w-full sm:w-2/5 focus-within:border-indigo-500 transition">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions by description or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <FaFilter className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none appearance-none bg-white hover:border-indigo-500 transition"
          >
            <option value="all">All Types</option>
            <option value="credit">Credits (Income)</option>
            <option value="debit">Debits (Spending)</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS LIST CARD */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
              <MdOutlineInfo size={24} className="mx-auto mb-2 text-gray-400" />
              No matching transactions found for your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Custom Table Header (Visible on large screens) */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_0.8fr_3fr_1.5fr_1.5fr_1.2fr] text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 py-3 px-6">
                <span className="px-3">Txn ID</span>
                <span className="px-3">Type</span>
                <span className="px-3">Description</span>
                <span className="px-3">Amount</span>
                <span className="px-3">Date</span>
                <span className="px-3">Status</span>
            </div>
            
            {/* Transaction Rows */}
            <div className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="px-6">
                        <TransactionRow tx={tx} />
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;