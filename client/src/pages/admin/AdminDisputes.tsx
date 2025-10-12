import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchAllDisputes,
  updateDisputeStatus,
  deleteDispute,
  selectDisputes,
  clearDisputeMessages,
} from "../../redux/slices/disputesSlice";
import { toast } from "react-hot-toast";
import { Loader2, Search, Trash2, CheckCircle2, XCircle } from "lucide-react";

const AdminDisputes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { disputes, loading, error, successMessage } = useSelector(selectDisputes);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllDisputes());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
    if (successMessage) toast.success(successMessage);
    dispatch(clearDisputeMessages());
  }, [error, successMessage, dispatch]);

  const handleStatusUpdate = (id: string, status: string) => {
    dispatch(updateDisputeStatus({ id, status: status as any }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this dispute?")) {
      dispatch(deleteDispute(id));
    }
  };

  const filteredDisputes = disputes.filter(
    (d) =>
      d.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof d.user === "object" ? d.user.name.toLowerCase() : d.user.toLowerCase()) ||
      (typeof d.orderId === "object"
        ? d.orderId.orderNumber.toLowerCase()
        : d.orderId.toLowerCase())
  );

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    "In Review": "bg-indigo-100 text-indigo-700",
    Resolved: "bg-green-100 text-green-700",
    Escalated: "bg-orange-100 text-orange-700",
    Closed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Dispute Management</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search disputes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!loading && filteredDisputes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDisputes.map((d, idx) => (
                <tr key={d._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{idx + 1}</td>
                  <td className="px-6 py-3">
                    {typeof d.orderId === "object" ? d.orderId.orderNumber : d.orderId}
                  </td>
                  <td className="px-6 py-3">{typeof d.user === "object" ? d.user.name : d.user}</td>
                  <td className="px-6 py-3">{typeof d.seller === "object" ? d.seller.name : d.seller}</td>
                  <td className="px-6 py-3">{d.type}</td>
                  <td className="px-6 py-3">{d.reason}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    {d.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(d._id, "Resolved")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Resolve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(d._id, "Escalated")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600 transition"
                        >
                          <XCircle className="w-4 h-4" /> Escalate
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
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
    </div>
  );
};

export default AdminDisputes;
