import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../redux/store";
import { createSection, fetchSectionsList } from "../../redux/slices/sectionSlice";
import { FaTimes, FaPlusCircle, FaTag, FaUpload, FaSpinner } from "react-icons/fa";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const sectionOptions = ["FlashSales", "BestDeals", "NewArrivals", "TopTrending"];

const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image: null as File | null,
    price: "",
    discountType: "none",
    discountValue: "",
    discountedPrice: 0,
    sections: [] as string[],
  });

  if (!isOpen) return null;

  const inputStyle =
    "w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-150 shadow-sm placeholder:text-gray-400";

  const labelStyle = "block text-sm font-semibold text-gray-700 mb-1";

  const checkboxContainerStyle = (isSelected: boolean) =>
    `flex items-center space-x-2 border-2 ${
      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
    } rounded-xl px-4 py-3 cursor-pointer transition duration-200 shadow-sm`;

type FormKeys = "name" | "image" | "price" | "discountType" | "discountValue" | "discountedPrice" | "sections";

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev };

    switch (name as FormKeys) {
      case "price":
        updated.price = value;
        break;
      case "discountValue":
        updated.discountValue = value;
        break;
      case "discountType":
        updated.discountType = value as "none" | "percentage" | "fixed";
        break;
      case "name":
        updated.name = value;
        break;
      default:
        // no-op for keys like 'image', 'discountedPrice', 'sections' handled elsewhere
        break;
    }

    // Recalculate discountedPrice
    const priceNum = Number(updated.price);
    const discountNum = Number(updated.discountValue);
    let discountedPrice = priceNum;

    if (updated.discountType === "percentage") {
      discountedPrice = priceNum - (priceNum * discountNum) / 100;
    } else if (updated.discountType === "fixed") {
      discountedPrice = priceNum - discountNum;
    }

    updated.discountedPrice = Math.max(0, discountedPrice);

    return updated;
  });
};



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      e.target.value = "";
      setFormData((prev) => ({ ...prev, image: null }));
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSectionToggle = (section: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Section name required");
    if (!formData.price) return toast.warning("Price is required");
    if (!formData.image) return toast.warning("Section image is required");
    if (formData.sections.length === 0) return toast.warning("Select at least one section type");

    try {
      setLoading(true);
      const result = await dispatch(createSection({ name: formData.name })).unwrap();
      toast.success(`✅ Section "${result.name}" created successfully!`);
      setFormData({
        name: "",
        image: null,
        price: "",
        discountType: "none",
        discountValue: "",
        discountedPrice: 0,
        sections: [],
      });
      dispatch(fetchSectionsList());
      if (onCreated) onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0 relative">
          <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
            <FaPlusCircle className="text-blue-500" /> Add New Product Section
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Name */}
          <div>
            <label className={labelStyle}>Section Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} placeholder="Summer Mega Sale" />
          </div>

          {/* Pricing */}
          <div className="border border-dashed border-gray-200 p-4 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaTag className="text-yellow-600" /> Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Original Price (KSh) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} step="0.01" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange} className={inputStyle}>
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (KSh)</option>
                </select>
              </div>
              {formData.discountType !== "none" && (
                <div>
                  <label className={labelStyle}>Discount Value</label>
                  <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} min={0} step="0.01" className={inputStyle} placeholder={formData.discountType === 'percentage' ? '20%' : '500'} />
                </div>
              )}
            </div>
            <div>
              <label className={labelStyle}>Final Discounted Price</label>
              <input type="text" value={`KSh ${formData.discountedPrice.toFixed(2)}`} readOnly className="w-full p-3 border-2 rounded-xl bg-green-50 border-green-200 font-bold text-green-700" />
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className={labelStyle}>Section Types *</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {sectionOptions.map((section) => (
                <label key={section} className={checkboxContainerStyle(formData.sections.includes(section))}>
                  <input type="checkbox" checked={formData.sections.includes(section)} onChange={() => handleSectionToggle(section)} className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <span className={`font-medium ${formData.sections.includes(section) ? 'text-blue-800' : 'text-gray-700'}`}>{section}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select website sections where this campaign appears.</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelStyle}>Section Banner Image *</label>
            <div className="flex items-center gap-3 mt-1">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="section-image" />
              <label htmlFor="section-image" className="flex-grow p-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer flex items-center justify-center gap-2">
                <FaUpload className="w-5 h-5" />
                {formData.image ? formData.image.name : "Choose an image (Max 5MB)"}
              </label>
              {formData.image && (
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: null }))} className="text-red-500 hover:text-red-700 p-2">
                  <FaTimes className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 font-semibold disabled:opacity-50">Cancel</button>
          <button type="submit" form="" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-400">
            {loading ? <FaSpinner className="animate-spin h-5 w-5" /> : <FaPlusCircle className="h-5 w-5" />}
            {loading ? "Saving..." : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;
