import CouponModel from "../models/CouponModel.js";


/* -------------------------- ADMIN: Create a Coupon -------------------------- */
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit } = req.body;

    const existing = await CouponModel.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: "Coupon code already exists." });

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      expiryDate,
      usageLimit,
    });

    res.status(201).json({ message: "Coupon created successfully.", coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon.", error: error.message });
  }
};

/* -------------------------- ADMIN: Get All Coupons -------------------------- */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons.", error: error.message });
  }
};

/* -------------------------- ADMIN: Update a Coupon -------------------------- */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });

    res.json({ message: "Coupon updated successfully.", coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to update coupon.", error: error.message });
  }
};

/* -------------------------- ADMIN: Delete a Coupon -------------------------- */
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });

    res.json({ message: "Coupon deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon.", error: error.message });
  }
};

/* -------------------------- USER: Apply a Coupon -------------------------- */
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: "Coupon code and order total are required." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ message: "Invalid or inactive coupon code." });

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon has expired." });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached." });
    }

    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value for this coupon is ${coupon.minOrderValue}.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    const finalAmount = Math.max(orderTotal - discount, 0);

    res.json({
      message: "Coupon applied successfully.",
      discount,
      finalAmount,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply coupon.", error: error.message });
  }
};
