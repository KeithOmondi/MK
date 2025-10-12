// src/pages/user/Profile.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdEdit, MdSave, MdUpload } from "react-icons/md";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  updateUserProfile,
  fetchUserProfile,
} from "../../redux/slices/authSlice";

/* ======================
   Type Definitions
====================== */
interface FormDataState {
  name: string;
  email: string;
  password: string;
  avatar: string | File | { url: string; public_id?: string };
}

/* ======================
   Profile Component
====================== */
const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error, success, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

  /* ======================
     Load user info
  ====================== */
  useEffect(() => {
    if (!user?._id) {
      dispatch(fetchUserProfile());
    } else {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        avatar: user.avatar || "",
      });
    }
  }, [user, dispatch]);

  /* ======================
     Toast Feedback
  ====================== */
  useEffect(() => {
    if (error) toast.error(error);
    if (success) toast.success(success);
  }, [error, success]);

  /* ======================
     Input Change Handler
  ====================== */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================
     Avatar Upload Handler
  ====================== */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: file }));
        setUploading(false);
        toast.success("Avatar uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload avatar");
      setUploading(false);
    }
  };

  /* ======================
     Submit Handler
  ====================== */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("email", formData.email);
    if (formData.password) updatedData.append("password", formData.password);

    if (formData.avatar instanceof File) {
      updatedData.append("avatar", formData.avatar);
    }

    dispatch(updateUserProfile(updatedData));
    setEditMode(false);
  };

  /* ======================
     Render JSX
  ====================== */
  return (
    <motion.div
      className="p-6 md:p-10 bg-gray-50 min-h-screen max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
        My Profile
      </h1>

      {/* === Profile Card === */}
      <motion.div
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          {/* === Avatar & User Info === */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={
                  formData.avatar instanceof File
                    ? URL.createObjectURL(formData.avatar)
                    : typeof formData.avatar === "string"
                    ? formData.avatar
                    : user?.avatar?.url ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "User"
                      )}`
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
              />

              <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition">
                <MdUpload size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* === Edit Button === */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              editMode
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <MdEdit size={18} />
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* === Edit Form === */}
        {editMode && (
          <motion.form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                } transition`}
              >
                {loading ? (
                  <MdUpload className="animate-spin" size={20} />
                ) : (
                  <MdSave size={20} />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>

      {/* === Summary Cards === */}
      <motion.div
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: "Total Orders", value: 25 },
          { label: "Total Spent", value: "KSh 12,450" },
          { label: "Loyalty Points", value: 320 },
          { label: "Membership Level", value: "Gold" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center"
          >
            <p className="text-gray-400 text-sm mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Profile;
