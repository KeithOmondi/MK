// server/controller/reviewController.js
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/* ================================
   Add a new review
================================ */
export const addReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!productId || !orderId || rating == null || !comment) {
      return res.status(400).json({ message: "Order ID, product ID, rating, and comment are required" });
    }

    // Check order exists
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only delivered orders can be reviewed
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "You can only review products from delivered orders" });
    }

    // Check product is part of the order
    const productInOrder = order.items.find(
      item => item.productId?.toString() === productId.toString()
    );
    if (!productInOrder) return res.status(400).json({ message: "Product not in this order" });

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({ orderId, productId, userId });
    if (existingReview) return res.status(400).json({ message: "You have already reviewed this product" });

    // Create review
    const review = await Review.create({ productId, orderId, userId, rating, comment });

    // Populate user info for frontend
    await review.populate("userId", "name email");

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


/* ================================
   Get reviews by product
================================ */
export const getReviewsByProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;

    // Populate userId to get user's name and email
    const reviews = await Review.find({ productId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Get reviews by user
================================ */
export const getReviewsByUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("Get User Reviews Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Update a review
================================ */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error("Update Review Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Delete a review
================================ */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({ message: err.message });
  }
};
