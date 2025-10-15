import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchSupplierProducts,
  selectAllProducts,
  selectProductLoading,
  selectProductError,
  type Product,
} from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";

const ManageProducts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
  if (!user) return;
  if (user.role !== "Supplier") return;

  dispatch(fetchSupplierProducts())
    .unwrap()
    .then((res) => {
      console.log("✅ Supplier products fetched:", res);
      toast.info(`Fetched ${res.length} product(s)`);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch supplier products:", err);
      toast.error(`Failed to fetch products: ${err}`);
    });
}, [dispatch, user]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <p className="text-lg font-semibold text-red-600 mb-2">Failed to load products</p>
        <p className="text-sm text-gray-500 break-words">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        No products found.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        My Products
      </h1>

      <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["Product", "Category", "Price", "Stock", "Status", "Images"].map((col) => (
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
            {products.map((p: Product) => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {p.name ?? "Unnamed Product"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.category
                    ? typeof p.category === "string"
                      ? p.category
                      : p.category?.name ?? p.category._id
                    : "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ksh {p.price?.toLocaleString() ?? "0"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.stock ?? "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.status ?? "pending"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Array.isArray(p.images) && p.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {p.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={p.name ?? "Product Image"}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No Images</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
