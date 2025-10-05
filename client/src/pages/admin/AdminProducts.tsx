// src/pages/admin/AdminProducts.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  deleteProduct,
  fetchAdminProducts,
  updateProduct,
  type Product,
} from "../../redux/slices/productSlice";
import {
  fetchCategories,
  selectCategories,
  selectCategoryLoading,
  type Category,
} from "../../redux/slices/categorySlice";
import { MdDelete, MdEdit, MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/* ==============================
   Reusable UI Components
============================== */

// IconButton Component
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

// Status Badge
const getStatusBadge = (status: "active" | "inactive" | "draft" | "pending") => {
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
   Main Component
============================== */

const AdminProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products = [], loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const categories = useSelector(selectCategories) ?? [];
  const categoryLoading = useSelector(selectCategoryLoading);

  // Fetch all products & categories on mount
  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  /* ==============================
     Handlers
  ============================== */

  const handleDelete = async (id: string) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this product?")) return;

    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("✅ Product deleted successfully!");
    } catch {
      toast.error("❌ Failed to delete product.");
    }
  };

  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  const handleApprove = async (id: string) => {
    try {
      await dispatch(updateProduct({ id, payload: { status: "active" } })).unwrap();
      toast.success("✅ Product approved!");
    } catch (err: any) {
      toast.error(err || "❌ Failed to approve product.");
    }
  };

  // Category hierarchy display
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
     Render
  ============================== */

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          🛒 Product Inventory
        </h1>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center gap-1"
        >
          + Add Product
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-600">Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Image</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Stock</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-5 py-3 text-left text-sm font-semibold">Added</th>
                  <th className="px-5 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500 italic">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product: Product) => (
                    <tr key={product._id} className="hover:bg-indigo-50/40">
                      <td className="px-5 py-4">
                        <img
                          src={product.images?.[0]?.url || "https://via.placeholder.com/60"}
                          alt={product.name || "Product"}
                          className="w-14 h-14 object-cover rounded-lg border"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/60")
                          }
                        />
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900 truncate">
                        {product.name ?? "Unnamed Product"}
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
                          (product.status as "active" | "inactive" | "draft" | "pending") ||
                            "inactive"
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4 flex gap-2 justify-center items-center">
                        {/* Approve Button (only show if pending or inactive) */}
                        {["pending", "inactive"].includes(product.status) && (
                          <IconButton
                            onClick={() => handleApprove(product._id)}
                            icon={<MdCheckCircle size={20} />}
                            title="Approve Product"
                            className="text-green-600 bg-green-50 hover:bg-green-100"
                          />
                        )}

                        {/* Edit Button */}
                        <IconButton
                          onClick={() => handleEdit(product._id)}
                          icon={<MdEdit size={20} />}
                          title="Edit Product"
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        />

                        {/* Delete Button */}
                        <IconButton
                          onClick={() => handleDelete(product._id)}
                          icon={<MdDelete size={20} />}
                          title="Delete Product"
                          className="text-red-600 bg-red-50 hover:bg-red-100"
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
    </div>
  );
};

export default AdminProducts;
