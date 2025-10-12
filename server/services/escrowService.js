// services/escrowService.js
import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";
import axios from "axios";

/**
 * M-Pesa disbursement helper
 * Sends escrow funds to supplier after hold period
 */
const sendMpesaPayment = async (supplierPhone, amount, orderId) => {
  try {
    const { LIPAPAY_CONSUMER_KEY, LIPAPAY_CONSUMER_SECRET, LIPAPAY_SHORTCODE } = process.env;
    if (!LIPAPAY_CONSUMER_KEY || !LIPAPAY_CONSUMER_SECRET) {
      throw new Error("Missing LipPay credentials");
    }

    // ✅ Get OAuth token
    const auth = Buffer.from(`${LIPAPAY_CONSUMER_KEY}:${LIPAPAY_CONSUMER_SECRET}`).toString("base64");
    const { data: tokenData } = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenData.access_token;

    // ✅ Build payout payload
    const payload = {
      InitiatorName: "testapi", // change in production
      SecurityCredential: "your_encrypted_credential",
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: LIPAPAY_SHORTCODE,
      PartyB: supplierPhone,
      Remarks: `Escrow release for order ${orderId}`,
      QueueTimeOutURL: process.env.LIPAPAY_TIMEOUT_URL,
      ResultURL: process.env.LIPAPAY_RESULT_URL,
      Occasion: "EscrowRelease",
    };

    // ✅ Hit M-Pesa B2C endpoint
    await axios.post("https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest", payload, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    console.log(`✅ M-Pesa disbursement initiated for Order ${orderId} to ${supplierPhone}`);
    return true;
  } catch (error) {
    console.error("❌ Escrow release failed:", error.response?.data || error.message);
    return false;
  }
};

/**
 * Schedule escrow release
 * Called when order delivered (sets releaseDate)
 */
export const scheduleEscrowRelease = async (orderId, releaseDate) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);

  order.paymentReleaseStatus = "Scheduled";
  order.releaseDate = releaseDate;
  await order.save();

  console.log(`📅 Escrow release scheduled for Order ${orderId} on ${releaseDate.toDateString()}`);
};

/**
 * CRON job: Auto release escrow when releaseDate reached
 * Should run every 1 hour
 */
export const autoReleaseEscrow = async () => {
  const now = new Date();
  const dueOrders = await Order.find({
    paymentReleaseStatus: "Scheduled",
    paymentStatus: "paid",
    deliveryStatus: "Delivered",
    releaseDate: { $lte: now },
  }).populate("supplier");

  for (const order of dueOrders) {
    const supplier = await Supplier.findById(order.supplier);
    if (!supplier || !supplier.phone) {
      console.warn(`⚠️ Supplier missing or no phone for order ${order._id}`);
      continue;
    }

    const amountToRelease = order.totalEscrowHeld;
    const success = await sendMpesaPayment(supplier.phone, amountToRelease, order._id);

    if (success) {
      order.paymentReleaseStatus = "Released";
      order.items.forEach((item) => (item.escrowStatus = "Released"));
      await order.save();
      console.log(`💸 Escrow released for Order ${order._id}`);
    }
  }
};
