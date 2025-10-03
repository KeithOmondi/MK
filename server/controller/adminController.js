import Order from "../models/Order.js";
import User from "../models/userModel.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

/**
 * ==============================
 * GET ADMIN DASHBOARD STATS
 * ==============================
 */
export const getAdminDashboardStats = async (req, res) => {
  try {
    // ----------------- Orders -----------------
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const completedOrders = await Order.countDocuments({ status: "Completed" });

    // ----------------- Payments -----------------
    const pendingPayments = await Order.countDocuments({ paymentStatus: "Pending" });
    const completedPayments = await Order.countDocuments({ paymentStatus: "Paid" });

    // ----------------- Refunds -----------------
    const pendingRefunds = await Order.countDocuments({ refundStatus: "Pending" });
    const completedRefunds = await Order.countDocuments({ refundStatus: "Completed" });

    const totalRefundAmountAgg = await Order.aggregate([
      { $match: { refundStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]);
    const totalRefundAmount =
      totalRefundAmountAgg.length > 0 ? totalRefundAmountAgg[0].total : 0;

    // ----------------- Users & Suppliers -----------------
    const totalUsers = await User.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    // ----------------- Products -----------------
    const totalProducts = await Product.countDocuments();

    // ----------------- Revenue -----------------
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // ----------------- Weekly & Monthly Revenue -----------------
    const weeklyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $isoWeek: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
      { $project: { week: "$_id", revenue: 1, _id: 0 } },
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
      { $project: { month: "$_id", revenue: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        pendingPayments,
        completedPayments,
        pendingRefunds,
        completedRefunds,
        totalRefundAmount,
        totalUsers,
        totalSuppliers,
        totalProducts,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        weeklyRevenue,
        monthlyRevenue,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

/**
 * ==============================
 * GET LATEST SUPPLIERS
 * ==============================
 */
export const getLatestSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt");
    res.json({ success: true, data: suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch suppliers" });
  }
};

/**
 * ==============================
 * GET TOP PURCHASED PRODUCTS
 * ==============================
 */
export const getTopProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sales: -1 } },
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
          _id: "$product._id",
          name: "$product.name",
          sales: 1,
        },
      },
    ]);

    res.json({ success: true, data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top products" });
  }
};

/**
 * ==============================
 * GET LATEST REVIEWS
 * ==============================
 */
export const getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Flatten review data to match frontend
    const formattedReviews = reviews.map((r) => ({
      _id: r._id,
      user: r.user?.name || "Unknown",
      product: r.product?.name || "Unknown",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: formattedReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};
