import express from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controller/couponController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/create", isAuthenticated, isAuthorized("Supplier"), createCoupon);
router.get("/get", isAuthenticated, isAuthorized("Supplier", "Admin"), getAllCoupons);
router.put("/update/:id", isAuthenticated, isAuthorized("Supplier"), updateCoupon);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Supplier", "Admin"), deleteCoupon);

// User route
router.post("/apply", isAuthenticated, applyCoupon);

export default router;
