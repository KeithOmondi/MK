import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controller/orderController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Create order → Buyer creates an order
router.post("/create", isAuthenticated, createOrder);

// ✅ Get all orders → logic handled in controller (Admin → all, Supplier → theirs, Buyer → own)
router.get("/get", isAuthenticated, getOrders);

// ✅ Get single order → Buyer can see own, Admin/Supplier can see all
router.get("/get/:id", isAuthenticated, getOrderById);

// ✅ Update order status → Admin or Supplier
router.put(
  "/update/:id/status",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  updateOrderStatus
);

// ✅ Delete order → Admin only
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteOrder);

export default router;
