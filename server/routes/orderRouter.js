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

// ✅ Create order → typically a customer creates an order
router.post("/create", isAuthenticated, createOrder);

// ✅ Get all orders → Admin & Supplier can see all, User can see own
router.get("/get", isAuthenticated, isAuthorized("Admin", "Supplier"), getOrders);

// ✅ Get single order → User can see own, Admin/Supplier can see all
router.get("/get/:id", isAuthenticated, getOrderById);

// ✅ Update order status → Admin or Supplier (for shipping) 
router.put("/update/:id/status", isAuthenticated, isAuthorized("Admin", "Supplier"), updateOrderStatus);

// ✅ Delete order → Admin only
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteOrder);

export default router;
