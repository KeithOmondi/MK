// controllers/authController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import Supplier from "../models/Supplier.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import {
  generateLoginAlertEmailTemplate,
  generatePasswordChangeEmailTemplate,
} from "../utils/emailTemplates.js";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";

/* =========================================================
   Helper: Validate password strength
========================================================= */
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
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
      400
    );
  }
};

/* =========================================================
   ✅ Register
========================================================= */
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists.", 400));
  }

  let avatarData = {};
  if (req.files?.avatar) {
    const { avatar } = req.files;
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("Invalid image format.", 400));
    }

    const uploadRes = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "MKSTORE/avatars",
    });

    avatarData = {
      public_id: uploadRes.public_id,
      url: uploadRes.secure_url,
    };
  }

  const otp = generateOTP();

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    avatar: avatarData,
    accountVerified: false,
    verificationCode: otp,
    verificationCodeExpiry: Date.now() + 15 * 60 * 1000,
  });

  await sendEmail({
    to: email,
    subject: "Verify your account - MKSTORE",
    html: `<p>Hello ${name},</p><p>Your OTP is <b>${otp}</b>. It expires in 15 minutes.</p>`,
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
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  if (user.verificationCodeExpiry < Date.now()) {
    return next(new ErrorHandler("OTP expired.", 400));
  }

  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  await sendToken(user, 200, "Account verified successfully.", res);
});

/* =========================================================
   ✅ Resend OTP
========================================================= */
export const resendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found.", 404));
  if (user.accountVerified) return next(new ErrorHandler("Account already verified.", 400));

  const otp = generateOTP();
  user.verificationCode = otp;
  user.verificationCodeExpiry = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: "Resend OTP - MKSTORE",
    html: `<p>Hello ${user.name},</p><p>Your new OTP is <b>${otp}</b>. It expires in 15 minutes.</p>`,
  });

  res.status(200).json({ success: true, message: "OTP resent successfully." });
});

/* =========================================================
   ✅ Login Controller
========================================================= */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  // 2️⃣ Find user by email (ensure case-insensitive + password field included)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +loginAttempts +lockUntil +refreshToken"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 401));
  }

  // 3️⃣ Supplier-specific checks
  if (user.role === "Supplier") {
    const supplier = await Supplier.findOne({ user: user._id });

    if (!supplier) {
      return next(new ErrorHandler("Supplier profile not found.", 403));
    }

    if (!supplier.verified) {
      return next(new ErrorHandler("Please verify your email with the OTP sent.", 403));
    }

    if (supplier.status !== "Approved") {
      return next(new ErrorHandler("Your supplier account is awaiting admin approval.", 403));
    }
  }

  // 4️⃣ Check if account is locked
  if (user.isLocked) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      accountLocked: true,
      message: `Account locked. Try again in ${unlockTime} minute(s).`,
    });
  }

  // 5️⃣ Verify password
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    await user.incrementLoginAttempts();

    const attemptsLeft = Math.max(5 - (user.loginAttempts || 0), 0);
    return res.status(401).json({
      success: false,
      attemptsLeft,
      message: `Invalid email or password. ${attemptsLeft} attempt(s) remaining.`,
    });
  }

  // 6️⃣ Reset login attempts after successful login
  await user.resetLoginAttempts();

  // 7️⃣ Record login details
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection.remoteAddress ||
    req.ip ||
    "Unknown IP";

  const userAgent = req.headers["user-agent"] || "Unknown device";
  const time = new Date().toLocaleString();

  user.loginHistory = [...(user.loginHistory || []), { ip, userAgent, time }].slice(-10);
  await user.save({ validateBeforeSave: false });

  // 8️⃣ Send login alert email
  await sendEmail({
    email: user.email,
    subject: "New Login Detected",
    html: generateLoginAlertEmailTemplate(user.name, ip, userAgent, time),
  });

  // 9️⃣ Generate and send JWT token
  await sendToken(user, 200, "Login successful.", res);
});



/* =========================================================
   ✅ Forgot Password
========================================================= */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found.", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset - MKSTORE",
    html: `<p>Hello ${user.name},</p><p>Click below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.status(200).json({ success: true, message: "Password reset link sent to email." });
});


/* =========================================================
   ✅ Reset Password
========================================================= */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return next(new ErrorHandler("Password reset token is invalid or expired.", 400));

  validatePassword(req.body.password);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Password Change Alert",
    html: generatePasswordChangeEmailTemplate(user.name),
  });

  res.status(200).json({ success: true, message: "Password reset successful." });
});


/* =========================================================
   ✅ Update Password (logged in)
========================================================= */
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new ErrorHandler("User not found.", 404));

  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) return next(new ErrorHandler("Old password is incorrect.", 400));

  validatePassword(req.body.newPassword);
  user.password = req.body.newPassword;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Password Change Alert",
    html: generatePasswordChangeEmailTemplate(user.name),
  });

  res.status(200).json({ success: true, message: "Password updated successfully." });
});

/* =========================================================
   ✅ Logout
========================================================= */
export const logout = catchAsyncErrors(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
});

/* =========================================================
   ✅ Get Current User
========================================================= */
export const getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/* =========================================================
   ✅ Refresh Token
========================================================= */
export const refreshToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return next(new ErrorHandler("Refresh token required.", 401));

  const user = await User.findOne({ refreshToken: token }).select("+refreshToken");
  if (!user) return next(new ErrorHandler("Invalid refresh token.", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.id !== user._id.toString()) {
      return next(new ErrorHandler("Token mismatch.", 401));
    }

    await sendToken(user, 200, "Access token refreshed.", res);
  } catch (err) {
    return next(new ErrorHandler("Refresh token expired or invalid.", 401));
  }
});

/* =========================================================
   ✅ Update Profile (logged in)
========================================================= */
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { name, email } = req.body;
  const updates = {};

  // Basic validation
  if (name && name.trim().length < 2) {
    return next(new ErrorHandler("Name must be at least 2 characters long", 400));
  }

  if (email && !validator.isEmail(email)) {
    return next(new ErrorHandler("Please provide a valid email address", 400));
  }

  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();

  /* -------------------------
     ✅ Handle Avatar Upload
  ------------------------- */
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("Please upload a valid image format", 400));
    }

    // Delete old avatar if exists
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Upload new one
    const uploadRes = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "MKSTORE/avatars",
    });

    updates.avatar = {
      public_id: uploadRes.public_id,
      url: uploadRes.secure_url,
    };
  }

  // Apply updates
  Object.assign(user, updates);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});



