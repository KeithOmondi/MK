import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { calculateShippingCost } from "../utils/shipping.js";
import { scheduleEscrowRelease } from "../services/escrowService.js";

/* =======================================================
   CREATE ORDER (Escrow Held + Shipping Info from Frontend)
========================================================= */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryDetails = {}, paymentMethod, shippingCost, estimatedDeliveryDate } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ success: false, message: "No items in order" });

  const allowedPaymentMethods = ["mpesa", "stripe", "paypal", "cod"];
  if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod))
    return res.status(400).json({ success: false, message: "Invalid or missing payment method" });

  if (!shippingCost || !estimatedDeliveryDate)
    return res.status(400).json({ success: false, message: "Shipping info required" });

  // Prepare delivery details
  const delivery = {
    address: deliveryDetails.address || "N/A",
    city: deliveryDetails.city || "",
    phone: deliveryDetails.phone || "N/A",
    deliveryProvider: deliveryDetails.deliveryProvider || "manual",
    shippingMethod: deliveryDetails.shippingMethod || "standard",
  };

  let totalAmount = 0;
  let totalCommission = 0;

  // Map items to order items
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId).populate("supplier");
      if (!product) throw new ErrorHandler(`Product not found: ${item.productId}`, 404);
      if (!product.supplier) throw new ErrorHandler(`Supplier missing for ${product.name}`, 404);
      if (product.stock < item.quantity)
        throw new ErrorHandler(`Insufficient stock for ${product.name}`, 400);

      const price = product.price;
      const commissionPercentage = 10;
      const commission = (price * item.quantity * commissionPercentage) / 100;
      const escrowAmount = price * item.quantity - commission;

      totalAmount += price * item.quantity;
      totalCommission += commission;

      return {
        product: product._id,
        quantity: item.quantity,
        price,
        seller: product.supplier._id,
        commissionPercentage,
        escrowAmount,
        escrowStatus: "Held",
      };
    })
  );

  const supplier = orderItems[0]?.seller;
  if (!supplier) throw new ErrorHandler("Unable to determine supplier", 400);

  // Calculate release date for escrow (3 days after estimated delivery)
  const releaseDate = new Date(estimatedDeliveryDate);
  releaseDate.setDate(releaseDate.getDate() + 3);

  const order = new Order({
    buyer: req.user._id,
    items: orderItems,
    supplier,
    totalAmount,
    totalCommission,
    totalEscrowHeld: totalAmount - totalCommission,
    deliveryDetails: { ...delivery },
    paymentMethod,
    shippingCost,
    shippingDistance: 0, // optional, can be added in shipping estimate
    estimatedDeliveryDate: new Date(estimatedDeliveryDate),
    status: "Pending",
    deliveryStatus: "Pending",
    paymentStatus: "held",
    paymentReleaseStatus: "Scheduled",
    releaseDate,
  });

  const createdOrder = await order.save();
  const populatedOrder = await createdOrder.populate([
    { path: "buyer", select: "name email" },
    { path: "supplier", select: "shopName" },
    { path: "items.product", select: "name price" },
  ]);

  res.status(201).json({
    success: true,
    message: "Order created successfully (escrow held + shipping info applied)",
    data: populatedOrder,
  });
});

// -----------------------------
// Controller: getShippingEstimate
// POST /api/shipping/estimate
// Body: { items, deliveryAddress, shippingMethod }
// -----------------------------
// server/controllers/orderController.js
/* ------------------------------------------------------------
   📦 CONTROLLER: GET SHIPPING ESTIMATE
------------------------------------------------------------ */
export const getShippingEstimate = async (req, res) => {
  try {
    const { items, deliveryAddress, shippingMethod, totalAmount = 0 } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "No items provided for shipping estimate.",
      });
    }

    // 🔧 Compute base or advanced cost
    let shippingCost = 0;
    try {
      shippingCost = await calculateShippingCost({ items, deliveryAddress, totalAmount });
    } catch (err) {
      console.warn("LocationIQ unavailable, fallback used:", err.message);
      shippingCost = 200 + 50 * (items.length - 1);
    }

    // 🕒 Estimate delivery time
    let estimatedDays = shippingMethod === "express" ? 1 : 3;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);

    res.status(200).json({
      success: true,
      data: {
        shippingCost,
        estimatedDays,
        estimatedDeliveryDate,
      },
    });
  } catch (error) {
    console.error("Error in getShippingEstimate:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating shipping estimate.",
      error: error.message,
    });
  }
};

