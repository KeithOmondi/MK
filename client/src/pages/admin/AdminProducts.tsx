// src/pages/admin/AdminProducts.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  fetchProducts,
  deleteProduct,
  type Product,
} from "../../redux/slices/productSlice";
import {
  fetchCategories,
  selectCategories,
  selectCategoryLoading,
  type Category,
} from "../../redux/slices/categorySlice";
// Using standard heroicons/lucide for a cleaner look, but MdDelete, MdEdit are fine too!
import { MdDelete, MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper component for styled action buttons
const IconButton = ({ onClick, icon, title, className = "" }: { onClick: () => void, icon: React.ReactNode, title: string, className?: string }) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-2 transition duration-150 ease-in-out rounded-full shadow-sm hover:shadow-md ${className}`}
    >
        {icon}
    </button>
);

// Helper function to render status badges
const getStatusBadge = (status: 'active' | 'inactive') => {
    const isAvailable = status === 'active';
    const colorClasses = isAvailable
        ? "bg-green-100 text-green-700 ring-1 ring-green-300"
        : "bg-red-100 text-red-700 ring-1 ring-red-300";

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${colorClasses}`}
        >
            {status}
        </span>
    );
};


const AdminProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const categories = useSelector(selectCategories);
  const categoryLoading = useSelector(selectCategoryLoading);

  // Fetch products and categories
  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Delete product
  const handleDelete = async (id: string) => {
    // Better UX: Use a confirmation dialog
    if (!window.confirm("⚠️ WARNING: Are you absolutely sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully! 👋");
    } catch {
      toast.error("Failed to delete product. Please try again.");
    }
  };

  // Navigate to edit page
  const handleEdit = (id: string) => navigate(`/admin/products/edit/${id}`);

  // Helpers
  const getCategoryHierarchy = (catId: string): string => {
    const category = categories.find((c) => c._id === catId);
    if (!category) return "Uncategorized";

    const buildHierarchy = (c: Category): string => {
      // Check if parentCategory is an object (populated) before calling recursion
      if (c.parentCategory && typeof c.parentCategory !== "string") {
        return buildHierarchy(c.parentCategory as Category) + " / " + c.name;
      }
      return c.name;
    };

    return buildHierarchy(category);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center">
                📦 Product Inventory Management
            </h1>
            {/* Add product button - crucial UX element */}
            <button
                onClick={() => navigate("/admin/products/new")}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" /></svg>
                Add New Product
            </button>
        </div>
        <p className="text-gray-500 mb-8">Detailed overview of all products in your catalog.</p>

        {/* --- */}

        {/* Loading and Error States */}
        {loading && (
            <div className="flex items-center justify-center p-10 bg-white rounded-xl shadow-md">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="text-indigo-600 font-medium">Fetching product data...</span>
            </div>
        )}
        {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                <p className="font-semibold">Error Loading Products:</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        
        {/* --- */}

        {/* Product List */}
        {!loading && !error && (
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                        <thead className="bg-indigo-600 text-white shadow-lg">
                            <tr>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase"></th> {/* Image */}
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Name</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Category</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Price</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Stock</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Status</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Location</th>
                                <th className="px-5 py-3 text-left font-semibold text-sm tracking-wider uppercase">Date Added</th>
                                <th className="px-5 py-3 text-center font-semibold text-sm tracking-wider uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-lg text-gray-500 italic">
                                        No products found in the catalog.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product: Product) => (
                                    <tr key={product._id} className="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                                        {/* Image */}
                                        <td className="px-5 py-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={product.images?.[0]?.url || "https://via.placeholder.com/60"}
                                                    alt={product.name || "Product"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).onerror = null;
                                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/60";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        {/* Name */}
                                        <td className="px-5 py-4 font-medium text-gray-900 max-w-xs truncate">{product.name}</td>
                                        {/* Category */}
                                        <td className="px-5 py-4 text-sm text-indigo-700">
                                            {categoryLoading
                                                ? "Loading..."
                                                : getCategoryHierarchy(
                                                    typeof product.category === "string"
                                                        ? product.category
                                                        : product.category?._id ?? ""
                                                )}
                                        </td>
                                        {/* Price */}
                                        <td className="px-5 py-4 font-bold text-green-700">Ksh {Number(product.price).toFixed(2)}</td>
                                        {/* Stock */}
                                        <td className={`px-5 py-4 font-semibold ${
                                            (product.stock ?? 0) < 10 ? 'text-red-500' : 'text-gray-900'
                                        }`}>
                                            {product.stock ?? 0}
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            {getStatusBadge(product.status as 'active' | 'inactive')}
                                        </td>
                                        {/* Warehouse Location */}
                                        <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate" title={product.warehouseLocation ? `${product.warehouseLocation.address}, ${product.warehouseLocation.city}` : "N/A"}>
                                            {product.warehouseLocation?.city ?? "N/A"}
                                        </td>
                                        {/* Date */}
                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {product.createdAt
                                                ? new Date(product.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                                                : "N/A"}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 flex gap-2 justify-center items-center">
                                            <IconButton
                                                onClick={() => handleEdit(product._id)}
                                                title="Edit Product"
                                                icon={<MdEdit size={20} />}
                                                className="text-indigo-600 hover:bg-indigo-100 bg-indigo-50"
                                            />
                                            <IconButton
                                                onClick={() => handleDelete(product._id)}
                                                title="Delete Product"
                                                icon={<MdDelete size={20} />}
                                                className="text-red-600 hover:bg-red-100 bg-red-50"
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