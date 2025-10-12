// routes/paymentRoutes.js
import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  initiateLipPay,
  lipPayCallback,
  getPaymentStatus,
  adminReleaseEscrow, // 👈 add this
} from "../controller/paymentController.js";

const router = express.Router();

// Initiate payment → Buyer
router.post("/mpesa/pay", isAuthenticated, initiateLipPay);

// Callback from Safaricom
router.post("/mpesa/callback", lipPayCallback);

// Check payment status → Buyer polls this after STK push
router.get("/status/:orderId", isAuthenticated, getPaymentStatus);

//admin payout
router.get("/admin/release", isAuthenticated, isAuthorized("Admin"), adminReleaseEscrow);

export default router;
