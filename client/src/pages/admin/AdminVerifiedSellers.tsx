import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchSuppliers,
  selectSuppliers,
  selectSupplierLoading,
  selectSupplierError,
} from "../../redux/slices/supplierSlice";
import { toast } from "react-toastify";
import { FaTimesCircle, FaUserCheck, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import Button from "../../components/ui/Button";

const AdminVerifiedSellers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const suppliers = useSelector(selectSuppliers);
  const loading = useSelector(selectSupplierLoading);
  const error = useSelector(selectSupplierError);

  const [previewSupplier, setPreviewSupplier] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const verifiedSuppliers = suppliers.filter(
    (s) => s.status === "Approved" && s.verified
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaUserCheck className="text-green-600" /> Verified Sellers
      </h2>

      {loading ? (
        <p className="text-gray-600 animate-pulse">
          Loading verified sellers...
        </p>
      ) : verifiedSuppliers.length === 0 ? (
        <p className="text-gray-500 mt-4">No verified sellers found.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-xl bg-white border">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-green-50">
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
              {verifiedSuppliers.map((supplier) => (
                <motion.tr
                  key={supplier._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={supplier.user?.avatar?.url || "/default-avatar.png"}
                      alt={supplier.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                    />

                    <span>{supplier.fullName}</span>
                  </td>
                  <td className="p-3">{supplier.user?.email || "—"}</td>
                  <td className="p-3">{supplier.shopName}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Verified
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Preview Modal */}
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
                  Seller Details
                </Dialog.Title>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewSupplier(null)}
                >
                  <FaTimesCircle className="text-gray-500" size={24} />
                </Button>
              </div>

              {previewSupplier && (
                <div className="p-6 overflow-y-auto space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="flex-shrink-0">
                      {previewSupplier.idDocument?.url ? (
                        <img
                          src={previewSupplier.idDocument.url}
                          alt="ID Document"
                          className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center">
                          No ID Doc
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {previewSupplier.fullName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {previewSupplier.shopName}
                      </p>
                      <div className="mt-2 flex gap-2 items-center">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account & Business Info */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Account Info
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p>
                          <strong>Email:</strong> {previewSupplier.user?.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {previewSupplier.phoneNumber}
                        </p>
                        <p>
                          <strong>Seller Type:</strong>{" "}
                          {previewSupplier.businessType}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Business Details
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p>
                          <strong>Shop Name:</strong> {previewSupplier.shopName}
                        </p>
                        <p>
                          <strong>Address:</strong> {previewSupplier.address}
                        </p>
                        <p>
                          <strong>ID Number:</strong> {previewSupplier.idNumber}
                        </p>
                        {previewSupplier.taxNumber && (
                          <p>
                            <strong>Tax Number:</strong>{" "}
                            {previewSupplier.taxNumber}
                          </p>
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
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminVerifiedSellers;
