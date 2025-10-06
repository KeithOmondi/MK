// src/pages/admin/AdminProducts.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  fetchAdminProducts,
  updateProduct,
  deleteProduct,
  type Product,
} from "../../redux/slices/productSlice";
import {
  fetchCategories,
  selectCategories,
  selectCategoryLoading,
  type Category,
} from "../../redux/slices/categorySlice";
import {
  MdDelete,
  MdEdit,
  MdCheckCircle,
  MdClose,
  MdInfo,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/* ==============================
   🔘 Reusable IconButton
============================== */
const IconButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  className?: string;
}> = ({ onClick, icon, title, className = "" }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-full transition hover:shadow-md ${className}`}
  >
    {icon}
  </button>
);

/* ==============================
   🏷️ Status Badge Helper
============================== */
const getStatusBadge = (
  status: "active" | "inactive" | "draft" | "pending"
) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700 ring-1 ring-green-300",
    pending: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
    inactive: "bg-red-100 text-red-700 ring-1 ring-red-300",
    draft: "bg-gray-100 text-gray-700 ring-1 ring-gray-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

/* ==============================
   🧠 AdminProducts Page
============================== */
const AdminProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products = [], loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const categories = useSelector(selectCategories) ?? [];
  const categoryLoading = useSelector(selectCategoryLoading);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search input state

  /* 🔄 Fetch products and categories */
  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  /* 🔍 Filtered products by SKU or name */
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.sku?.toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query)
    );
  });

  /* 🗑️ Delete Product */
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("⚠️ Are you sure you want to delete this product?"))
      return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("✅ Product deleted successfully!");
    } catch {
      toast.error("❌ Failed to delete product.");
    }
  };

  /* ✏️ Edit Product */
  const handleEdit = (id?: string) => {
    if (!id) return;
    navigate(`/admin/products/edit/${id}`);
  };

  /* ✅ Approve Product */
  const handleApprove = async (id?: string) => {
    if (!id) return;
    try {
      await dispatch(updateProduct({ id, payload: { status: "active" } })).unwrap();
      toast.success("✅ Product approved!");
    } catch (err: any) {
      toast.error(err?.message || "❌ Failed to approve product.");
    }
  };

  /* 🗂️ Category Hierarchy Builder */
  const getCategoryHierarchy = (catId: string): string => {
    const category = categories.find((c) => c._id === catId);
    if (!category) return "Uncategorized";

    const buildHierarchy = (c: Category): string => {
      if (c.parentCategory && typeof c.parentCategory !== "string") {
        return buildHierarchy(c.parentCategory as Category) + " / " + c.name;
      }
      return c.name;
    };

    return buildHierarchy(category);
  };

  /* ==============================
     🖼️ Render UI
  ============================== */
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          🛒 Product Inventory
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 🔍 Search Bar */}
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => navigate("/admin/products/new")}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-600">Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Product Table */}
      {!loading && !error && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {[
                    "Image",
                    "Name",
                    "SKU",
                    "Category",
                    "Price",
                    "Stock",
                    "Status",
                    "Added",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-sm font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-gray-500 italic"
                    >
                      No products match your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id ?? ""} className="hover:bg-indigo-50/40">
                      <td className="px-5 py-4">
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "https://via.placeholder.com/60"
                          }
                          alt={product.name || "Product"}
                          className="w-14 h-14 object-cover rounded-lg border"
                        />
                      </td>

                      <td
                        className="px-5 py-4 font-medium text-indigo-700 cursor-pointer hover:underline"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name ?? "Unnamed Product"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 font-mono">
                        {product.sku || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-indigo-700">
                        {categoryLoading
                          ? "Loading..."
                          : getCategoryHierarchy(
                              typeof product.category === "string"
                                ? product.category
                                : product.category?._id ?? ""
                            )}
                      </td>

                      <td className="px-5 py-4 font-bold text-green-700">
                        Ksh {Number(product.price ?? 0).toLocaleString()}
                      </td>

                      <td
                        className={`px-5 py-4 font-semibold ${
                          (product.stock ?? 0) < 10
                            ? "text-red-500"
                            : "text-gray-900"
                        }`}
                      >
                        {product.stock ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(
                          (product.status as
                            | "active"
                            | "inactive"
                            | "draft"
                            | "pending") || "inactive"
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4 flex gap-2 justify-center items-center">
                        {["pending", "inactive"].includes(
                          product.status ?? ""
                        ) && (
                          <IconButton
                            onClick={() => handleApprove(product._id)}
                            icon={<MdCheckCircle size={20} />}
                            title="Approve Product"
                            className="text-green-600 bg-green-50 hover:bg-green-100"
                          />
                        )}
                        <IconButton
                          onClick={() => handleEdit(product._id)}
                          icon={<MdEdit size={20} />}
                          title="Edit Product"
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        />
                        <IconButton
                          onClick={() => handleDelete(product._id)}
                          icon={<MdDelete size={20} />}
                          title="Delete Product"
                          className="text-red-600 bg-red-50 hover:bg-red-100"
                        />
                        <IconButton
                          onClick={() => setSelectedProduct(product)}
                          icon={<MdInfo size={20} />}
                          title="View Details"
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🧩 Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
            >
              <MdClose size={22} />
            </button>

            <div className="flex gap-5">
              <img
                src={
                  selectedProduct.images?.[0]?.url ||
                  "https://via.placeholder.com/150"
                }
                alt={selectedProduct.name}
                className="w-40 h-40 object-cover rounded-lg border"
              />

              <div className="flex flex-col gap-2 flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedProduct.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  SKU: {selectedProduct.sku || "N/A"}
                </p>
                <p className="text-lg font-semibold text-green-700">
                  Ksh {selectedProduct.price?.toLocaleString()}
                </p>
                <p>
                  Stock:{" "}
                  <span className="font-medium">{selectedProduct.stock}</span>
                </p>
                <p>Status: {getStatusBadge(selectedProduct.status as any)}</p>

                {/* ✅ Safe supplier handling */}
                <p className="font-extrabold">
                  Shop:{" "}
                  {typeof selectedProduct.supplier === "object" &&
                  "shopName" in selectedProduct.supplier
                    ? selectedProduct.supplier.shopName
                    : "N/A"}
                </p>

                <p>
                  Added:{" "}
                  {new Date(selectedProduct.createdAt || "").toLocaleString()}
                </p>
              </div>
            </div>

            {selectedProduct.description && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Description
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedProduct.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
