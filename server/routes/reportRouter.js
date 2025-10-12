// src/routes/reportRoutes.js
import express from "express";
import {
  createReport,
  getReports,
  updateReportStatus,
} from "../controller/reportController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/v1/reports/create
 * @desc    Create a new report (accessible to any authenticated user)
 * @access  Private
 */
router.post("/create", isAuthenticated, createReport);

/**
 * @route   GET /api/v1/reports
 * @desc    Get all reports (admin only)
 * @access  Private/Admin
 */
router.get("/get", isAuthenticated, isAuthorized("Admin"), getReports);

/**
 * @route   PUT /api/v1/reports/:id/status
 * @desc    Update report status (admin only)
 * @access  Private/Admin
 */
router.put("/update/:id/status", isAuthenticated, isAuthorized("Admin"), updateReportStatus);

export default router;
