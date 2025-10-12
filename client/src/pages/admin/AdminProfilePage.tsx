// src/pages/admin/AdminProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdCameraAlt, MdSave } from "react-icons/md";
import type { AppDispatch, RootState } from "../../redux/store";
import { updateUserProfile } from "../../redux/slices/authSlice";

const AdminProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar?.url || "",
  });
  const [preview, setPreview] = useState<string | null>(user?.avatar?.url || null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar?.url || "",
      });
      setPreview(user.avatar?.url || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (file) data.append("avatar", file);

      await dispatch(updateUserProfile(data)).unwrap();
      toast.success("Profile updated successfully ✅");
    } catch (err: any) {
      toast.error(err || "Failed to update profile ❌");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Admin Avatar"
                className="w-28 h-28 rounded-full border-4 border-indigo-500 object-cover shadow-sm"
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
              >
                <MdCameraAlt size={18} />
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative group w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              <label
                htmlFor="avatar"
                className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
              >
                <MdCameraAlt size={18} />
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          )}
          <span className="font-semibold text-gray-800 text-lg">
            {user?.name || "Admin User"}
          </span>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <MdSave size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
