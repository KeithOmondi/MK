import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import PendingPayment from "../models/PendingPayment.js";
import axios from "axios";
import moment from "moment";
import Reward from "../models/RewardModel.js"




const POINTS_RATE = 1; // 1 point per 1 currency unit paid

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
    return res.status(400).json({ success: false, message: "Order ID and phone number are required" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // ✅ Sanitize phone
let sanitizedPhone = phoneNumber.replace(/\D/g, ""); // remove non-digits

if (sanitizedPhone.startsWith("0")) {
  // 07XXXXXXXX or 01XXXXXXXX
  sanitizedPhone = "254" + sanitizedPhone.slice(1);
} else if (sanitizedPhone.startsWith("7") || sanitizedPhone.startsWith("1")) {
  // 7XXXXXXXX or 1XXXXXXXX
  sanitizedPhone = "254" + sanitizedPhone;
} else if (!sanitizedPhone.startsWith("254")) {
  return res
    .status(400)
    .json({ success: false, message: "Invalid phone number format" });
}

// ✅ Final validation (must be 12 digits, start with 2547 or 2541)
if (!/^254(7|1)\d{8}$/.test(sanitizedPhone)) {
  return res
    .status(400)
    .json({ success: false, message: "Invalid Safaricom phone number" });
}


  const { LIPAPAY_SHORTCODE, LIPAPAY_PASSKEY, LIPAPAY_CALLBACK_URL } = process.env;
  if (!LIPAPAY_SHORTCODE || !LIPAPAY_PASSKEY || !LIPAPAY_CALLBACK_URL) {
    return res.status(500).json({ success: false, message: "Missing LipPay configuration" });
  }

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(LIPAPAY_SHORTCODE + LIPAPAY_PASSKEY + timestamp).toString("base64");

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
      AccountReference: `ORDER_${orderId}`,
      TransactionDesc: "Payment for order",
    };

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    if (data.CheckoutRequestID) {
      await PendingPayment.create({
        checkoutRequestId: data.CheckoutRequestID,
        order: order._id,
        phoneNumber: sanitizedPhone,
        status: "pending",
      });
    }

    return res.json({
      success: true,
      message: "Please complete your order by entering your M-Pesa PIN",
      orderId: order._id,
      checkoutRequestId: data.CheckoutRequestID,
    });
  } catch (error) {
    console.error("❌ LipPay initiation error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
});


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
    // ✅ Success
    pending.order.paymentStatus = "paid";
    pending.order.status = "Processing";
    pending.order.transactionId = callback.CheckoutRequestID;
    pending.order.paidAt = new Date();
    await pending.order.save();

    pending.status = "completed";
    await pending.save();

    // 🎁 Award reward points
    try {
      const pointsEarned = Math.floor(pending.order.totalAmount * POINTS_RATE);

      let reward = await Reward.findOne({ user: pending.order.user });
      if (!reward) {
        reward = await Reward.create({
          user: pending.order.user,
          points: 0,
          history: [],
        });
      }

      reward.points += pointsEarned;
      reward.history.push({
        order: pending.order._id,
        pointsEarned,
      });

      await reward.save();
      console.log(`✅ ${pointsEarned} points awarded to user ${pending.order.user}`);
    } catch (rewardError) {
      console.error("❌ Failed to assign reward points:", rewardError.message);
    }

    console.log(`💰 Payment completed for Order ${pending.order._id}`);
  } else {
    // ❌ Failed
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


// POST /api/admin/release/:orderId
export const adminReleaseEscrow = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate("supplier");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const supplier = order.supplier;
  if (!supplier || !supplier.phone)
    return res.status(400).json({ success: false, message: "Supplier missing or invalid phone" });

  const success = await sendMpesaPayment(supplier.phone, order.totalEscrowHeld, order._id);
  if (!success)
    return res.status(500).json({ success: false, message: "Failed to send M-Pesa payment" });

  order.paymentReleaseStatus = "Released";
  order.items.forEach((i) => (i.escrowStatus = "Released"));
  await order.save();

  res.json({ success: true, message: "Escrow released successfully", order });
});
