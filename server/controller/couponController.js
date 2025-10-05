import asyncHandler from "express-async-handler";
import Coupon from "../models/CouponModel.js"

// Admin: create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue,
    usageLimit,
  } = req.body;
  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue,
    usageLimit,
  });
  res.status(201).json({ success: true, coupon });
});

// Validate coupon
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, totalAmount } = req.body;
  const coupon = await Coupon.findOne({ code, active: true });

  if (!coupon)
    return res.status(404).json({ success: false, message: "Invalid coupon" });
  if (new Date() > coupon.expiryDate)
    return res.status(400).json({ success: false, message: "Coupon expired" });
  if (coupon.usedCount >= coupon.usageLimit)
    return res
      .status(400)
      .json({ success: false, message: "Coupon usage limit reached" });
  if (totalAmount < coupon.minOrderValue)
    return res
      .status(400)
      .json({
        success: false,
        message: `Minimum order is ${coupon.minOrderValue}`,
      });

  res.json({
    success: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
});
