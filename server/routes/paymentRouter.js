import express from "express";
import { createStripePayment, stripeWebhook } from "../controller/paymentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import bodyParser from "body-parser";

const router = express.Router();

// Create payment intent
router.post("/stripe", isAuthenticated, createStripePayment);

// Stripe webhook (raw body required)
router.post("/stripe/webhook", bodyParser.raw({ type: "application/json" }), stripeWebhook);

export default router;
