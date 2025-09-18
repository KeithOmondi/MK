import express from "express";
import {
  getAdminAnalytics,
  getSupplierAnalytics,
  getCustomerAnalytics,
} from "../controller/analyticsController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin dashboard
router.get("/admin", isAuthenticated, isAuthorized("Admin"), getAdminAnalytics);

// Supplier dashboard
router.get("/supplier", isAuthenticated, isAuthorized("Supplier"), getSupplierAnalytics);

// Customer dashboard
router.get("/customer", isAuthenticated, isAuthorized("User"), getCustomerAnalytics);

export default router;
