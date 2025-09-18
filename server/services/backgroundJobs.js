import cron from "node-cron";
import { User } from "../models/userModel.js";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

// ✅ Setup email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Remove unverified accounts older than X hours
export const removeUnverifiedAccounts = () => {
  cron.schedule("0 * * * *", async () => { // every hour
    const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h
    const unverifiedUsers = await User.find({
      accountVerified: false,
      createdAt: { $lt: expiryDate },
    });

    for (const user of unverifiedUsers) {
      await user.deleteOne();
      console.log(`❌ Deleted unverified account: ${user.email}`);
    }
  });
};

// Notify pending orders or overdue payments
export const notifyPendingOrders = () => {
  cron.schedule("0 9 * * *", async () => { // every day at 9am
    const pendingOrders = await Order.find({
      status: "pending",
      paymentStatus: "unpaid",
    }).populate("buyer", "email name");

    for (const order of pendingOrders) {
      if (!order.buyer.email) continue;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.buyer.email,
        subject: `Pending Order Reminder`,
        text: `Hello ${order.buyer.name}, your order (${order._id}) is still pending payment. Please complete it to avoid cancellation.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Sent reminder to ${order.buyer.email} for order ${order._id}`);
    }
  });
};
