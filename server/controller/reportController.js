import mongoose from "mongoose";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Report from "../models/Report.js";

/* ---------------------------- CREATE REPORT ---------------------------- */
export const createReport = catchAsyncErrors(async (req, res, next) => {
  const { reportedEntity, entityType, type, reason } = req.body || {};

  // Validate required fields
  if (!reportedEntity || !entityType || !type || !reason) {
    return next(
      new ErrorHandler("reportedEntity, entityType, type, and reason are required.", 400)
    );
  }

  // Validate entity type
  const validEntityTypes = ["User", "Product"];
  if (!validEntityTypes.includes(entityType)) {
    return next(new ErrorHandler("entityType must be either 'User' or 'Product'.", 400));
  }

  // Validate report type
  const validTypes = ["Spam", "Abuse", "Fraud", "Other"];
  if (!validTypes.includes(type)) {
    return next(
      new ErrorHandler("type must be one of 'Spam', 'Abuse', 'Fraud', or 'Other'.", 400)
    );
  }

  // Validate reportedEntity as ObjectId
  if (!mongoose.Types.ObjectId.isValid(reportedEntity)) {
    return next(new ErrorHandler("Invalid reportedEntity ID.", 400));
  }

  const payload = {
    reporter: req.user?._id, // Auth middleware should set req.user
    reportedEntity,
    entityType,
    type,
    reason,
    status: "Pending",
  };

  const report = await Report.create(payload);

  res.status(201).json({
    success: true,
    message: "Report created successfully.",
    data: report,
  });
});

/* ---------------------------- GET ALL REPORTS ---------------------------- */
export const getReports = catchAsyncErrors(async (req, res, next) => {
  const reports = await Report.find()
    .populate("reporter", "name email role")
    .populate("reportedEntity", "name title email"); // Adjust depending on entity

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

/* ---------------------------- UPDATE REPORT STATUS ---------------------------- */
export const updateReportStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate report ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid report ID.", 400));
  }

  // Validate status
  const validStatuses = ["Resolved", "Ignored"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Status must be either 'Resolved' or 'Ignored'.", 400));
  }

  const report = await Report.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!report) {
    return next(new ErrorHandler("Report not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: `Report marked as ${status}.`,
    data: report,
  });
});
