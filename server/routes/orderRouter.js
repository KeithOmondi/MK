import express from "express";
import asyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  addReview,
  requestRefund,
  processRefund,
  cancelOrder,
  releaseEscrow,
  getAllOrdersForSupplier,
  getAllOrdersForAdmin,
  getDeliveredOrdersByUserAndProduct,
  getShippingEstimate,
} from "../controller/orderController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =======================================================
   RATE LIMITERS (Protect Sensitive Routes)
========================================================= */

const refundLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // Max 5 refund requests per window
  message: {
    success: false,
    message: "Too many refund requests. Please try again later.",
  },
});

const estimateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 10, // Max 10 estimate requests per window
  message: {
    success: false,
    message: "Too many shipping estimate requests. Please wait a while.",
  },
});

/* =======================================================
   ORDERS
========================================================= */

// 🛒 Create a new order (escrow held) → Buyer
router.post("/create", isAuthenticated, asyncHandler(createOrder));

// 📦 Get all orders for logged-in user (Buyer, Supplier, Admin)
router.get("/get", isAuthenticated, asyncHandler(getOrders));

// 🔍 Get a single order by ID
router.get("/get/:id", isAuthenticated, asyncHandler(getOrderById));

// 🏪 Get all orders for supplier → Supplier only
router.get(
  "/supplier",
  isAuthenticated,
  isAuthorized("Supplier"),
  asyncHandler(getAllOrdersForSupplier)
);

// 🧑‍💼 Get all orders for admin → Admin only
router.get(
  "/admin",
  isAuthenticated,
  isAuthorized("Admin"),
  asyncHandler(getAllOrdersForAdmin)
);

// 🚚 Update order status → Admin or Supplier
router.put(
  "/update/:id/status",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  asyncHandler(updateOrderStatus)
);

// ❌ Delete order → Admin only
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  asyncHandler(deleteOrder)
);

/* =======================================================
   REVIEWS
========================================================= */

// ⭐ Add review → Buyer only
router.post("/add/:id/review", isAuthenticated, asyncHandler(addReview));

/* =======================================================
   REFUNDS & ESCROW
========================================================= */

// 💸 Request refund → Buyer
router.post(
  "/request/:id/refund",
  isAuthenticated,
  refundLimiter,
  asyncHandler(requestRefund)
);

// 🧾 Process refund → Admin only
router.put(
  "/process/:id/refund",
  isAuthenticated,
  isAuthorized("Admin"),
  asyncHandler(processRefund)
);

// 🔒 Release escrow → Admin only (after delivery confirmation)
router.put(
  "/release/:id/escrow",
  isAuthenticated,
  isAuthorized("Admin"),
  asyncHandler(releaseEscrow)
);

/* =======================================================
   CANCELLATIONS
========================================================= */

// 🛑 Cancel order → Buyer
router.put("/cancel/:id", isAuthenticated, asyncHandler(cancelOrder));

/* =======================================================
   DELIVERED ORDERS (For Reviews)
========================================================= */

// ✅ Get all delivered orders by user for review section
router.get(
  "/user-delivered",
  isAuthenticated,
  asyncHandler(getDeliveredOrdersByUserAndProduct)
);

/* =======================================================
   SHIPPING ESTIMATE
========================================================= */

// 🚚 Get delivery cost and ETA → Buyer
router.post(
  "/estimates",
  isAuthenticated,
  estimateLimiter,
  asyncHandler(getShippingEstimate)
);

export default router;
