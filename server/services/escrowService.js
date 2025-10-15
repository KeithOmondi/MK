// services/escrowService.js
import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";
import axios from "axios";

/* ======================================
   M-PESA PAYMENT HELPER
====================================== */
const sendMpesaPayment = async (supplierPhone, amount, orderId) => {
  try {
    const {
      LIPAPAY_CONSUMER_KEY,
      LIPAPAY_CONSUMER_SECRET,
      LIPAPAY_SHORTCODE,
    } = process.env;

    if (!LIPAPAY_CONSUMER_KEY || !LIPAPAY_CONSUMER_SECRET) {
      throw new Error("Missing Lipapay credentials");
    }

    // ✅ Get OAuth token
    const auth = Buffer.from(
      `${LIPAPAY_CONSUMER_KEY}:${LIPAPAY_CONSUMER_SECRET}`
    ).toString("base64");

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
      Remarks: `Manual Escrow release for order ${orderId}`,
      QueueTimeOutURL: process.env.LIPAPAY_TIMEOUT_URL,
      ResultURL: process.env.LIPAPAY_RESULT_URL,
      Occasion: "EscrowRelease",
    };

    // ✅ Hit M-Pesa B2C endpoint
    await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ M-Pesa disbursement initiated for Order ${orderId}`);
    return true;
  } catch (error) {
    console.error("❌ Escrow release failed:", error.response?.data || error.message);
    return false;
  }
};

/* ======================================
   SCHEDULE ESCROW (still useful)
====================================== */
export const scheduleEscrowRelease = async (orderId, releaseDate) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);

  order.paymentReleaseStatus = "Scheduled";
  order.releaseDate = releaseDate;
  await order.save();

  console.log(`📅 Escrow release scheduled for Order ${orderId} on ${releaseDate.toDateString()}`);
};

/* ======================================
   MANUAL ESCROW RELEASE (Admin)
====================================== */
export const manuallyReleaseEscrow = async (orderId, adminId) => {
  const order = await Order.findById(orderId).populate("supplier");
  if (!order) throw new Error("Order not found");
  if (order.paymentReleaseStatus === "Released")
    throw new Error("Escrow already released");

  const supplier = await Supplier.findById(order.supplier);
  if (!supplier || !supplier.phone)
    throw new Error("Supplier not found or missing phone number");

  const amountToRelease = order.totalEscrowHeld;
  const success = await sendMpesaPayment(supplier.phone, amountToRelease, order._id);

  if (success) {
    order.paymentReleaseStatus = "Released";
    order.items.forEach((item) => (item.escrowStatus = "Released"));
    order.releasedBy = adminId;
    order.releasedAt = new Date();
    await order.save();

    console.log(`💸 Escrow manually released for Order ${order._id} by Admin ${adminId}`);
    return { success: true, message: "Escrow successfully released" };
  } else {
    throw new Error("M-Pesa disbursement failed");
  }
};