/* =======================================================
   UPDATE ORDER STATUS (Handles Delivery + Escrow Release)
========================================================= */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Delayed"];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid or missing status value" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);

  // ✅ Authorization
  let isSupplier = false;
  if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    if (!supplierDoc)
      return res.status(403).json({ success: false, message: "Supplier not found" });
    isSupplier = order.supplier?.toString() === supplierDoc._id.toString();
  }
  if (!isSupplier && req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Not authorized to update this order" });
  }

  // ✅ Update order status
  order.status = status;

  // ✅ Handle delivery logic and escrow release
  if (status === "Shipped") {
    order.deliveryStatus = "In Transit";
  } else if (status === "Delivered") {
    order.deliveryStatus = "Delivered";
    order.deliveredAt = new Date();
    order.paymentStatus = "paid"; // Customer completed payment

    // Calculate actual delivery duration & distance from warehouse
    try {
      const { getCoordinates, getDistanceKm } = await import("../utils/shipping.js");
      const warehouseCoords = await getCoordinates(process.env.WAREHOUSE_ADDRESS);
      const customerCoords = await getCoordinates(order.deliveryDetails.address);
      const distanceKm = await getDistanceKm(warehouseCoords, customerCoords);

      // Assume average speed 40 km/day for delivery duration
      const estimatedDays = Math.max(1, Math.round(distanceKm / 40));
      order.deliveryDuration = estimatedDays;
      order.shippingDistance = distanceKm;

    } catch (err) {
      console.error("Error calculating delivery duration:", err);
      // fallback to previous createdAt calculation
      const diffInDays = (order.deliveredAt.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      order.deliveryDuration = Math.max(Math.round(diffInDays), 0);
    }

    // Set escrow release date: 3 days after delivery
    const releaseDate = new Date(order.deliveredAt);
    releaseDate.setDate(releaseDate.getDate() + 3);
    order.releaseDate = releaseDate;
    order.paymentReleaseStatus = "Scheduled";

  } else if (status === "Cancelled") {
    order.deliveryStatus = "Cancelled";
    order.paymentStatus = "refunded";
    order.paymentReleaseStatus = "OnHold";
  } else if (status === "Delayed") {
    order.deliveryStatus = "Delayed";
  }

  const updatedOrder = await order.save();

  // ✅ Trigger M-Pesa escrow release if delivered
  if (status === "Delivered") {
    const releaseDate = new Date(order.deliveredAt);
    releaseDate.setDate(releaseDate.getDate() + 3);
    await scheduleEscrowRelease(order._id, releaseDate);
  }

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: updatedOrder,
  });
});


/* =======================================================
   GET ORDERS (Role-Based)
======================================================= */
export const getOrders = asyncHandler(async (req, res) => {
  let orders;
  if (req.user.role === "Admin") {
    orders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .populate("supplier", "shopName");
  } else if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    if (!supplierDoc) return res.status(403).json({ success: false, message: "Not a supplier" });
    orders = await Order.find({ supplier: supplierDoc._id })
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .populate("supplier", "shopName");
  } else {
    orders = await Order.find({ buyer: req.user._id })
      .populate("buyer", "name email")
      .populate("items.product", "name price")
      .populate("supplier", "shopName");
  }
  res.json({ success: true, data: orders });
});

/* =======================================================
   GET ORDER BY ID
======================================================= */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("buyer items.product supplier");
  if (!order) throw new ErrorHandler("Order not found", 404);

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  let isSupplier = false;
  if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    if (supplierDoc) isSupplier = order.supplier._id.toString() === supplierDoc._id.toString();
  }

  if (!isBuyer && !isSupplier && req.user.role !== "Admin") {
    throw new ErrorHandler("Not authorized to view this order", 403);
  }

  res.json({ success: true, data: order });
});

/* =======================================================
   GET ALL ORDERS FOR ADMIN
======================================================= */
export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") return res.status(403).json({ success: false, message: "Not authorized" });
  const orders = await Order.find()
    .populate("buyer", "name email")
    .populate("supplier", "shopName")
    .populate("items.product", "name price");
  res.json({ success: true, data: orders });
});

/* =======================================================
   GET ALL ORDERS FOR SUPPLIER
======================================================= */
export const getAllOrdersForSupplier = asyncHandler(async (req, res) => {
  if (req.user.role !== "Supplier") return res.status(403).json({ success: false, message: "Not authorized" });
  const supplierDoc = await Supplier.findOne({ user: req.user._id });
  if (!supplierDoc) return res.status(404).json({ success: false, message: "Supplier account not found" });
  const orders = await Order.find({ supplier: supplierDoc._id })
    .populate("buyer", "name email")
    .populate("supplier", "shopName")
    .populate("items.product", "name price");
  res.json({ success: true, data: orders });
});


/* =======================================================
   ADD REVIEW
======================================================= */
export const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);
  if (order.status !== "Delivered") throw new ErrorHandler("Can only review delivered orders", 400);

  order.reviews.push({ user: req.user._id, product: productId, rating, comment });
  await order.save();
  res.json({ success: true, message: "Review added", data: order });
});

/* =======================================================
   REQUEST REFUND (per item or full order)
======================================================= */
export const requestRefund = asyncHandler(async (req, res) => {
  const { itemId, reason } = req.body; // itemId optional for full refund
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);
  if (order.status !== "Delivered") throw new ErrorHandler("Refund allowed only after delivery", 400);

  // ✅ Partial refund (specific item)
  if (itemId) {
    const item = order.items.id(itemId);
    if (!item) throw new ErrorHandler("Order item not found", 404);

    item.refundStatus = "Pending";
    item.refundReason = reason;
    item.isReturned = true;
    item.escrowStatus = "Refund Pending";
  } else {
    // ✅ Full order refund
    order.refund = {
      requested: true,
      reason,
      status: "Pending",
      requestedAt: Date.now(),
    };
    order.items.forEach((i) => {
      i.refundStatus = "Pending";
      i.escrowStatus = "Refund Pending";
      i.isReturned = true;
    });
  }

  await order.save();

  res.json({
    success: true,
    message: itemId
      ? "Refund requested for selected item"
      : "Refund requested for entire order",
    data: order,
  });
});


/* =======================================================
   PROCESS REFUND (Admin only, now with stock + payment log)
======================================================= */
export const processRefund = asyncHandler(async (req, res) => {
  const { itemId, action, refundAmount } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);
  if (req.user.role !== "Admin") throw new ErrorHandler("Only admin can process refunds", 403);

  if (itemId) {
    // ✅ Partial Refund
    const item = order.items.id(itemId);
    if (!item) throw new ErrorHandler("Order item not found", 404);

    if (action === "Approved") {
      const refundValue = refundAmount || item.price * item.quantity;
      item.refundStatus = "Approved";
      item.refundAmount = refundValue;
      item.refundDate = new Date();
      item.escrowStatus = "Refunded";
      item.isReturned = true;
      order.totalRefunded += refundValue;

      // ✅ Restore stock
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }

      // ✅ Log refund transaction
      await Payment.create({
        order: order._id,
        buyer: order.buyer,
        amount: refundValue,
        type: "Refund",
        status: "Success",
        method: order.paymentMethod,
        note: `Refund approved for ${product?.name || "an item"} (Qty: ${item.quantity})`,
      });

    } else if (action === "Rejected") {
      item.refundStatus = "Rejected";
      item.escrowStatus = "Released";
    }

  } else {
    // ✅ Full order refund
    order.refund.status = action;
    order.refund.processedAt = Date.now();

    if (action === "Approved") {
      order.items.forEach(async (i) => {
        i.refundStatus = "Approved";
        i.refundAmount = i.price * i.quantity;
        i.refundDate = new Date();
        i.escrowStatus = "Refunded";
        i.isReturned = true;

        // Restore stock
        const product = await Product.findById(i.product);
        if (product) {
          product.stock += i.quantity;
          await product.save();
        }
      });
      order.totalRefunded = order.totalAmount;
      order.paymentStatus = "refunded";
      order.status = "Refunded";

      // Log refund transaction
      await Payment.create({
        order: order._id,
        buyer: order.buyer,
        amount: order.totalRefunded,
        type: "Refund",
        status: "Success",
        method: order.paymentMethod,
        note: "Full order refund approved",
      });

    } else if (action === "Rejected") {
      order.items.forEach((i) => (i.refundStatus = "Rejected"));
      order.paymentStatus = "released";
    }
  }

  await order.save();

  res.json({
    success: true,
    message: itemId
      ? `Refund ${action} for selected item`
      : `Refund ${action} for full order`,
    data: order,
  });
});


/* =======================================================
   CANCEL ORDER
======================================================= */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });
  if (["Shipped", "Delivered"].includes(order.status)) return res.status(400).json({ message: "Cannot cancel after shipping" });

  order.status = "Cancelled";
  await order.save();
  res.json({ success: true, data: order });
});

/* =======================================================
   RELEASE ESCROW
======================================================= */
export const releaseEscrow = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);
  if (order.status !== "Delivered") throw new ErrorHandler("Cannot release escrow before delivery", 400);
  if (req.user.role !== "Admin") throw new ErrorHandler("Only admin can release escrow", 403);

  order.items = order.items.map((item) => ({ ...item.toObject(), escrowStatus: "Released" }));
  order.paymentStatus = "paid";
  order.paidAt = Date.now();
  await order.save();

  res.json({ success: true, message: "Escrow released to seller(s)", data: order });
});

/* =======================================================
   DELETE ORDER
======================================================= */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorHandler("Order not found", 404);
  await order.deleteOne();
  res.json({ success: true, message: "Order deleted" });
});

/* =======================================================
   GET DELIVERED ORDERS (for Reviews)
======================================================= */
export const getDeliveredOrdersByUserAndProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.query;

  const orders = await Order.find({
    buyer: userId,
    status: "Delivered",
    "items.product": productId,
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, orders });
});


