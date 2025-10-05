import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchProducts,
  deleteProduct,
  updateProduct,
  selectProducts,
  selectProductLoading,
  selectProductError,
} from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import { FaTrash, FaCheckCircle, FaBan } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";

const ManageProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts) ?? [];
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);

  // Fetch all products (admin view)
  useEffect(() => {
    dispatch(fetchProducts({ admin: true }));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("🗑️ Product deleted successfully!");
      dispatch(fetchProducts({ admin: true }));
    } catch {
      toast.error("❌ Failed to delete product.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await dispatch(updateProduct({ id, payload: { status: newStatus } })).unwrap();
      toast.success(
        newStatus === "active"
          ? "✅ Product approved!"
          : "🚫 Product deactivated!"
      );
      dispatch(fetchProducts({ admin: true }));
    } catch {
      toast.error("❌ Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="text-lg font-semibold text-red-600 mb-2">
          Failed to load products
        </p>
        <p className="text-sm text-gray-500">{String(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Manage Products
      </h1>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Images",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((p) => {
                  const price = typeof p.price === "number" ? p.price : 0;
                  const statusColor =
                    p.status === "active"
                      ? "bg-green-100 text-green-700"
                      : p.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600";

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.name || "Unnamed Product"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof p.category === "string"
                          ? p.category
                          : p.category?.name ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Ksh {price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.stock ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                        >
                          {p.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(p.images) && p.images.length > 0 ? (
                            p.images.map((img, i) => (
                              <img
                                key={i}
                                src={typeof img === "string" ? img : img.url}
                                alt={p.name || "Product Image"}
                                className="w-12 h-12 object-cover rounded-lg border"
                              />
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No Images
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {p.status !== "active" && (
                          <button
                            onClick={() => handleStatusChange(p._id, "active")}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition"
                          >
                            <FaCheckCircle className="mr-1" /> Approve
                          </button>
                        )}
                        {p.status === "active" && (
                          <button
                            onClick={() => handleStatusChange(p._id, "inactive")}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition"
                          >
                            <FaBan className="mr-1" /> Deactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-sm text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
