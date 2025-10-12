// src/pages/supplier/SupplierProfilePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSpinner, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchSupplierById,
  updateSupplier,
} from "../../redux/slices/supplierSlice";
import {  updateUserProfile } from "../../redux/slices/authSlice";

const SupplierProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const supplier = useSelector((state: RootState) => state.suppliers.supplier);
  const loading = useSelector((state: RootState) => state.suppliers.loading);

  const [avatarPreview, setAvatarPreview] = useState<string>("/default-avatar.png");
  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [supplierForm, setSupplierForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    idNumber: "",
    taxNumber: "",
    shopName: "",
    businessType: "retailer",
    website: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Fetch supplier data when user logs in
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchSupplierById(user._id));
    }
  }, [user, dispatch]);

  // ✅ Sync form data when supplier/user changes
  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name || "",
        email: user.email || "",
      });
      if (user.avatar?.url) setAvatarPreview(user.avatar.url);
    }

    if (supplier) {
      setSupplierForm({
        fullName: supplier.fullName || "",
        phoneNumber: supplier.phoneNumber || "",
        address: supplier.address || "",
        idNumber: supplier.idNumber || "",
        taxNumber: supplier.taxNumber || "",
        shopName: supplier.shopName || "",
        businessType: supplier.businessType || "retailer",
        website: supplier.website || "",
      });
    }
  }, [user, supplier]);

  // ✅ Handle avatar preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleSupplierChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value });
  };

  // ✅ Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id || !supplier?._id) {
      toast.error("Missing supplier or user profile data!");
      return;
    }

    try {
      // 1️⃣ Update User Info (Name + Avatar)
      const userData = new FormData();
      userData.append("name", userForm.name);
      if (fileInputRef.current?.files?.[0]) {
        userData.append("avatar", fileInputRef.current.files[0]);
      }
      await dispatch(updateUserProfile(userData)).unwrap();

      // 2️⃣ Update Supplier Info
      const supplierData = new FormData();
      Object.entries(supplierForm).forEach(([key, value]) =>
        supplierData.append(key, value)
      );
      await dispatch(updateSupplier({ id: supplier._id, formData: supplierData })).unwrap();

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err || "Failed to update profile");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Supplier Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="relative">
              <img
                src={avatarPreview}
                alt={userForm.name || "Avatar"}
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition"
              >
                <FaUpload size={14} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <span className="font-semibold text-gray-800">
              {userForm.name || "Unnamed Supplier"}
            </span>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={userForm.name}
                onChange={handleUserChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userForm.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="my-6" />

          {/* Supplier Info */}
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Business Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                name="shopName"
                value={supplierForm.shopName}
                onChange={handleSupplierChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={supplierForm.phoneNumber}
                onChange={handleSupplierChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type
              </label>
              <select
                name="businessType"
                value={supplierForm.businessType}
                onChange={handleSupplierChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={supplierForm.website}
                onChange={handleSupplierChange}
                placeholder="https://mystore.co.ke"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierProfilePage;
