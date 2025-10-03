import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getAdminDashboardStats, getLatestReviews, getLatestSuppliers, getTopProducts } from "../controller/adminController.js";

const router = express.Router();

// Protect all routes → only admin can access
router.use(isAuthenticated, isAuthorized("Admin"));

// Dashboard stats
router.get("/dashboard/stats", getAdminDashboardStats);

// Latest suppliers
router.get("/dashboard/suppliers", getLatestSuppliers);

// Top purchased products
router.get("/dashboard/products", getTopProducts);

// Latest reviews
router.get("/dashboard/reviews", getLatestReviews);

export default router;
