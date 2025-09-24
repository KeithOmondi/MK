// server/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
      select: false, // don't return password by default
    },

    role: {
      type: String,
      enum: ["Admin", "Supplier", "User"],
      default: "User",
    },

    // Account verification
    accountVerified: {
      type: Boolean,
      default: false,
    },

    forcePasswordChange: {
      type: Boolean,
      default: false,
    },

    // OTP verification fields
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

    // Password reset
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },

    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    // Links
    supplierProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Login throttling
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------
   Pre-save hooks
   ------------------------- */

// Hash password when created or modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* -------------------------
   Instance methods
   ------------------------- */

/**
 * Generate a 5-digit verification code and expiry (10 minutes)
 * Stores code & expiry on the user doc (in plain number for easy comparison).
 */
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(10000 + Math.random() * 90000); // 5-digit
  this.verificationCode = code;
  this.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.verificationAttempts = (this.verificationAttempts || 0) + 1;
  this.lastAttemptAt = new Date();
  return code;
};

/**
 * Generate JWT for auth
 * Returns signed token string.
 */
userSchema.methods.getJwtToken = function () {
  const payload = { id: this._id, role: this.role };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Generate reset password token.
 * - returns the RAW token (string) to email to the user
 * - stores the HASHED token and expiry on the user document
 */
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Store hashed token in DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 15 minutes expiry
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken; // raw token to email
};

/**
 * Compare plain password with hashed password (useful in controllers)
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* -------------------------
   Login throttling helpers
   ------------------------- */

/**
 * Virtual property isLocked
 */
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Increment login attempts and set lockWhen threshold reached.
 * Saves the document.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    // lock after 5 attempts
    if (this.loginAttempts >= 5 && !this.isLocked) {
      this.lockUntil = Date.now() + 10 * 60 * 1000; // lock 10 minutes
    }
  }
  await this.save();
};

/**
 * Reset login attempts (successful login)
 */
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

/* -------------------------
   Helpers to sanitize output
   ------------------------- */

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.verificationCode;
  delete obj.verificationCodeExpiry;
  return obj;
};

export const User = mongoose.model("User", userSchema);
export default User;
