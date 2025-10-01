import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

    // Force password change flow
    forcePasswordChange: { type: Boolean, default: false },
    forcePasswordToken: { type: String, select: false },
    forcePasswordTokenExpiry: { type: Date },

    // OTP verification
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    resendAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },

    // Password reset
    resetPasswordToken: { type: String },
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

    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateForcePasswordToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.forcePasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.forcePasswordTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
  return token;
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

userSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// Login throttling
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
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Sanitize JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.forcePasswordToken;
  delete obj.forcePasswordTokenExpiry;
  delete obj.verificationCode;
  delete obj.verificationCodeExpiry;
  delete obj.refreshToken;
  return obj;
};

export const User = mongoose.model("User", userSchema);
export default User;
