import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchUserDisputes,
  createDispute,
  clearDisputeMessages,
} from "../../redux/slices/disputesSlice";
import { toast } from "react-hot-toast";
import { Loader2, Search, PlusCircle } from "lucide-react";

// Predefined dispute reasons
const REASONS = [
  "Product Issue",
  "Late Delivery",
  "Wrong Item",
  "Refund",
  "Other",
];

interface NewDisputeForm {
  orderId: string;
  reason: string;
}

const UserDisputes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { disputes, loading, error, successMessage } = useSelector(
    (state: RootState) => state.disputes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewDisputeForm>({ orderId: "", reason: "" });

  // Fetch user disputes on mount
  useEffect(() => {
    dispatch(fetchUserDisputes());
  }, [dispatch]);

  // Show toast notifications
  useEffect(() => {
    if (error) toast.error(error);
    if (successMessage) toast.success(successMessage);
    dispatch(clearDisputeMessages());
  }, [error, successMessage, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.reason) return toast.error("All fields are required!");
    dispatch(createDispute({ order: form.orderId, reason: form.reason }));
    setForm({ orderId: "", reason: "" });
    setShowModal(false);
  };

  const filteredDisputes = disputes.filter((d) =>
    d.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Disputes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" /> New Dispute
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search disputes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Disputes Table */}
      {!loading && filteredDisputes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDisputes.map((dispute, idx) => (
                <tr key={dispute._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3">
                    {typeof dispute.orderId === "object"
                      ? dispute.orderId.orderNumber
                      : dispute.orderId}
                  </td>
                  <td className="px-6 py-3">{dispute.reason}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        dispute.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : dispute.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
            No disputes found.
          </div>
        )
      )}

      {/* New Dispute Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Dispute</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Order ID</label>
                <input
                  type="text"
                  name="orderId"
                  value={form.orderId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Reason</label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select reason</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDisputes;
