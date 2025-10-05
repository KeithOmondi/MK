import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import Coupon from "../models/CouponModel.js";
import Reward from "../models/RewardModel.js";

export const getOffers = catchAsyncErrors(async (req, res) => {
  const coupons = await Coupon.find({ expiry: { $gte: new Date() } }).sort({ expiry: 1 });

  let rewards = await Reward.findOne({ user: req.user._id });
  if (!rewards) {
    rewards = { points: 0, history: [] };
  }

  res.status(200).json({
    success: true,
    coupons,
    rewards,
  });
});
