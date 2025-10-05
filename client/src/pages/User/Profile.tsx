// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { MdEdit, MdSave } from "react-icons/md";
// Import your API call or slice actions
import { updateUserProfile, fetchUserProfile } from "../../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../../redux/store";

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error, success } = useSelector((state: RootState) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Load user data into form
  useEffect(() => {
    if (!user) dispatch(fetchUserProfile());
    else setFormData({ name: user.name, email: user.email, password: "" });
  }, [user, dispatch]);

  // Show toast notifications
  useEffect(() => {
    if (error) toast.error(error);
    if (success) toast.success(success);
  }, [error, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
    setEditMode(false);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="ml-6 flex-grow">
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400">{user?.role}</p>
          </div>
          <button
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            onClick={() => setEditMode(!editMode)}
            title={editMode ? "Cancel Edit" : "Edit Profile"}
          >
            <MdEdit size={20} />
          </button>
        </div>

        {editMode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              <MdSave size={20} /> Save Changes
            </button>
          </form>
        )}
      </div>

      {/* Optional Loyalty / Order Summary */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-white shadow rounded-xl border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">25</p>
        </div>
        <div className="p-4 bg-white shadow rounded-xl border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">KSh 12,450</p>
        </div>
        <div className="p-4 bg-white shadow rounded-xl border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">Loyalty Points</p>
          <p className="text-2xl font-bold text-gray-900">320</p>
        </div>
        <div className="p-4 bg-white shadow rounded-xl border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">Membership Level</p>
          <p className="text-2xl font-bold text-gray-900">Gold</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
