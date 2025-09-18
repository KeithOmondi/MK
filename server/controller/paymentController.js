// paymentController.js
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" }); // ✅ load env first

import Stripe from "stripe";
import Order from "../models/Order.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==============================
// Create Stripe Payment Intent
// ==============================
export const createStripePayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) return next(new ErrorHandler(400, "Order ID is required"));

  const order = await Order.findById(orderId).populate("items.product buyer");
  if (!order) return next(new ErrorHandler(404, "Order not found"));

  // Amount in cents
  const amount = Math.round(order.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      orderId: order._id.toString(),
      userId: order.buyer._id.toString(),
    },
  });

  res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

// ==============================
// Stripe Webhook for Payment Confirmation
// ==============================
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  if (!sig) return res.status(400).send("Missing Stripe signature header");

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "paid";
        order.status = "processing"; // optional
        order.transactionId = paymentIntent.id;
        order.paidAt = Date.now();
        await order.save();
        console.log(`✅ Payment successful for order ${orderId}`);
      }
      break;

    case "payment_intent.payment_failed":
      console.warn(`⚠️ Payment failed for paymentIntent: ${event.data.object.id}`);
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});
