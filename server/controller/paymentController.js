import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import PendingPayment from "../models/PendingPayment.js";
import axios from "axios";
import moment from "moment";

/* ------------------ Helper: Get M-Pesa OAuth Token ------------------ */
const getAccessToken = async () => {
  const { LIPAPAY_CONSUMER_KEY, LIPAPAY_CONSUMER_SECRET } = process.env;
  if (!LIPAPAY_CONSUMER_KEY || !LIPAPAY_CONSUMER_SECRET) {
    throw new Error("Missing LipPay consumer key/secret in environment");
  }

  const auth = Buffer.from(
    `${LIPAPAY_CONSUMER_KEY}:${LIPAPAY_CONSUMER_SECRET}`
  ).toString("base64");

  const { data } = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return data.access_token;
};

/* ------------------------ INITIATE STK PUSH ------------------------ */
export const initiateLipPay = asyncHandler(async (req, res) => {
  const { orderId, phoneNumber } = req.body;

  if (!orderId || !phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID and phone number are required" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Sanitize phone
  let sanitizedPhone = phoneNumber.replace(/\D/g, "");
  if (!sanitizedPhone.startsWith("254")) {
    sanitizedPhone = "254" + sanitizedPhone.slice(-9);
  }

  const { LIPAPAY_SHORTCODE, LIPAPAY_PASSKEY, LIPAPAY_CALLBACK_URL } = process.env;
  if (!LIPAPAY_SHORTCODE || !LIPAPAY_PASSKEY || !LIPAPAY_CALLBACK_URL) {
    return res
      .status(500)
      .json({ success: false, message: "Missing LipPay configuration" });
  }

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    LIPAPAY_SHORTCODE + LIPAPAY_PASSKEY + timestamp
  ).toString("base64");
  const accountReference = `ORDER_${orderId}`;

  try {
    const accessToken = await getAccessToken();

    const payload = {
      BusinessShortCode: LIPAPAY_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: order.totalAmount,
      PartyA: sanitizedPhone,
      PartyB: LIPAPAY_SHORTCODE,
      PhoneNumber: sanitizedPhone,
      CallBackURL: LIPAPAY_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: "Payment for order",
    };

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save pending payment
    if (data.CheckoutRequestID) {
      await PendingPayment.create({
        checkoutRequestId: data.CheckoutRequestID,
        order: order._id,
        phoneNumber: sanitizedPhone,
        status: "pending",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Please complete your order by entering your M-Pesa PIN",
      orderId: order._id,
      checkoutRequestId: data.CheckoutRequestID,
    });
  } catch (error) {
    console.error("❌ LipPay initiation error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error.response?.data || error.message,
    });
  }
});

/* ------------------------ LIPAPAY CALLBACK ------------------------ */
export const lipPayCallback = asyncHandler(async (req, res) => {
  const { Body } = req.body;
  if (!Body?.stkCallback) {
    return res.status(400).send("Invalid callback data");
  }

  const callback = Body.stkCallback;
  const pending = await PendingPayment.findOne({
    checkoutRequestId: callback.CheckoutRequestID,
  }).populate("order");

  if (!pending) {
    console.error("❌ No PendingPayment found for:", callback.CheckoutRequestID);
    return res.status(404).send("Pending payment not found");
  }

  if (callback.ResultCode === 0) {
    // Success
    pending.order.paymentStatus = "paid";
    pending.order.status = "Processing";
    pending.order.transactionId = callback.CheckoutRequestID;
    pending.order.paidAt = new Date();
    await pending.order.save();

    pending.status = "completed";
    await pending.save();

    console.log(`✅ Payment completed for Order ${pending.order._id}`);
  } else {
    // Failed
    pending.order.paymentStatus = "failed";
    pending.order.status = "Pending";
    await pending.order.save();

    pending.status = "failed";
    pending.failedReason = callback.ResultDesc || "Payment failed";
    await pending.save();

    console.warn(
      `⚠️ Payment failed → CheckoutRequestID: ${callback.CheckoutRequestID}, code: ${callback.ResultCode}, reason: ${callback.ResultDesc}`
    );
  }

  res.json({ success: true });
});

/* ------------------------ CHECK PAYMENT STATUS ------------------------ */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({
    success: true,
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    status: order.status,
  });
});
