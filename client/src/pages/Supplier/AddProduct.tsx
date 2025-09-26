// src/pages/admin/AddProducts.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { createProduct } from "../../redux/slices/productSlice";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { toast } from "react-toastify";
import { FaPlusCircle, FaRegFileImage } from "react-icons/fa";

// ==========================
// Types
// ==========================
interface ProductFormData {
  name: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  status: "active" | "inactive" | "draft";

  color?: string;
  size?: string;
  material?: string;

  warranty?: string;
  modelNumber?: string;
  sku?: string;

  // Flags (mapped to sections)
  isFlashSale: boolean;
  isDealOfWeek: boolean;
  isNewArrival: boolean;
}

// ==========================
// Initial State
// ==========================
const initialFormState: ProductFormData = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: 0,
  oldPrice: undefined,
  stock: undefined,
  status: "active",

  color: "",
  size: "",
  material: "",

  warranty: "",
  modelNumber: "",
  sku: "",

  isFlashSale: false,
  isDealOfWeek: false,
  isNewArrival: false,
};

const AddProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.categories.categories);

  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ==========================
  // Handlers
  // ==========================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build sections array
    const sections: string[] = [];
    if (formData.isFlashSale) sections.push("FlashSales");
    if (formData.isDealOfWeek) sections.push("BestDeals");
    if (formData.isNewArrival) sections.push("NewArrivals");

    // Prepare FormData for backend
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== "" &&
        typeof value !== "boolean" // skip flags, we mapped them
      ) {
        data.append(key, String(value));
      }
    });

    // Append sections (array)
    sections.forEach((section) => data.append("sections", section));

    // Append images
    images.forEach((img) => data.append("images", img));

    try {
      await dispatch(createProduct(data)).unwrap();
      toast.success("✅ Product added successfully!");
      setFormData(initialFormState);
      setImages([]);
    } catch {
      toast.error("❌ Failed to add product.");
    }
  };

  // ==========================
  // Render
  // ==========================
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Add New Product
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
              <textarea
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={formData.brand || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
              <input
                type="number"
                name="oldPrice"
                placeholder="Old Price"
                value={formData.oldPrice || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock Quantity"
                value={formData.stock || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Variations & Extra Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="color"
              placeholder="Color"
              value={formData.color || ""}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
            />
            <input
              type="text"
              name="size"
              placeholder="Size"
              value={formData.size || ""}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
            />
            <input
              type="text"
              name="material"
              placeholder="Material"
              value={formData.material || ""}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Homepage Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isFlashSale"
                checked={formData.isFlashSale}
                onChange={handleCheckboxChange}
                className="form-checkbox"
              />
              <span>Flash Sale</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isDealOfWeek"
                checked={formData.isDealOfWeek}
                onChange={handleCheckboxChange}
                className="form-checkbox"
              />
              <span>Deal of the Week</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleCheckboxChange}
                className="form-checkbox"
              />
              <span>New Arrival</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="image-upload"
              className="flex items-center space-x-2 cursor-pointer border-2 border-dashed px-4 py-2 rounded hover:border-green-500"
            >
              <FaRegFileImage /> <span>Upload Images</span>
            </label>
            <input
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="mt-2 text-sm text-gray-500">
              {images.length > 0 ? `${images.length} file(s) selected` : "No files selected."}
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
          >
            <FaPlusCircle className="mr-2" /> Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;
