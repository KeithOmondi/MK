// src/pages/admin/ManageProducts.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchProducts, deleteProduct } from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const ManageProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.products.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("🗑️ Product deleted successfully!");
      dispatch(fetchProducts());
    } catch (err) {
      toast.error("❌ Failed to delete product.");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Manage Products
      </h1>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof p.category === "string" ? p.category : p.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Ksh {p.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.stock ?? "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {p.isFlashSale && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                          Flash Sale
                        </span>
                      )}
                      {p.isDealOfWeek && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full">
                          Deal
                        </span>
                      )}
                      {p.isNewArrival && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {p.images && p.images.length > 0 ? (
                        p.images.map((img: any, i: number) => (
                          <img
                            key={i}
                            src={typeof img === "string" ? img : img.url}
                            alt={img.alt || p.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">No Images</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-400"
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
