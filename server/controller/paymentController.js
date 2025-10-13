import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import PendingPayment from "../models/PendingPayment.js";
import Payment from "../models/paymentModel.js"
import User from "../models/userModel.js";
import Reward from "../models/RewardModel.js";
import axios from "axios";
import moment from "moment";

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

/* ------------------------ INITIATE ORDER PAYMENT ------------------------ */
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
  let sanitizedPhone = phoneNumber.replace(/\D/g, "");
  if (sanitizedPhone.startsWith("0")) {
    sanitizedPhone = "254" + sanitizedPhone.slice(1);
  } else if (sanitizedPhone.startsWith("7") || sanitizedPhone.startsWith("1")) {
    sanitizedPhone = "254" + sanitizedPhone;
  } else if (!sanitizedPhone.startsWith("254")) {
    return res.status(400).json({ success: false, message: "Invalid phone number format" });
  }

  if (!/^254(7|1)\d{8}$/.test(sanitizedPhone)) {
    return res.status(400).json({ success: false, message: "Invalid Safaricom phone number" });
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

/* ------------------------ LIPAY CALLBACK ------------------------ */
export const lipPayCallback = asyncHandler(async (req, res) => {
  const { Body } = req.body;
  if (!Body?.stkCallback) return res.status(400).send("Invalid callback data");

  const callback = Body.stkCallback;
  const pending = await PendingPayment.findOne({
    checkoutRequestId: callback.CheckoutRequestID,
  }).populate("order");

  if (!pending) {
    console.error("❌ No PendingPayment found for:", callback.CheckoutRequestID);
    return res.status(404).send("Pending payment not found");
  }

  if (callback.ResultCode === 0) {
    pending.order.paymentStatus = "paid";
    pending.order.status = "Processing";
    pending.order.transactionId = callback.CheckoutRequestID;
    pending.order.paidAt = new Date();
    await pending.order.save();

    pending.status = "completed";
    await pending.save();

    try {
      const pointsEarned = Math.floor(pending.order.totalAmount * POINTS_RATE);

      let reward = await Reward.findOne({ user: pending.order.user });
      if (!reward) {
        reward = await Reward.create({ user: pending.order.user, points: 0, history: [] });
      }

      reward.points += pointsEarned;
      reward.history.push({ order: pending.order._id, pointsEarned });
      await reward.save();

      console.log(`✅ ${pointsEarned} points awarded to user ${pending.order.user}`);
    } catch (rewardError) {
      console.error("❌ Failed to assign reward points:", rewardError.message);
    }

    console.log(`💰 Payment completed for Order ${pending.order._id}`);
  } else {
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

  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  res.json({
    success: true,
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    status: order.status,
  });
});

/* ------------------------ ADMIN RELEASE ESCROW ------------------------ */
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

/* ------------------------ WALLET DEPOSIT ------------------------ */
export const initiateWalletDeposit = asyncHandler(async (req, res) => {
  const { amount, phoneNumber } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });
  if (!phoneNumber) return res.status(400).json({ success: false, message: "Phone number required" });

  let sanitizedPhone = phoneNumber.replace(/\D/g, "").replace(/^0/, "254");
  if (!/^254(7|1)\d{8}$/.test(sanitizedPhone)) return res.status(400).json({ success: false, message: "Invalid Safaricom phone number" });

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const { LIPAPAY_SHORTCODE, LIPAPAY_PASSKEY, LIPAPAY_CALLBACK_URL } = process.env;
  const password = Buffer.from(LIPAPAY_SHORTCODE + LIPAPAY_PASSKEY + timestamp).toString("base64");

  try {
    const accessToken = await getAccessToken();

    const payload = {
      BusinessShortCode: LIPAPAY_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: sanitizedPhone,
      PartyB: LIPAPAY_SHORTCODE,
      PhoneNumber: sanitizedPhone,
      CallBackURL: `${LIPAPAY_CALLBACK_URL}/wallet`,
      AccountReference: `WALLET_${userId}`,
      TransactionDesc: "Wallet deposit",
    };

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    if (data.CheckoutRequestID) {
      await Payment.create({
        user: userId,
        amount,
        method: "mpesa",
        status: "pending",
        walletType: "deposit",
        referenceDetails: sanitizedPhone,
        transactionId: data.CheckoutRequestID,
      });
    }

    res.json({ success: true, message: "Complete the STK push to deposit funds", transactionId: data.CheckoutRequestID, amount });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to initiate deposit" });
  }
});

/* ------------------------ WALLET CALLBACK ------------------------ */
export const walletCallback = asyncHandler(async (req, res) => {
  const { Body } = req.body;
  if (!Body?.stkCallback) return res.status(400).send("Invalid callback data");

  const callback = Body.stkCallback;
  const payment = await Payment.findOne({ transactionId: callback.CheckoutRequestID });

  if (!payment) return res.status(404).send("Payment not found");

  if (callback.ResultCode === 0) {
    payment.status = "completed";
    await payment.save();

    const user = await User.findById(payment.user);
    user.walletBalance = (user.walletBalance || 0) + payment.amount;
    await user.save();

    console.log(`💰 Wallet deposit successful for user ${user._id}`);
  } else {
    payment.status = "failed";
    payment.failedReason = callback.ResultDesc || "Payment failed";
    await payment.save();

    console.warn(`⚠️ Wallet deposit failed: ${callback.ResultDesc}`);
  }

  res.json({ success: true });
});

/* ------------------------ WALLET WITHDRAW ------------------------ */
export const withdrawFunds = asyncHandler(async (req, res) => {
  const { amount, phoneNumber } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

  const user = await User.findById(userId);
  if (!user || (user.walletBalance || 0) < amount) return res.status(400).json({ success: false, message: "Insufficient wallet balance" });

  let sanitizedPhone = phoneNumber.replace(/\D/g, "").replace(/^0/, "254");
  if (!/^254(7|1)\d{8}$/.test(sanitizedPhone)) return res.status(400).json({ success: false, message: "Invalid Safaricom phone number" });

  // TODO: Integrate M-Pesa B2C payout API
  const success = true; // Simulate for now

  if (success) {
    user.walletBalance -= amount;
    await user.save();

    await Payment.create({
      user: userId,
      amount,
      method: "mpesa",
      status: "completed",
      walletType: "withdrawal",
      referenceDetails: sanitizedPhone,
    });

    res.json({ success: true, message: "Withdrawal successful" });
  } else {
    res.status(500).json({ success: false, message: "Withdrawal failed" });
  }
});
