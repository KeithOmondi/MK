import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },

        // 🏦 Escrow fields per item
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        commissionPercentage: { type: Number, default: 10 }, // profit %
        escrowStatus: {
          type: String,
          enum: ["Held", "Released", "Refunded"],
          default: "Held",
        },
        escrowAmount: { type: Number, required: true }, // calculated as price*quantity minus commission
      },
    ],

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // 💰 Order totals
    totalAmount: { type: Number, required: true },
    totalCommission: { type: Number, default: 0 },
    totalEscrowHeld: { type: Number, default: 0 },

    // 🚚 Shipping info
    deliveryDetails: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      deliveryProvider: { type: String, default: "manual" },
    },

    // 📦 Order status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // 💳 Payment
    paymentMethod: {
      type: String,
      enum: ["mpesa", "stripe", "paypal", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    transactionId: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },

    // ⭐ Reviews
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ↩️ Refund requests
    refund: {
      requested: { type: Boolean, default: false },
      reason: { type: String },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      requestedAt: { type: Date },
      processedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
