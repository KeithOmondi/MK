// src/pages/admin/AdminSuppliers.tsx
import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Check, X, Eye, Search } from "lucide-react";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import {
  fetchSuppliers,
  updateSupplier,
  deleteSupplier,
  selectSuppliers,
  selectSupplierLoading,
  selectSupplierError,
  selectSupplierSuccess,
} from "../../redux/slices/supplierSlice";
import type { AppDispatch } from "../../redux/store";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "../../components/ui/input";

const AdminSuppliers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const suppliers = useSelector(selectSuppliers);
  const loading = useSelector(selectSupplierLoading);
  const error = useSelector(selectSupplierError);
  const success = useSelector(selectSupplierSuccess);

  const [previewSupplier, setPreviewSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
  }, [success, error]);

  const handleStatusChange = (id: string, status: "Approved" | "Rejected") => {
    const formData = new FormData();
    formData.append("status", status);
    dispatch(updateSupplier({ id, formData }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      dispatch(deleteSupplier(id));
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    Object.values(supplier).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add Supplier
          </Button>
        </div>
      </div>

      {/* Supplier Grid */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <p>Loading suppliers...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No suppliers found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                      onClick={() => setPreviewSupplier(supplier)}
                    >
                      {supplier.fullName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        supplier.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {supplier.verified ? "Verified" : "Not Verified"}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        supplier.status === "Approved" ? "bg-green-100 text-green-700" :
                        supplier.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Company:</strong> {supplier.shopName}</p>
                    <p><strong>Email:</strong> {supplier.user?.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {supplier.phoneNumber}</p>
                    <p><strong>Business Type:</strong> {supplier.businessType}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-end items-center gap-2">
                    {supplier.status === "Pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleStatusChange(supplier._id, "Approved")}
                          disabled={loading}
                        >
                          <Check size={16} /> Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleStatusChange(supplier._id, "Rejected")}
                          disabled={loading}
                        >
                          <X size={16} /> Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewSupplier(supplier)}
                    >
                      <Eye size={16} /> View
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(supplier._id)}
                      disabled={loading}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Preview Modal (updated styling) */}
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
                  <X size={24} className="text-gray-500" />
                </Button>
              </div>

              {previewSupplier && (
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Summary & Status */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="flex-shrink-0">
                      {previewSupplier.idDocument?.url ? (
                        <img
                          src={previewSupplier.idDocument.url}
                          alt="ID Document Thumbnail"
                          className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center">
                          No ID Doc
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{previewSupplier.fullName}</h2>
                      <p className="text-sm text-gray-500">{previewSupplier.shopName}</p>
                      <div className="mt-2 flex gap-2 items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          previewSupplier.status === "Approved" ? "bg-green-100 text-green-700" :
                          previewSupplier.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {previewSupplier.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          previewSupplier.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {previewSupplier.verified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Information Sections */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Account Info
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p><strong>Username:</strong> {previewSupplier.username}</p>
                        <p><strong>Email:</strong> {previewSupplier.user?.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {previewSupplier.phoneNumber}</p>
                        <p><strong>Seller Type:</strong> {previewSupplier.sellerType}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3">
                        Business Details
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p><strong>Shop Name:</strong> {previewSupplier.shopName}</p>
                        <p><strong>Business Type:</strong> {previewSupplier.businessType}</p>
                        <p><strong>Address:</strong> {previewSupplier.address}</p>
                        <p><strong>ID Number:</strong> {previewSupplier.idNumber}</p>
                        {previewSupplier.taxNumber && (
                          <p><strong>Tax Number:</strong> {previewSupplier.taxNumber}</p>
                        )}
                        {previewSupplier.businessLicense?.url && (
                          <p>
                            <strong>Business License:</strong> <a href={previewSupplier.businessLicense.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a>
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  <section className="mt-6">
                    <h3 className="font-semibold text-lg text-gray-700 mb-3">
                      Settlement Info
                    </h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Bank:</strong> {previewSupplier.bankName}</p>
                      <p><strong>Account Name:</strong> {previewSupplier.accountName}</p>
                      <p><strong>Account Number:</strong> {previewSupplier.accountNumber}</p>
                      {previewSupplier.branch && (
                        <p><strong>Branch:</strong> {previewSupplier.branch}</p>
                      )}
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

export default AdminSuppliers;