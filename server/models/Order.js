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
      },
    ],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // 💰 Order totals
    totalAmount: { type: Number, required: true },

    // 🚚 Delivery info
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

    // 💳 Payment details
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
    transactionId: { type: String }, // from payment provider
    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
