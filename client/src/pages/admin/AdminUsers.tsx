import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  updateUserById,
  deleteUserById,
  registerNewAdmin,
  type User,
} from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../redux/store";
import { FaUserEdit, FaTrashAlt, FaPlus } from "react-icons/fa"; // Using icons for better button visibility

// Helper component for role/status badges
const RoleBadge = ({ role }: { role: User["role"] }) => {
  let colorClasses = "bg-gray-200 text-gray-700";
  switch (role) {
    case "Admin":
      colorClasses = "bg-indigo-100 text-indigo-700 font-bold ring-1 ring-indigo-400";
      break;
    case "Supplier":
      colorClasses = "bg-orange-100 text-orange-700 ring-1 ring-orange-400";
      break;
    case "User":
      colorClasses = "bg-green-100 text-green-700 ring-1 ring-green-400";
      break;
    default:
      break;
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${colorClasses}`}
    >
      {role}
    </span>
  );
};

const AdminUsers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users = [], loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  // Instead of a separate editForm state, we'll put the modal in state.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: User["role"];
  }>({ name: "", email: "", role: "User" });

  // Fetch all users on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Show toast notifications
  useEffect(() => {
    if (error) toast.error(error);
    // Success is typically handled per action, but if the slice handles generic success, keep this:
    if (success) toast.success(success);
  }, [error, success]);

  // Edit handlers
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value as User["role"] | string }));
  };

  const handleEditSubmit = () => {
    if (!selectedUser) return;
    dispatch(updateUserById({ id: selectedUser._id, updates: editForm }))
      .unwrap()
      .then(() => {
        toast.success(`User ${selectedUser.name} updated successfully!`);
        setIsModalOpen(false);
        setSelectedUser(null);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to update user.");
      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Delete user
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`⚠️ Are you sure you want to delete user: ${name}? This cannot be undone.`)) {
      dispatch(deleteUserById(id))
        .unwrap()
        .then(() => toast.success(`User ${name} deleted.`))
        .catch((err) => toast.error(err.message || "Failed to delete user."));
    }
  };

  // Add new admin
  const handleAddAdmin = () => {
    // Replaced basic prompts with a proper modal/form in a professional app, 
    // but keeping prompt structure for code consistency
    const name = prompt("Enter new Admin name:");
    const email = prompt("Enter new Admin email:");
    const password = prompt("Enter new Admin password:");
    if (name && email && password) {
      dispatch(registerNewAdmin({ name, email, password }))
        .unwrap()
        .then(() => toast.success(`Admin ${name} registered!`))
        .catch((err) => toast.error(err.message || "Failed to register admin."));
    }
  };

  if (loading && users.length === 0) return (
    <div className="flex items-center justify-center p-20">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-xl text-indigo-600 font-medium">Loading user data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            👥 User Management
        </h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
          onClick={handleAddAdmin}
        >
          <FaPlus size={14} />
          Add New Admin
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-800 text-white shadow-lg">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-sm tracking-wider uppercase">Role</th>
                <th className="px-6 py-3 text-center font-semibold text-sm tracking-wider uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {users.length > 0
                ? users.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 flex gap-2 justify-center items-center">
                        <button
                          title="Edit User"
                          className="p-2 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition duration-150"
                          onClick={() => handleEditClick(user)}
                        >
                          <FaUserEdit size={16} />
                        </button>
                        <button
                          title="Delete User"
                          className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition duration-150"
                          onClick={() => handleDelete(user._id, user.name)}
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-lg text-gray-500 italic">
                        No users found in the database.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform duration-300">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Edit User: <span className="text-indigo-600">{selectedUser.name}</span></h3>
            </div>
            
            {/* Modal Body (Form) */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white transition"
                >
                  <option value="User">User (Standard)</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            
            {/* Modal Footer (Actions) */}
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md"
                onClick={handleEditSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;