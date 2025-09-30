import express from "express";
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
  getDeliveredOrdersByUserAndProduct, // ← new
} from "../controller/orderController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -------------------- ORDERS -------------------- */

// ✅ Create order → Buyer creates an order (escrow held)
router.post("/create", isAuthenticated, createOrder);

// ✅ Get all orders (role logic handled in controller)
router.get("/get", isAuthenticated, getOrders);

// ✅ Get single order by ID
router.get("/get/:id", isAuthenticated, getOrderById);

//Get all ordeers for supplier
router.get(
  "/admin-get",
  isAuthenticated,
  isAuthorized("Supplier"),
  getAllOrdersForSupplier
);

//Get all ordeers for Admin
router.get(
  "/get",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllOrdersForAdmin
);

// ✅ Update order status → Admin or Supplier
router.put(
  "/update/:id/status",
  isAuthenticated,
  isAuthorized("Admin", "Supplier"),
  updateOrderStatus
);

// ✅ Delete order → Admin only
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteOrder
);

/* -------------------- REVIEWS -------------------- */

// ✅ Add review to order item → Buyer only
router.post(
  "/add/:id/review",
  isAuthenticated,
  isAuthorized("Buyer"),
  addReview
);

/* -------------------- REFUNDS & ESCROW -------------------- */

// ✅ Request refund → Buyer (escrow-aware)
router.post(
  "/request/:id/refund",
  isAuthenticated,
  isAuthorized("Buyer"),
  requestRefund
);

// ✅ Process refund → Admin (escrow release/refund)
router.put(
  "/process/:id/refund",
  isAuthenticated,
  isAuthorized("Admin"),
  processRefund
);

// ✅ Release escrow → Admin (after delivery)
router.put(
  "/release/:id/escrow",
  isAuthenticated,
  isAuthorized("Admin"),
  releaseEscrow
);

/* -------------------- CANCEL ORDER -------------------- */

// ✅ Cancel order → Buyer
router.put("/cancel/:id", isAuthenticated, isAuthorized("Buyer"), cancelOrder);

//getting delivered products

router.get("/user-delivered", isAuthenticated, getDeliveredOrdersByUserAndProduct);


export default router;
