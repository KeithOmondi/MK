// controllers/analyticsController.js
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { User } from "../models/userModel.js";

// ====================
// Admin Analytics
// ====================
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  // Total revenue from paid orders
  const totalRevenueAgg = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

  // Total orders
  const totalOrders = await Order.countDocuments();

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Total users & suppliers
  const totalUsers = await User.countDocuments();
  const totalSuppliers = await Supplier.countDocuments();

  // Top products by revenue
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        name: "$product.name",
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  res.json({
    totalRevenue,
    totalOrders,
    ordersByStatus,
    totalUsers,
    totalSuppliers,
    topProducts,
  });
});

// ====================
// Supplier Analytics
// ====================
export const getSupplierAnalytics = asyncHandler(async (req, res) => {
  const supplierId = req.user.supplierProfile; // must be linked
  if (!supplierId) {
    res.status(400);
    throw new Error("Supplier profile not found for this user");
  }

  // Supplier paid orders
  const orders = await Order.find({
    supplier: supplierId,
    paymentStatus: "paid",
  });

  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;

  const ordersByStatus = await Order.aggregate([
    { $match: { supplier: supplierId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Top-selling products for this supplier
  const topProducts = await Order.aggregate([
    { $match: { supplier: supplierId, paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        name: "$product.name",
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  res.json({
    totalRevenue,
    totalOrders,
    ordersByStatus,
    topProducts,
  });
});

// ====================
// Customer Analytics
// ====================
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Customer paid orders
  const orders = await Order.find({ buyer: userId, paymentStatus: "paid" });

  const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;

  const ordersByStatus = await Order.aggregate([
    { $match: { buyer: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Favorite products (most frequently ordered)
  const favoriteProducts = await Order.aggregate([
    { $match: { buyer: userId, paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalOrdered: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        name: "$product.name",
        totalOrdered: 1,
      },
    },
  ]);

  res.json({
    totalSpent,
    totalOrders,
    ordersByStatus,
    favoriteProducts,
  });
});
