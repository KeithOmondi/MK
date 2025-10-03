// controllers/authController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateLoginAlertEmailTemplate, generatePasswordChangeEmailTemplate } from "../utils/emailTemplates.js";
import Supplier from "../models/Supplier.js";

/* -------------------------
   Helpers
------------------------- */
const validatePassword = (password) => {
  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
  if (!isStrong) {
    throw new ErrorHandler(
      400,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol."
    );
  }
};

/* =========================================================
   ✅ Register
========================================================= */
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists", 400));
  }

  let avatarData = {};
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("Please upload a valid image format", 400));
    }

    const uploadRes = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "MKSTORE",
    });

    avatarData = {
      public_id: uploadRes.public_id,
      url: uploadRes.secure_url,
    };
  }

  // ✅ Generate OTP
  const otp = generateOTP();

  const user = await User.create({
    name,
    email,
    password, // pre-save hook will hash
    avatar: avatarData,
    accountVerified: false,
    verificationCode: otp,
    verificationCodeExpiry: Date.now() + 15 * 60 * 1000,
  });

  // ✅ Send OTP
  await sendEmail({
    email,
    subject: "Verify your account - MKSTORE",
    html: `<p>Hello ${name},</p>
           <p>Your OTP is <b>${otp}</b>. It will expire in 15 minutes.</p>`,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully. OTP sent to email.",
    user: { id: user._id, email: user.email },
  });
});

/* =========================================================
   ✅ Verify OTP
========================================================= */
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select("+verificationCode +verificationCodeExpiry");
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (!user.verificationCode || user.verificationCode !== otp) {
    return next(new ErrorHandler("Invalid OTP", 400));
  }

  if (user.verificationCodeExpiry < Date.now()) {
    return next(new ErrorHandler("OTP expired", 400));
  }

  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return sendToken(user, 200, "Account verified successfully", res);
});

/* =========================================================
   ✅ Resend OTP
========================================================= */
export const resendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.accountVerified) {
    return next(new ErrorHandler("Account already verified", 400));
  }

  const otp = generateOTP();
  user.verificationCode = otp;
  user.verificationCodeExpiry = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: "Resend OTP - MKSTORE",
    html: `<p>Hello ${user.name},</p>
           <p>Your new OTP is <b>${otp}</b>. It will expire in 15 minutes.</p>`,
  });

  res.status(200).json({
    success: true,
    message: "OTP resent successfully.",
  });
});

/* =========================================================
   ✅ Login
========================================================= */
const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler(400, "Email and password are required."));

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +loginAttempts +lockUntil +refreshToken"
  );
  if (!user) return next(new ErrorHandler(401, "Invalid email or password."));

  // ==========================
  // ✅ Supplier extra checks
  // ==========================
  if (user.role === "Supplier") {
    const supplier = await Supplier.findOne({ user: user._id });

    if (!supplier) {
      return next(new ErrorHandler(403, "Supplier profile not found."));
    }

    // Block if OTP not verified
    if (!supplier.verified) {
      return next(
        new ErrorHandler(403, "Please verify your email with the OTP sent.")
      );
    }

    // Block if admin has not yet approved
    if (supplier.status !== "Approved") {
      return next(
        new ErrorHandler(
          403,
          "Your supplier account is awaiting admin approval."
        )
      );
    }
  }

  // ==========================
  // Account lock check
  // ==========================
  if (user.isLocked) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      accountLocked: true,
      message: `Account locked. Try again in ${unlockTime} minute(s).`,
    });
  }

  // ==========================
  // Password check
  // ==========================
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    await user.incrementLoginAttempts();
    const attemptsLeft = Math.max(5 - (user.loginAttempts || 0), 0);
    return res.status(401).json({
      success: false,
      attemptsLeft,
      message: `Invalid email or password. You have ${attemptsLeft} attempt(s) remaining.`,
    });
  }

  await user.resetLoginAttempts();

  // ==========================
  // Login history + alerts
  // ==========================
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.ip ||
    "Unknown IP";
  const userAgent = req.headers["user-agent"] || "Unknown device";
  const time = new Date().toLocaleString();

  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({ ip, userAgent, time });
  if (user.loginHistory.length > 10) {
    user.loginHistory = user.loginHistory.slice(-10);
  }
  await user.save({ validateBeforeSave: false });

  const html = generateLoginAlertEmailTemplate(user.name, ip, userAgent, time);
  await sendEmail({
    email: user.email,
    subject: "New Login Detected",
    html,
  });

  // ==========================
  // Send tokens
  // ==========================
  await sendToken(user, 200, "Login successful.", res);
});


/* =========================================================
   ✅ Forgot Password
========================================================= */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset - MKSTORE",
    html: `<p>Hello ${user.name},</p>
           <p>Click below to reset your password:</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
  });
});

/* =========================================================
   ✅ Reset Password
========================================================= */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const html = generatePasswordChangeEmailTemplate(user.name);
  await sendEmail({
    email: user.email,
    subject: "Password Change Alert",
    html,
  });

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully.",
  });
});

/* =========================================================
   ✅ Update Password (logged in)
========================================================= */
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return res.status(400).json({ success: false, message: "Old password is incorrect" });
  }

  user.password = req.body.newPassword;
  await user.save();

  const html = generatePasswordChangeEmailTemplate(user.name);
  await sendEmail({
    email: user.email,
    subject: "Password Change Alert",
    html,
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

/* =========================================================
   ✅ Logout
========================================================= */
const logout = catchAsyncErrors(async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  }).status(200).json({ success: true, message: "Logged out successfully." });
});

/* =========================================================
   ✅ Get Current User
========================================================= */
const getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/* =========================================================
   ✅ Refresh Token
========================================================= */
const refreshToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "Refresh token required." });
  }

  const user = await User.findOne({ refreshToken: token }).select("+refreshToken");
  if (!user) return res.status(401).json({ success: false, message: "Invalid refresh token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.id !== user._id.toString()) {
      return res.status(401).json({ success: false, message: "Token mismatch." });
    }

    await sendToken(user, 200, "Access token refreshed.", res);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Refresh token expired or invalid." });
  }
});

/* -------------------------
   Exports
------------------------- */
export {
  login,
  logout,
  getUser,
  refreshToken,
};
