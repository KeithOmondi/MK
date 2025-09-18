import { Chat } from "../models/chatModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import Order from "../models/Order.js";

// Regex to hide phone numbers
const phoneRegex = /(\+?\d{10,15})/g;

// ===========================
// Send message (text, image, audio)
// ===========================
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { receiverId, orderId, message, type } = req.body;
  const sender = req.user;

  if (!receiverId || !orderId) {
    return next(new ErrorHandler(400, "Receiver and orderId are required"));
  }

  // Check that the order exists and the sender/receiver are linked
  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler(404, "Order not found"));

  const isValid =
    (sender.role === "User" && order.buyer.toString() === sender._id.toString() && order.supplier.toString() === receiverId) ||
    (sender.role === "Supplier" && order.supplier.toString() === sender._id.toString() && order.buyer.toString() === receiverId);

  if (!isValid) {
    return next(
      new ErrorHandler(
        403,
        sender.role === "User"
          ? "You can only chat with suppliers from your orders"
          : sender.role === "Supplier"
          ? "You can only chat with buyers who ordered from you"
          : "Role not allowed to send messages"
      )
    );
  }

  // Handle media uploads
  let mediaUrl = null;
  if (req.file) {
    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      type === "audio" ? "video" : "image"
    );
    mediaUrl = uploaded.url;
  }

  // Sanitize phone numbers
  const sanitizedMessage = message?.replace(phoneRegex, "[hidden]") || null;

  const newMessage = await Chat.create({
    sender: sender._id,
    receiver: receiverId,
    type: type || "text",
    message: sanitizedMessage,
    mediaUrl,
    order: orderId,
  });

  // Emit to receiver via Socket.IO
  const io = req.app.get("io");
  const receiverSocket = io ? io.sockets.sockets.get(receiverId) : null;
  if (receiverSocket) {
    io.to(receiverSocket.id).emit("newMessage", newMessage);
  }

  res.status(201).json({ success: true, data: newMessage });
});

// ===========================
// Get conversation with pagination
// ===========================
export const getMessages = catchAsyncErrors(async (req, res, next) => {
  const { userId, orderId } = req.params;
  const sender = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler(404, "Order not found"));

  const isValid =
    (sender.role === "User" && order.buyer.toString() === sender._id.toString() && order.supplier.toString() === userId) ||
    (sender.role === "Supplier" && order.supplier.toString() === sender._id.toString() && order.buyer.toString() === userId);

  if (!isValid) return next(new ErrorHandler(403, "Not authorized"));

  const totalMessages = await Chat.countDocuments({
    order: orderId,
  });

  let messages = await Chat.find({ order: orderId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  messages = messages.map((msg) => {
    if (msg.message) msg.message = msg.message.replace(phoneRegex, "[hidden]");
    return msg;
  });

  res.status(200).json({
    success: true,
    currentPage: page,
    totalPages: Math.ceil(totalMessages / limit),
    totalMessages,
    messages: messages.reverse(),
  });
});

// ===========================
// Mark messages as read
// ===========================
export const markAsRead = catchAsyncErrors(async (req, res) => {
  const { senderId, orderId } = req.params;

  const updated = await Chat.updateMany(
    { sender: senderId, receiver: req.user._id, read: false, order: orderId },
    { $set: { read: true } }
  );

  res.status(200).json({ success: true, updated });
});

// ===========================
// Get chat list with latest message preview
// ===========================
export const getChatList = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"] },
        latestMessage: { $first: "$$ROOT" },
      },
    },
  ]);

  const sanitizedChats = chats.map((chat) => {
    if (chat.latestMessage.message) {
      chat.latestMessage.message = chat.latestMessage.message.replace(phoneRegex, "[hidden]");
    }
    return chat;
  });

  res.status(200).json({ success: true, chats: sanitizedChats });
});
