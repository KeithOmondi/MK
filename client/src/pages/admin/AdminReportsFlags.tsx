// src/pages/admin/AdminReports.tsx
import React, { useEffect, Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import {
  fetchReports,
  updateReportStatus,
  selectReports,
  selectReportsLoading,
  selectReportsError,
  selectReportsSuccess,
} from "../../redux/slices/reportSlice";
import { toast } from "react-toastify";
import { FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";

const AdminReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reports = useSelector(selectReports);
  const loading = useSelector(selectReportsLoading);
  const error = useSelector(selectReportsError);
  const success = useSelector(selectReportsSuccess);

  const [previewReport, setPreviewReport] = useState<typeof reports[0] | null>(null);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  useEffect(() => {
    if (success) toast.success("Report updated successfully");
    if (error) toast.error(error);
  }, [success, error]);

  const handleAction = (id: string, status: "Resolved" | "Ignored") => {
    dispatch(updateReportStatus({ id, status }));
    setPreviewReport(null);
  };

  const pendingReports = reports.filter(r => r.status === "Pending");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaEye className="text-indigo-600" /> Reports & Flags
      </h2>

      {loading ? (
        <p className="text-gray-600 animate-pulse">Loading reports...</p>
      ) : pendingReports.length === 0 ? (
        <p className="text-gray-500 mt-4">No pending reports.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-xl bg-white border">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-indigo-50">
              <tr>
                <th className="p-3 font-medium text-gray-600">Reporter</th>
                <th className="p-3 font-medium text-gray-600">Reported Entity</th>
                <th className="p-3 font-medium text-gray-600">Type</th>
                <th className="p-3 font-medium text-gray-600">Reason</th>
                <th className="p-3 font-medium text-gray-600">Status</th>
                <th className="p-3 font-medium text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map(report => (
                <motion.tr
                  key={report._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">{report.reporter.name}</td>
                  <td className="p-3">{report.reportedEntity.name || report.reportedEntity.title || "—"}</td>
                  <td className="p-3">{report.type}</td>
                  <td className="p-3">{report.reason}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewReport(report)}
                    >
                      <FaEye /> View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(report._id, "Resolved")}
                    >
                      <FaCheckCircle /> Resolve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction(report._id, "Ignored")}
                    >
                      <FaTimesCircle /> Ignore
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Preview Modal */}
      <Transition show={!!previewReport} as={Fragment}>
        <Dialog
          onClose={() => setPreviewReport(null)}
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
                  Report Details
                </Dialog.Title>
                <Button variant="ghost" onClick={() => setPreviewReport(null)}>
                  <FaTimesCircle className="text-gray-500" size={24} />
                </Button>
              </div>

              {previewReport && (
                <div className="p-6 overflow-y-auto space-y-4">
                  <p><strong>Reporter:</strong> {previewReport.reporter.name} ({previewReport.reporter.email})</p>
                  <p><strong>Reported Entity:</strong> {previewReport.reportedEntity.name || previewReport.reportedEntity.title}</p>
                  <p><strong>Type:</strong> {previewReport.type}</p>
                  <p><strong>Reason:</strong> {previewReport.reason}</p>
                  <p><strong>Status:</strong> {previewReport.status}</p>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleAction(previewReport._id, "Resolved")}
                    >
                      <FaCheckCircle /> Resolve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleAction(previewReport._id, "Ignored")}
                    >
                      <FaTimesCircle /> Ignore
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

export default AdminReports;
