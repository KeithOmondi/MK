// controllers/authController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendMail.js";

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

/* -------------------------
   Register
------------------------- */
const register = catchAsyncErrors(async (req, res, next) => {
  let { name, email, password } = req.body;
  if (!name || !email || !password)
    return next(new ErrorHandler(400, "All fields are required."));

  email = email.toLowerCase().trim();
  if (!validator.isEmail(email)) return next(new ErrorHandler(400, "Invalid email address."));
  validatePassword(password);

  const existingUser = await User.findOne({ email, accountVerified: true });
  if (existingUser) return next(new ErrorHandler(400, "User already exists."));

  await User.deleteMany({ email, accountVerified: false });

  const newUser = new User({ name, email, password });
  const code = newUser.generateVerificationCode();
  await newUser.save();

  await sendVerificationCode(email, code);

  res.status(201).json({ success: true, message: "User registered. Verification code sent to email." });
});

/* -------------------------
   Verify OTP
------------------------- */
const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new ErrorHandler(400, "Email and OTP are required."));

  const user = await User.findOne({ email: email.toLowerCase().trim(), accountVerified: false });
  if (!user) return next(new ErrorHandler(404, "No unverified user found."));

  if (user.verificationAttempts >= 5)
    return next(new ErrorHandler(429, "Maximum verification attempts reached. Request a new OTP."));

  if (!user.verificationCode || Date.now() > user.verificationCodeExpiry)
    return next(new ErrorHandler(400, "OTP expired. Please request a new one."));

  if (String(user.verificationCode) !== String(otp)) {
    user.verificationAttempts += 1;
    user.lastOtpSentAt = new Date();
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(400, "Invalid OTP."));
  }

  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  user.verificationAttempts = 0;
  user.lastOtpSentAt = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "OTP verified successfully. Please log in." });
});

/* -------------------------
   Resend OTP
------------------------- */
const resendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler(400, "Email is required."));

  const user = await User.findOne({ email: email.toLowerCase().trim(), accountVerified: false });
  if (!user) return next(new ErrorHandler(404, "No unverified user found."));

  const cooldown = 60 * 1000;
  if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < cooldown)
    return next(new ErrorHandler(429, "Please wait 1 minute before requesting another OTP."));

  if (user.verificationAttempts >= 5)
    return next(new ErrorHandler(429, "Maximum verification attempts reached. Contact support."));

  const code = user.generateVerificationCode();
  user.lastOtpSentAt = new Date();
  await user.save({ validateBeforeSave: false });

  await sendVerificationCode(email, code);

  res.status(200).json({ success: true, message: "New OTP sent to your email." });
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

  if (user.isLocked) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      accountLocked: true,
      message: `Account locked. Try again in ${unlockTime} minute(s).`,
    });
  }

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

  // ---- FORCE PASSWORD CHANGE FLOW ----
  if (user.forcePasswordChange) {
    const token = user.generateForcePasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/force-change-password?token=${token}`;
    await sendEmail({
      email: user.email,
      subject: "Password Change Required",
      message: `Click here: ${url}`,
    });

    return res.status(200).json({
      success: true,
      requiresPasswordChange: true,
      message: "Please check your email to set a new password.",
    });
  }

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

/* -------------------------
   Forgot Password
------------------------- */
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email) return next(new ErrorHandler(400, "Email is required."));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler(404, "User not found."));
  if (!user.accountVerified) return next(new ErrorHandler(403, "Account not verified."));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `You requested a password reset.\n\nClick the link:\n${resetUrl}`;

  try {
    await sendEmail({ email: user.email, subject: "Password Reset Request", message });
    res.status(200).json({ success: true, message: `Email sent to ${user.email}` });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(500, "Email could not be sent."));
  }
});

/* -------------------------
   Reset Password
------------------------- */
const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) return next(new ErrorHandler(400, "Passwords do not match."));
  validatePassword(password);

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorHandler(400, "Invalid or expired token."));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.forcePasswordChange = false;
  await user.save();

  sendToken(user, 200, "Password reset successful.", res);
});

/* -------------------------
   Update Password (logged in)
------------------------- */
const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword)
    return next(new ErrorHandler(400, "All password fields are required."));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return next(new ErrorHandler(401, "Current password incorrect."));
  if (newPassword !== confirmNewPassword) return next(new ErrorHandler(400, "Passwords do not match."));
  validatePassword(newPassword);

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, "Password updated successfully.", res);
});

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
  register,
  verifyOTP,
  resendOTP,
  login,
  forceChangePassword,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  getUser,
  refreshToken,
};
