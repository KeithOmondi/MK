import mongoose from "mongoose";
import { User } from "./userModel.js"; // adjust path as needed
import Order from "./Order.js"; // 🔹 Import Order to validate chats

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text",
    },
    message: { type: String },      // text messages
    mediaUrl: { type: String },     // images or audio
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for efficient chat lookups
chatSchema.index({ sender: 1, receiver: 1, order: 1, createdAt: -1 });

// 🔒 Pre-save hook to validate sender ↔ receiver relationship for the specific order
chatSchema.pre("save", async function (next) {
  try {
    const chat = this;
    const senderId = chat.sender;
    const receiverId = chat.receiver;
    const orderId = chat.order;

    if (!orderId) {
      const error = new Error("Order ID is required for chat");
      error.status = 400;
      return next(error);
    }

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }

    // Validate sender and receiver are linked by this order
    const isValid =
      (order.buyer.toString() === senderId.toString() &&
        order.supplier.toString() === receiverId.toString()) ||
      (order.supplier.toString() === senderId.toString() &&
        order.buyer.toString() === receiverId.toString());

    if (!isValid) {
      const error = new Error(
        "Invalid chat: sender and receiver must be linked by the order"
      );
      error.status = 403;
      return next(error);
    }

    next();
  } catch (err) {
    next(err);
  }
});

export const Chat = mongoose.model("Chat", chatSchema);
