import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "User", "Supplier"],
      default: "User",
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: Number,
    },
    verificationCodeExpiry: {
      type: Date,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    // Optional link to Supplier profile (if role = Supplier)
    supplierProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    // Optional link to orders for quick access
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // 🔒 Login rate-limiting fields
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a 5-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  this.verificationCode = code;
  this.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
  return code;
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

// 🚨 Check if account is locked
userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// 🚨 Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Lock expired → reset
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5 && !this.isLocked) {
      // Lock account for 10 minutes
      this.lockUntil = Date.now() + 10 * 60 * 1000;
    }
  }
  await this.save();
};

// 🚨 Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export const User = mongoose.model("User", userSchema);
