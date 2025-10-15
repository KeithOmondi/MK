import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchSuppliers,
  updateSupplier,
  selectSuppliers,
  selectSupplierLoading,
  selectSupplierError,
  selectSupplierSuccess,
} from "../../redux/slices/supplierSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserClock,
  FaEye,
} from "react-icons/fa";
import Button from "../../components/ui/Button";

const AdminSellerApplications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const suppliers = useSelector(selectSuppliers);
  const loading = useSelector(selectSupplierLoading);
  const error = useSelector(selectSupplierError);
  const success = useSelector(selectSupplierSuccess);

  // Local state
  const [previewSupplier, setPreviewSupplier] = useState<any>(null);

  // Fetch suppliers on mount
  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Toast feedback
  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
  }, [success, error]);

  // Approve or reject a supplier
  const handleAction = (id: string, status: "Approved" | "Rejected") => {
    const formData = new FormData();
    formData.append("status", status);
    dispatch(updateSupplier({ id, formData }));
  };

  // Show all with status "Pending"
  const pendingSuppliers = suppliers.filter((s) => s.status === "Pending");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaUserClock className="text-indigo-600" /> Pending Seller Applications
      </h2>

      {/* Loading or Empty State */}
      {loading ? (
        <p className="text-gray-600 animate-pulse">Loading applications...</p>
      ) : pendingSuppliers.length === 0 ? (
        <p className="text-gray-500 mt-4">No pending applications found.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-xl bg-white border">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-indigo-50">
              <tr>
                <th className="p-3 font-medium text-gray-600">Supplier</th>
                <th className="p-3 font-medium text-gray-600">Email</th>
                <th className="p-3 font-medium text-gray-600">Shop Name</th>
                <th className="p-3 font-medium text-gray-600">Status</th>
                <th className="p-3 font-medium text-gray-600 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingSuppliers.map((supplier) => (
                <motion.tr
                  key={supplier._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={supplier.idDocument?.url || "/default-avatar.png"}
                      alt={supplier.fullName || "Supplier"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />
                    <span>{supplier.fullName}</span>
                  </td>
                  <td className="p-3">{supplier.user?.email || "—"}</td>
                  <td className="p-3">{supplier.shopName || "—"}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewSupplier(supplier)}
                      className="flex items-center gap-1"
                    >
                      <FaEye /> View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(supplier._id, "Approved")}
                      disabled={loading}
                      className="flex items-center gap-1"
                    >
                      <FaCheckCircle /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction(supplier._id, "Rejected")}
                      disabled={loading}
                      className="flex items-center gap-1"
                    >
                      <FaTimesCircle /> Reject
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Details Modal */}
      <Transition show={!!previewSupplier} as={Fragment}>
        <Dialog
          onClose={() => setPreviewSupplier(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  Supplier Details
                </Dialog.Title>
                <Button variant="ghost" onClick={() => setPreviewSupplier(null)}>
                  <FaTimesCircle className="text-gray-500" size={24} />
                </Button>
              </div>

              {previewSupplier && (
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <img
                      src={previewSupplier.idDocument?.url || "/default-avatar.png"}
                      alt="ID Document"
                      className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{previewSupplier.fullName}</h2>
                      <p className="text-sm text-gray-500">{previewSupplier.shopName}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          {previewSupplier.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            previewSupplier.verified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {previewSupplier.verified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Sections */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Account Info
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p><strong>Email:</strong> {previewSupplier.user?.email || "—"}</p>
                        <p><strong>Phone:</strong> {previewSupplier.phoneNumber || "—"}</p>
                        <p><strong>Seller Type:</strong> {previewSupplier.businessType || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Business Details
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p><strong>Shop Name:</strong> {previewSupplier.shopName || "—"}</p>
                        <p><strong>Address:</strong> {previewSupplier.address || "—"}</p>
                        <p><strong>ID Number:</strong> {previewSupplier.idNumber || "—"}</p>
                        {previewSupplier.taxNumber && (
                          <p><strong>Tax Number:</strong> {previewSupplier.taxNumber}</p>
                        )}
                        {previewSupplier.businessLicense?.url && (
                          <p>
                            <strong>Business License:</strong>{" "}
                            <a
                              href={previewSupplier.businessLicense.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleAction(previewSupplier._id, "Approved");
                        setPreviewSupplier(null);
                      }}
                      disabled={loading}
                      className="flex items-center gap-1"
                    >
                      <FaCheckCircle /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        handleAction(previewSupplier._id, "Rejected");
                        setPreviewSupplier(null);
                      }}
                      disabled={loading}
                      className="flex items-center gap-1"
                    >
                      <FaTimesCircle /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminSellerApplications;
