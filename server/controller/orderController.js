import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import asyncHandler from "express-async-handler";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, supplier, deliveryDetails, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in order");
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  // ✅ Validate supplier
  const supplierExists = await Supplier.findById(supplier);
  if (!supplierExists) {
    res.status(400);
    throw new Error("Invalid supplier");
  }

  // ✅ Calculate totals
  let totalAmount = 0;
  const orderItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);

      // Optional: check stock
      if (product.stock && product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      const price = product.price;
      totalAmount += price * item.quantity;

      return {
        product: product._id,
        quantity: item.quantity,
        price,
      };
    })
  );

  // ✅ Create order
  const order = new Order({
    buyer: req.user._id,
    items: orderItems,
    supplier,
    totalAmount,
    deliveryDetails,
    paymentMethod,
    status: "Pending",
  });

  const createdOrder = await order.save();

  // ✅ Populate before sending back
  const populatedOrder = await createdOrder.populate([
    { path: "buyer", select: "name email" },
    { path: "supplier", select: "shopName" },
    { path: "items.product", select: "name price" },
  ]);

  res.status(201).json(populatedOrder);
});

// @desc    Get all orders (admin / supplier / buyer)
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  let orders;

  if (req.user.role === "Admin") {
    orders = await Order.find().populate("buyer items.product supplier");
  } else if (req.user.role === "Supplier") {
    orders = await Order.find({ supplier: req.user._id }).populate(
      "buyer items.product supplier"
    );
  } else {
    orders = await Order.find({ buyer: req.user._id }).populate(
      "items.product supplier"
    );
  }

  res.json(orders);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "buyer items.product supplier"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // ✅ Allow only Admin, Supplier (of this order), or Buyer (owner of order)
  if (
    req.user.role !== "Admin" &&
    req.user.role !== "Supplier" &&
    order.buyer._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin / Supplier)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status && !allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  order.status = status || order.status;
  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();
  res.json({ message: "Order deleted" });
});
