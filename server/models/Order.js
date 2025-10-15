import mongoose from "mongoose";
const { Schema } = mongoose;

/* ===============================
   Order Item Subdocument
=============================== */
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },

    // Seller Info
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // 💰 Commission & Earnings
    commissionPercentage: { type: Number, default: 10 },
    platformFee: { type: Number, default: 0 },
    supplierEarnings: { type: Number, default: 0 },

    // 💼 Escrow Management
    escrowStatus: {
      type: String,
      enum: ["Held", "Released", "Refunded", "Refund Pending"],
      default: "Held",
    },
    escrowAmount: { type: Number, required: true },

    // 🔁 Refund Info (per item)
    isReturned: { type: Boolean, default: false },
    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Rejected", "Processed"],
      default: "None",
    },
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    refundDate: { type: Date },
  },
  { _id: false }
);

/* ===============================
   Main Order Schema
=============================== */
const orderSchema = new Schema(
  {
    /* ---------- Buyer & Seller ---------- */
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: { type: [orderItemSchema], required: true },

    /* ---------- Totals ---------- */
    totalAmount: { type: Number, required: true },
    totalCommission: { type: Number, default: 0 },
    totalEscrowHeld: { type: Number, default: 0 },
    totalRefunded: { type: Number, default: 0 },
    totalSupplierEarnings: { type: Number, default: 0 },

    /* ---------- Shipping ---------- */
    shippingCost: { type: Number, min: 0, default: 0 },
    shippingDistance: { type: Number, min: 0, default: 0 },
    estimatedDeliveryDays: { type: Number, default: 0 },
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    deliveryDetails: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String },
      phone: { type: String, required: true },
      deliveryProvider: { type: String, default: "manual" },
      distanceKm: { type: Number, default: 0 },
    },

    /* ---------- Delivery Tracking ---------- */
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    deliveryDuration: { type: Number, default: 0 },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Delayed", "Cancelled"],
      default: "Pending",
    },

    /* ---------- Order Status ---------- */
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Partially Refunded",
        "Refunded",
      ],
      default: "Pending",
    },

    /* ---------- Payment & Escrow ---------- */
    paymentMethod: {
      type: String,
      enum: ["mpesa", "stripe", "paypal", "cod", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "held", "released", "refunded", "partially_refunded"],
      default: "unpaid",
    },

    paymentReleaseStatus: {
      type: String,
      enum: ["Pending", "Scheduled", "Released", "OnHold"],
      default: "Pending",
    },

    // ⬇️ Manual Escrow Control
    releasedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // admin who manually released
    },
    releasedAt: { type: Date, default: null },
    releaseNotes: { type: String, default: "" },

    transactionId: { type: String },
    paidAt: { type: Date },
    releaseDate: { type: Date },
    refundedAt: { type: Date },

    /* ---------- Dispute & Refund ---------- */
    isDisputed: { type: Boolean, default: false },
    disputeReason: { type: String },
    refund: {
      requested: { type: Boolean, default: false },
      reason: { type: String },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Processed"],
        default: "Pending",
      },
      requestedAt: { type: Date },
      processedAt: { type: Date },
      amount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

/* ===============================
   Hooks & Auto-Calculations
=============================== */
orderSchema.pre("save", function (next) {
  // Auto-calc delivery duration
  if (this.deliveredAt && this.createdAt) {
    const diffInDays =
      (this.deliveredAt.getTime() - this.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);
    this.deliveryDuration = Math.max(Math.round(diffInDays), 0);
  }

  // ✅ Compute commission, supplier earnings, and totals
  let totalCommission = 0;
  let totalSupplierEarnings = 0;

  this.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    item.platformFee = (item.commissionPercentage / 100) * itemTotal;
    item.supplierEarnings = itemTotal - item.platformFee;

    totalCommission += item.platformFee;
    totalSupplierEarnings += item.supplierEarnings;
  });

  this.totalCommission = totalCommission;
  this.totalSupplierEarnings = totalSupplierEarnings;
  this.totalAmount = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Escrow balance (amount held until admin release)
  this.totalEscrowHeld = this.totalAmount - this.totalCommission;

  // Calculate total refunded amount
  this.totalRefunded = this.items.reduce((sum, i) => sum + (i.refundAmount || 0), 0);

  // Adjust order/payment status automatically
  if (this.totalRefunded > 0 && this.totalRefunded < this.totalAmount) {
    this.status = "Partially Refunded";
    this.paymentStatus = "partially_refunded";
  } else if (this.totalRefunded === this.totalAmount) {
    this.status = "Refunded";
    this.paymentStatus = "refunded";
  }

  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
