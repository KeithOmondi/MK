import React, { useEffect, useState } from "react";
import { FaUndo, FaClock, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";

interface ReturnRefund {
  id: string;
  orderId: string;
  productName: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Refunded";
  refundMethod: "M-Pesa" | "Wallet";
  requestDate: string;
  refundDate?: string;
}

const ReturnsRefundsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [returns, setReturns] = useState<ReturnRefund[]>([]);

  // Simulated fetch
  useEffect(() => {
    setReturns([
      {
        id: "1",
        orderId: "ORD-1001",
        productName: "Wireless Bluetooth Headphones",
        reason: "Defective product",
        status: "Approved",
        refundMethod: "Wallet",
        requestDate: "2025-09-20",
        refundDate: "2025-09-25",
      },
      {
        id: "2",
        orderId: "ORD-1002",
        productName: "Smartphone Case",
        reason: "Wrong color",
        status: "Pending",
        refundMethod: "M-Pesa",
        requestDate: "2025-10-01",
      },
      {
        id: "3",
        orderId: "ORD-1003",
        productName: "Laptop Stand",
        reason: "Damaged on arrival",
        status: "Rejected",
        refundMethod: "Wallet",
        requestDate: "2025-09-15",
      },
    ]);
  }, []);

  const filteredReturns = returns.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: ReturnRefund["status"]) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className="text-green-500" />;
      case "Rejected":
        return <FaTimesCircle className="text-red-500" />;
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Refunded":
        return <FaUndo className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Returns & Refunds
        </h1>

        {/* Search bar */}
        <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by product or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Refund Method</th>
              <th className="px-6 py-3">Request Date</th>
              <th className="px-6 py-3">Refund Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-3 font-medium">{item.orderId}</td>
                  <td className="px-6 py-3">{item.productName}</td>
                  <td className="px-6 py-3">{item.reason}</td>
                  <td className="px-6 py-3">{item.refundMethod}</td>
                  <td className="px-6 py-3">{item.requestDate}</td>
                  <td className="px-6 py-3">
                    {item.refundDate || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3 flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No returns or refunds found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary / Quick Info */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/40 p-4 rounded-xl text-green-700 dark:text-green-300">
          <h3 className="font-semibold text-lg">Approved Requests</h3>
          <p>{returns.filter((r) => r.status === "Approved").length}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-xl text-yellow-700 dark:text-yellow-300">
          <h3 className="font-semibold text-lg">Pending Requests</h3>
          <p>{returns.filter((r) => r.status === "Pending").length}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/40 p-4 rounded-xl text-red-700 dark:text-red-300">
          <h3 className="font-semibold text-lg">Rejected Requests</h3>
          <p>{returns.filter((r) => r.status === "Rejected").length}</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsRefundsPage;
