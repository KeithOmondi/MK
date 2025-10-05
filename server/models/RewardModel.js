import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, default: 0 },
    history: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        pointsEarned: Number,
        pointsUsed: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Reward", rewardSchema);
