import Dispute from "../models/Dispute.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import mongoose from "mongoose";

/* ------------------------- CREATE DISPUTE ------------------------- */
export const createDispute = catchAsyncErrors(async (req, res, next) => {
  const { orderId, seller, product, type, reason, evidence } = req.body;

  // Only users can create disputes
  if (req.user.role !== "User") {
    return next(new ErrorHandler("Only users can create disputes.", 403));
  }

  if (!orderId || !seller || !type || !reason) {
    return next(new ErrorHandler("orderId, seller, type, and reason are required.", 400));
  }

  if (!["Product Issue", "Late Delivery", "Wrong Item", "Refund", "Other"].includes(type)) {
    return next(new ErrorHandler("Invalid dispute type.", 400));
  }

  const dispute = await Dispute.create({
    orderId,
    user: req.user._id,
    seller,
    product,
    type,
    reason,
    evidence,
    status: "Pending",
  });

  res.status(201).json({
    status: "success",
    message: "Dispute created successfully.",
    data: dispute,
  });
});

/* ------------------------- GET USER DISPUTES ------------------------- */
export const getUserDisputes = catchAsyncErrors(async (req, res, next) => {
  const disputes = await Dispute.find({ user: req.user._id })
    .populate("orderId", "orderNumber totalAmount status")
    .populate("seller", "name email")
    .populate("product", "name");

  res.status(200).json({
    status: "success",
    count: disputes.length,
    data: disputes,
  });
});

/* ------------------------- GET ALL DISPUTES (ADMIN) ------------------------- */
export const getAllDisputes = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Only admins can access all disputes.", 403));
  }

  const disputes = await Dispute.find()
    .populate("user", "name email")
    .populate("seller", "name email")
    .populate("orderId", "orderNumber totalAmount status")
    .populate("product", "name");

  res.status(200).json({
    status: "success",
    count: disputes.length,
    data: disputes,
  });
});

/* ------------------------- UPDATE DISPUTE STATUS (ADMIN) ------------------------- */
export const updateDisputeStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Only admins can update disputes.", 403));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid dispute ID.", 400));
  }

  if (!["Pending", "In Review", "Resolved", "Escalated", "Closed"].includes(status)) {
    return next(new ErrorHandler("Invalid dispute status.", 400));
  }

  const dispute = await Dispute.findByIdAndUpdate(
    id,
    { status, resolutionNotes, resolvedBy: req.user._id },
    { new: true }
  );

  if (!dispute) {
    return next(new ErrorHandler("Dispute not found.", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Dispute status updated successfully.",
    data: dispute,
  });
});

/* ------------------------- DELETE DISPUTE (ADMIN) ------------------------- */
export const deleteDispute = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Only admins can delete disputes.", 403));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid dispute ID.", 400));
  }

  const dispute = await Dispute.findByIdAndDelete(id);
  if (!dispute) {
    return next(new ErrorHandler("Dispute not found.", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Dispute deleted successfully.",
  });
});
