// src/pages/admin/AddProducts.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  fetchProducts,
  deleteProduct,
  createProduct,
} from "../../redux/slices/productSlice";
import {
  fetchCategories,
  selectCategories,
  selectCategoryLoading,
  type Category,
} from "../../redux/slices/categorySlice";
import { MdDelete, MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaDollarSign,
  FaTag,
  FaCubes,
  FaEye,
  FaTrademark,
} from "react-icons/fa";
import { RiListCheck2, RiAddBoxFill } from "react-icons/ri";

// ==========================
// Types
// ==========================
interface ProductFormData {
  name: string;
  description: string;
  category: string; // ✅ backend expects "category"
  brand: string; // ✅ NEW FIELD
  price: number;
  stock: number;
  status: "active" | "inactive" | "draft";
  isFlashSale: boolean;
  flashSaleEndDate: string;
  isDealOfWeek: boolean;
  dealEndDate: string;
  isNewArrival: boolean;
  newArrivalExpiry: string;
  weight: number;
  dimensions: string;
  shippingMethods: string;
  deliveryTime: string;
  warehouseLocation: string;
}

const initialFormState: ProductFormData = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: 0,
  stock: 0,
  status: "active",
  isFlashSale: false,
  flashSaleEndDate: "",
  isDealOfWeek: false,
  dealEndDate: "",
  isNewArrival: false,
  newArrivalExpiry: "",
  weight: 0,
  dimensions: "",
  shippingMethods: "",
  deliveryTime: "",
  warehouseLocation: "",
};

const AddProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const categories = useSelector(selectCategories);
  const categoryLoading = useSelector(selectCategoryLoading);

  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [images, setImages] = useState<FileList | null>(null);

  // ==========================
  // Fetch products & categories
  // ==========================
  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
  }, [dispatch]);

  // ==========================
  // Handlers
  // ==========================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(e.target.files);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImages(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("❌ Please select a category");
      return;
    }

    if (!formData.brand) {
      toast.error("❌ Please enter a brand");
      return;
    }

    try {
      const fd = new FormData();

      // ✅ Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, String(value));
      });

      // ✅ Append images
      if (images) {
        Array.from(images).forEach((file) => fd.append("images", file));
      }

      await dispatch(createProduct(fd)).unwrap();
      toast.success("✅ Product created successfully");

      resetForm();
      dispatch(fetchProducts({}));
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("🗑️ Product deleted successfully");
    } catch {
      toast.error("❌ Failed to delete product");
    }
  };

  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  // ==========================
  // Helpers
  // ==========================
  const getCategoryHierarchy = (catId: string): string => {
    const category = categories.find((c) => c._id === catId);
    if (!category) return "Uncategorized";

    const buildHierarchy = (c: Category): string => {
      if (c.parentCategory && typeof c.parentCategory !== "string") {
        return buildHierarchy(c.parentCategory as Category) + " > " + c.name;
      }
      return c.name;
    };

    return buildHierarchy(category);
  };

  const renderCategoryOptions = (
    cats: Category[] | undefined,
    level = 0,
    parentId: string | null = null
  ): React.ReactElement[] => {
    if (!cats || cats.length === 0) return [];

    return cats
      .filter((c) =>
        parentId === null
          ? !c.parentCategory
          : typeof c.parentCategory === "string"
          ? c.parentCategory === parentId
          : c.parentCategory?._id === parentId
      )
      .flatMap((cat) => [
        <option key={cat._id} value={cat._id}>
          {"\u00A0".repeat(level * 4)}
          {cat.name}
        </option>,
        ...renderCategoryOptions(cats, level + 1, cat._id),
      ]);
  };

  // ==========================
  // Render
  // ==========================
  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
        <RiListCheck2 className="mr-3 text-blue-600" /> Manage Products
      </h1>

      {/* Add Product Form */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center">
          <RiAddBoxFill className="mr-2 text-green-600" /> Add New Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="relative">
              <FaTrademark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="relative">
              <FaCubes className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <FaEye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <FaTag className="absolute left-3 top-3 text-gray-400" />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg min-h-[100px]"
              required
            />
          </div>
          <div className="relative">
            <RiListCheck2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">-- Select Category --</option>
              {categoryLoading ? (
                <option disabled>Loading categories...</option>
              ) : categories && categories.length > 0 ? (
                renderCategoryOptions(categories)
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          {/* Image Upload */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-gray-500 mb-2">
              Drag and drop images here, or click to select files.
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Logistics + Promotions kept same as before */}
          {/* ... */}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 overflow-x-auto border border-gray-200">
        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-600 py-10">❌ {error}</p>
        ) : (
          <table className="min-w-full table-auto border-separate border-spacing-y-4">
            <thead>
              <tr className="text-gray-500 uppercase text-sm leading-normal">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="bg-white shadow-md rounded-lg mb-4 hover:shadow-lg"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.name || "Product"}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.brand ?? "N/A"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {getCategoryHierarchy(
                        typeof product.category === "string"
                          ? product.category
                          : product.category?._id ?? ""
                      )}
                    </td>
                    <td className="px-4 py-3">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{product.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      {product.status === "active" ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {typeof product.warehouseLocation === "string"
                        ? product.warehouseLocation
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddProducts;
