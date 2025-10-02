// controllers/authController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
//import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateLoginAlertEmailTemplate, generatePasswordChangeEmailTemplate } from "../utils/emailTemplates.js";
import bcrypt from "bcryptjs";

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

  // ✅ No manual bcrypt.hash here — model pre-save hook will hash automatically
  const user = await User.create({
    name,
    email,
    password, // will be hashed by pre-save
    avatar: avatarData,
    accountVerified: false,
    verificationCode: otp,
    verificationCodeExpiry: Date.now() + 15 * 60 * 1000, // 15 min expiry
  });

  // ✅ Send OTP via email
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
    subject: "Resend OTP - Library System",
    html: `<p>Hello ${user.name},</p>
           <p>Your new OTP is <b>${otp}</b>. It will expire in 15 minutes.</p>`,
  });

  res.status(200).json({
    success: true,
    message: "OTP resent successfully.",
  });
});

/* -------------------------
   Login
------------------------- */
const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler(400, "Email and password are required."));

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +loginAttempts +lockUntil +forcePasswordChange +forcePasswordToken +forcePasswordTokenExpiry +refreshToken"
  );
  if (!user) return next(new ErrorHandler(401, "Invalid email or password."));

  // Check lock status
  if (user.isLocked) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      accountLocked: true,
      message: `Account locked. Try again in ${unlockTime} minute(s).`,
    });
  }

  // Check password
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

  // Reset login attempts if valid
  await user.resetLoginAttempts();

  // ---- FORCE PASSWORD CHANGE FLOW ----
  if (user.forcePasswordChange) {
    const token = user.generateForcePasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/force-change-password?token=${token}`;
    await sendEmail({
      email: user.email,
      subject: "Password Change Required",
      message: `Click here to reset your password: ${url}`,
    });

    return res.status(200).json({
      success: true,
      requiresPasswordChange: true,
      message: "Please check your email to set a new password.",
    });
  }

  // ----------- NEW LOGIN ALERT + HISTORY -----------
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.ip ||
    "Unknown IP";
  const userAgent = req.headers["user-agent"] || "Unknown device";
  const time = new Date().toLocaleString();

  // Save login history (append, keep last 10 for example)
  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({ ip, userAgent, time });
  if (user.loginHistory.length > 10) {
    user.loginHistory = user.loginHistory.slice(-10); // keep last 10
  }
  await user.save({ validateBeforeSave: false });

  // Send login alert email
  const html = generateLoginAlertEmailTemplate(user.name, ip, userAgent, time);
  await sendEmail({
    email: user.email,
    subject: "New Login Detected",
    html,
  });

  // ----------- SEND TOKENS -----------
  await sendToken(user, 200, "Login successful.", res);
});


/* -------------------------
   Force Password Change
------------------------- */
const forceChangePassword = catchAsyncErrors(async (req, res, next) => {
  const { token, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) return next(new ErrorHandler(400, "Passwords do not match."));
  validatePassword(newPassword);

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    forcePasswordToken: hashedToken,
    forcePasswordTokenExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorHandler(400, "Invalid or expired token."));

  user.password = newPassword;
  user.forcePasswordChange = false;
  user.forcePasswordToken = undefined;
  user.forcePasswordTokenExpiry = undefined;
  await user.save();

  sendToken(user, 200, "Password changed successfully.", res);
});

/* =========================================================
   ✅ Forgot Password
========================================================= */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 404));

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  // Construct reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Password Reset - Library System",
    html: `<p>Hello ${user.name},</p>
           <p>You requested a password reset. Click the link below to reset:</p>
           <a href="${resetUrl}">${resetUrl}</a>
           <p>If you didn’t request this, please ignore.</p>`,
  });

  res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
  });
});


/* =========================================================
   ✅ Reset Password
========================================================= */

export const resetPassword = async (req, res, next) => {
  try {
    // 1. Get token from URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // 2. Find user by token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorHandler("Password reset token is invalid or has expired", 400));
    }

    // 3. Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // ✅ 4. Send password change alert
    const html = generatePasswordChangeEmailTemplate(user.name);
    await sendEmail({
      email: user.email,
      subject: "Password Change Alert",
      html,
    });

    // 5. Respond success
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. A security alert email has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------
   Update Password (logged in)
------------------------- */
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();

    // ✅ Send notification email
    const html = generatePasswordChangeEmailTemplate(user.name);
    await sendEmail({
      email: user.email,
      subject: "Password Change Alert",
      html,
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully. A security alert email has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------
   Logout
------------------------- */
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

/* -------------------------
   Get Current User
------------------------- */
const getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/* -------------------------
   Refresh Token
------------------------- */
const refreshToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "Refresh token required." });
  }

  const user = await User.findOne({ refreshToken: token }).select(
    "+password +refreshToken +forcePasswordChange"
  );
  if (!user) return res.status(401).json({ success: false, message: "Invalid refresh token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.id !== user._id.toString()) {
      return res.status(401).json({ success: false, message: "Token mismatch." });
    }

    if (user.forcePasswordChange) {
      return res.status(403).json({
        success: false,
        requiresPasswordChange: true,
        message: "User must change password first.",
      });
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
  forceChangePassword,
  logout,
  getUser,
  refreshToken,
};
