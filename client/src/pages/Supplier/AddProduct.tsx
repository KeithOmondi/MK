// src/pages/admin/AdminProducts.tsx
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

// ==========================
// Product form data type
// ==========================
interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "draft";
  isFlashSale: boolean;
  flashSaleEndDate: string;
  isDealOfWeek: boolean;
  dealEndDate: string;
  isNewArrival: boolean;
  newArrivalExpiry: string;
  // Logistics
  weight: number;
  dimensions: string;
  shippingMethods: string;
  deliveryTime: string;
  warehouseLocation: string;
}

const AddProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const categories = useSelector(selectCategories);
  const categoryLoading = useSelector(selectCategoryLoading);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
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
  });

  const [images, setImages] = useState<FileList | null>(null);

  // ==========================
  // Fetch products and categories
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        fd.append(key, String(value))
      );
      if (images)
        Array.from(images).forEach((file) => fd.append("images", file));

      await dispatch(createProduct(fd)).unwrap();
      toast.success("Product created successfully");

      setFormData({
        name: "",
        description: "",
        category: "",
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
      });
      setImages(null);
      dispatch(fetchProducts({}));
    } catch {
      toast.error("Failed to create product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
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
    cats: Category[],
    level = 0,
    parentId: string | null = null
  ): React.ReactElement[] => {
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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Manage Products</h1>

      {/* Add Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold">Add New Product</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleInputChange}
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="border rounded p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full border rounded p-2"
          required
        />

        {/* Category Dropdown */}
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
          required
        >
          <option value="">-- Select Category --</option>
          {categoryLoading ? (
            <option disabled>Loading categories...</option>
          ) : (
            renderCategoryOptions(categories)
          )}
        </select>

        {/* File Upload */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="border rounded p-2 w-full"
        />

        {/* Logistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
          <h3 className="col-span-2 font-semibold text-lg">Logistics Info</h3>
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="dimensions"
            placeholder="Dimensions (L x W x H)"
            value={formData.dimensions}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="shippingMethods"
            placeholder="Shipping Methods (e.g. Standard, Express)"
            value={formData.shippingMethods}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="deliveryTime"
            placeholder="Delivery Time (e.g. 3-5 business days)"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
          <input
            type="text"
            name="warehouseLocation"
            placeholder="Warehouse Location"
            value={formData.warehouseLocation}
            onChange={handleInputChange}
            className="border rounded p-2"
          />
        </div>

        {/* Promotions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isFlashSale"
              checked={formData.isFlashSale}
              onChange={handleCheckboxChange}
            />
            <span>Flash Sale</span>
          </label>
          {formData.isFlashSale && (
            <input
              type="date"
              name="flashSaleEndDate"
              value={formData.flashSaleEndDate}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isDealOfWeek"
              checked={formData.isDealOfWeek}
              onChange={handleCheckboxChange}
            />
            <span>Deal of the Week</span>
          </label>
          {formData.isDealOfWeek && (
            <input
              type="date"
              name="dealEndDate"
              value={formData.dealEndDate}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isNewArrival"
              checked={formData.isNewArrival}
              onChange={handleCheckboxChange}
            />
            <span>New Arrival</span>
          </label>
          {formData.isNewArrival && (
            <input
              type="date"
              name="newArrivalExpiry"
              value={formData.newArrivalExpiry}
              onChange={handleInputChange}
              className="border rounded p-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </form>

      {/* Product List */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        {loading ? (
          <p className="text-center py-6">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-600 py-6">{error}</p>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3 border">Image</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Category</th>
                <th className="px-4 py-3 border">Price</th>
                <th className="px-4 py-3 border">Stock</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Warehouse</th>
                <th className="px-4 py-3 border">Date</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border">
                      <img
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.name || "Product"}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-3 border">{product.name}</td>
                    <td className="px-4 py-3 border">
                      {getCategoryHierarchy(
                        typeof product.category === "string"
                          ? product.category
                          : product.category?._id ?? ""
                      )}
                    </td>

                    <td className="px-4 py-3 border">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 border">{product.stock ?? 0}</td>
                    <td className="px-4 py-3 border">
                      {product.status === "active" ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 border">
                      {product.warehouseLocation
                        ? `${product.warehouseLocation.address}, ${product.warehouseLocation.city}, ${product.warehouseLocation.country}, ${product.warehouseLocation.postalCode}`
                        : "N/A"}
                    </td>

                    <td className="px-4 py-3 border">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 border space-x-2">
                      <button
                        onClick={() => handleEdit(product._id)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
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
