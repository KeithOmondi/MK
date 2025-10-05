import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import validator from "validator";

// ------------------- Address SubSchema -------------------
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }, // ✅ optional default flag
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Supplier", "User"],
      default: "User",
    },

    accountVerified: { type: Boolean, default: false },

    // OTP verification
    verificationCode: { type: String, select: false },
    verificationCodeExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    resendAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date },

    avatar: {
      url: { type: String },
      publicId: { type: String },
    },

    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    supplierProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date },

    // 🔒 Hashed refresh token storage
    refreshToken: { type: String, select: false },

    // 📌 Security + Analytics
    lastLogin: { type: Date },
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        time: String,
      },
    ],

    // ✅ Embedded Addresses
    addresses: [addressSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, obj) => {
        delete obj.password;
        delete obj.resetPasswordToken;
        delete obj.resetPasswordExpire;
        delete obj.verificationCode;
        delete obj.verificationCodeExpiry;
        delete obj.refreshToken;
        return obj;
      },
    },
  }
);

// ------------------- Pre-save -------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ------------------- Methods -------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// OTP methods
userSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = crypto.createHash("sha256").update(otp).digest("hex");
  this.verificationCodeExpiry = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyOtp = function (otp) {
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  return this.verificationCode === hashedOtp && this.verificationCodeExpiry > Date.now();
};

// JWT methods
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// 🔒 Secure Refresh Token Handling
userSchema.methods.setRefreshToken = function () {
  const refreshToken = jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });

  this.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  return refreshToken; // raw token returned to client
};

userSchema.methods.verifyRefreshToken = function (token) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return this.refreshToken === hashed;
};

// ------------------- Login Throttling -------------------
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    if (this.loginAttempts >= 5 && !this.isLocked) {
      this.lockUntil = Date.now() + 10 * 60 * 1000;
    }
  }
  return this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

export const User = mongoose.model("User", userSchema);
export default User;
