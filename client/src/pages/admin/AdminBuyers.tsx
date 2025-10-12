import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchAllUsers, deleteUserById } from "../../redux/slices/authSlice";
import { FaTrash, FaSpinner, FaUsers } from "react-icons/fa";
import {  MdOutlineDateRange } from "react-icons/md";
import { toast } from "react-toastify";

// Assuming 'User' type structure includes _id, name, email, role, avatar, createdAt
// interface User { _id: string; name: string; email: string; role: string; avatar: { url: string } | null; createdAt: string; }

const AdminBuyers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter out admins and suppliers
  const buyers = useMemo(() => users.filter((u) => u.role === "User"), [users]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this buyer? This cannot be undone.")) {
      dispatch(deleteUserById(id))
        .unwrap()
        .then(() => toast.success("Buyer deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete buyer"));
    }
  };

  // --- LOADING / ERROR STATES ---
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-600">Loading buyer data...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center bg-white rounded-xl shadow-md p-10">
        <p className="text-red-600 font-semibold">❌ Failed to fetch users.</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
    
  // --- MAIN CONTENT ---
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <FaUsers className="text-indigo-600 text-3xl" />
        Buyer Accounts
      </h1>

      {buyers.length === 0 ? (
        <p className="text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg">No active buyer accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700 border-collapse">
            {/* Table Header - Clean and Typography Focused */}
            <thead>
              <tr className="border-b border-gray-200 text-left uppercase text-xs tracking-wider font-semibold text-gray-500 bg-gray-50">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4 hidden sm:table-cell">Email</th>
                <th className="py-3 px-4 hidden md:table-cell">Role</th>
                <th className="py-3 px-4 hidden lg:table-cell">Joined</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            
            <tbody>
              {buyers.map((buyer) => (
                <tr key={buyer._id} className="border-b border-gray-100 hover:bg-indigo-50/50 transition duration-150">
                  {/* User (Avatar + Name) */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {buyer.avatar?.url ? (
                        <img
                          src={buyer.avatar.url}
                          alt={buyer.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-indigo-200">
                          {buyer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="font-medium text-gray-900">
                         {buyer.name}
                      </div>
                    </div>
                  </td>
                  
                  {/* Email */}
                  <td className="py-4 px-4 text-gray-600 hidden sm:table-cell">
                    {buyer.email}
                  </td>
                  
                  {/* Role */}
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="capitalize font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs">
                        {buyer.role}
                    </span>
                  </td>
                  
                  {/* Joined Date */}
                  <td className="py-4 px-4 text-gray-500 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm">
                        <MdOutlineDateRange className="text-gray-400" />
                        {buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  
                  {/* Action */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleDelete(buyer._id)}
                      className="text-red-500 hover:text-white hover:bg-red-600 p-2 rounded-full transition-all duration-200"
                      title="Delete User"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBuyers;