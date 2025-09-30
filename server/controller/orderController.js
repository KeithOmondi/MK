import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

/* ------------------------ CREATE ORDER ------------------------ */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryDetails, paymentMethod, shippingCost = 0, coupon } = req.body;

  if (!items || items.length === 0) throw new Error("No items in order");
  if (!paymentMethod) throw new Error("Payment method is required");

  let totalAmount = 0;
  let totalCommission = 0;

  // Prepare order items with escrow calculations
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId).populate("supplier");
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock && product.stock < item.quantity)
        throw new Error(`Not enough stock for ${product.name}`);

      const price = product.price;
      const commissionPercentage = 10; // Admin profit
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
        escrowStatus: "Held", // escrow held until delivery
      };
    })
  );

  // Use first item's seller as main supplier for the order
  const supplier = orderItems[0].seller;

  // Create the order
  const order = new Order({
    buyer: req.user._id,
    items: orderItems,
    supplier,
    totalAmount,
    totalCommission,
    totalEscrowHeld: totalAmount - totalCommission,
    shippingDetails: deliveryDetails,
    paymentMethod,
    shippingCost,
    coupon: coupon || null,
    status: "Pending",
    paymentStatus: "unpaid",
  });

  const createdOrder = await order.save();

  // Populate for frontend
  const populatedOrder = await createdOrder.populate([
    { path: "buyer", select: "name email" },
    { path: "supplier", select: "shopName" },
    { path: "items.product", select: "name price" },
  ]);

  res.status(201).json({
    success: true,
    message: "Order created successfully (escrow held)",
    data: populatedOrder,
  });
});

/* ------------------------ GET ALL ORDERS ------------------------ */
export const getOrders = asyncHandler(async (req, res) => {
  let orders;
  if (req.user.role === "Admin") {
    orders = await Order.find().populate("buyer items.product supplier");
  } else if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    if (!supplierDoc)
      return res.status(403).json({ success: false, message: "Not a supplier" });
    orders = await Order.find({ supplier: supplierDoc._id }).populate(
      "buyer items.product supplier"
    );
  } else {
    orders = await Order.find({ buyer: req.user._id }).populate("items.product supplier");
  }

  res.json({ success: true, data: orders });
});

/* ------------------------ GET ORDER BY ID ------------------------ */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("buyer items.product supplier");
  if (!order) throw new Error("Order not found");

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  let isSupplier = false;
  if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    isSupplier = supplierDoc && order.supplier._id.toString() === supplierDoc._id.toString();
  }

  if (!isBuyer && !isSupplier && req.user.role !== "Admin") {
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, data: order });
});

/* ------------------------ UPDATE STATUS ------------------------ */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");
  if (status && !allowed.includes(status)) throw new Error("Invalid status value");

  let isSupplier = false;
  if (req.user.role === "Supplier") {
    const supplierDoc = await Supplier.findOne({ user: req.user._id });
    isSupplier = supplierDoc && order.supplier.toString() === supplierDoc._id.toString();
  }
  if (!isSupplier && req.user.role !== "Admin") throw new Error("Not authorized");

  order.status = status || order.status;
  const updated = await order.save();

  res.json({ success: true, message: "Order status updated", data: updated });
});

/* ------------------------ ADD REVIEW ------------------------ */
export const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  if (order.status !== "Delivered") throw new Error("Can only review delivered orders");

  order.reviews.push({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  await order.save();
  res.json({ success: true, message: "Review added", data: order });
});

/* ------------------------ REQUEST REFUND (with Escrow) ------------------------ */
export const requestRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  if (order.status !== "Delivered") throw new Error("Refund allowed only after delivery");

  order.refund = {
    requested: true,
    reason,
    status: "Pending",
    requestedAt: Date.now(),
  };

  order.items = order.items.map((item) => ({
    ...item.toObject(),
    escrowStatus: "Refund Pending",
  }));

  await order.save();
  res.json({
    success: true,
    message: "Refund requested (escrow flagged for review)",
    data: order,
  });
});

/* ------------------------ PROCESS REFUND (Admin with Escrow) ------------------------ */
export const processRefund = asyncHandler(async (req, res) => {
  const { action } = req.body; // "Approved" or "Rejected"
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  if (req.user.role !== "Admin") throw new Error("Only admin can process refunds");

  if (!order.refund || !order.refund.requested) {
    throw new Error("No refund requested for this order");
  }

  order.refund.status = action;
  order.refund.processedAt = Date.now();

  if (action === "Approved") {
    order.paymentStatus = "refunded";
    order.refundedAt = Date.now();
    order.items = order.items.map((item) => ({
      ...item.toObject(),
      escrowStatus: "Refunded",
    }));
  } else if (action === "Rejected") {
    order.items = order.items.map((item) => ({
      ...item.toObject(),
      escrowStatus: "Released",
    }));
  }

  await order.save();
  res.json({
    success: true,
    message: `Refund ${action}`,
    data: order,
  });
});

/* ------------------------ DELETE ORDER (Admin) ------------------------ */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");
  await order.deleteOne();
  res.json({ success: true, message: "Order deleted" });
});

/* ------------------------ CANCEL ORDER (Buyer) ------------------------ */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.buyer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (["Shipped", "Delivered"].includes(order.status)) {
    return res.status(400).json({ message: "Cannot cancel after shipping" });
  }

  order.status = "Cancelled";
  await order.save();

  res.json({ success: true, data: order });
});

/* ------------------------ RELEASE ESCROW ------------------------ */
export const releaseEscrow = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  if (order.status !== "Delivered") throw new Error("Cannot release escrow before delivery");
  if (req.user.role !== "Admin") throw new Error("Only admin can release escrow");

  order.items = order.items.map((item) => ({
    ...item.toObject(),
    escrowStatus: "Released",
  }));

  order.paymentStatus = "paid";
  order.paidAt = Date.now();

  await order.save();
  res.json({ success: true, message: "Escrow released to seller(s)", data: order });
});


/* ------------------------ GET ALL ORDERS (Admin only) ------------------------ */
export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const orders = await Order.find()
    .populate("buyer", "name email")
    .populate("supplier", "shopName")
    .populate("items.product", "name price");

  res.json({ success: true, data: orders });
});

/* ------------------------ GET ALL ORDERS (Supplier only) ------------------------ */
export const getAllOrdersForSupplier = asyncHandler(async (req, res) => {
  if (req.user.role !== "Supplier") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const supplierDoc = await Supplier.findOne({ user: req.user._id });
  if (!supplierDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Supplier account not found" });
  }

  const orders = await Order.find({ supplier: supplierDoc._id })
    .populate("buyer", "name email")
    .populate("supplier", "shopName")
    .populate("items.product", "name price");

  res.json({ success: true, data: orders });
});

// server/controllers/orderController.js
export const getDeliveredOrdersByUserAndProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.query;

    const orders = await Order.find({
      userId,
      status: "Delivered",
      "items.productId": productId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
