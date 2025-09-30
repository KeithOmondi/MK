// controllers/authController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import validator from "validator";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendMail.js";
import crypto from "crypto";

/**
 * REGISTER
 */
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler(400, "Please provide all required fields."));
  }

  if (!validator.isEmail(email)) {
    return next(new ErrorHandler(400, "Invalid email address."));
  }

  if (password.length < 8 || password.length > 20) {
    return next(
      new ErrorHandler(400, "Password must be between 8 and 20 characters.")
    );
  }

  const existingUser = await User.findOne({ email, accountVerified: true });
  if (existingUser) return next(new ErrorHandler(400, "User already exists."));

  // cleanup unverified accounts for the same email
  await User.deleteMany({ email, accountVerified: false });

  const newUser = new User({
    name,
    email,
    password, // raw password -> will be hashed in model pre-save hook
    verificationAttempts: 1,
    lastAttemptAt: new Date(),
  });

  const code = newUser.generateVerificationCode();
  await newUser.save();

  await sendVerificationCode(email, code);

  res.status(201).json({
    success: true,
    message: "User registered. Verification code sent to email.",
  });
});

/**
 * VERIFY OTP
 */
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler(400, "Email and OTP are required."));
  }

  const user = await User.findOne({ email, accountVerified: false });
  if (!user) return next(new ErrorHandler(404, "No unverified user found."));

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler(400, "Invalid OTP."));
  }

  if (Date.now() > new Date(user.verificationCodeExpiry).getTime()) {
    return next(new ErrorHandler(400, "OTP expired. Please request a new one."));
  }

  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  user.verificationAttempts = 0;
  user.lastAttemptAt = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully. Please log in.",
  });
});

/**
 * LOGIN
 */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler(400, "Please provide both email and password."));

  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil +forcePasswordChange"
  );
  if (!user) return next(new ErrorHandler(401, "Invalid email or password."));

  if (user.isLocked) {
    const unlockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(new ErrorHandler(423, `Account locked. Try again in ${unlockTime} min(s).`));
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    await user.incrementLoginAttempts();
    return next(new ErrorHandler(401, "Invalid email or password."));
  }

  await user.resetLoginAttempts();

  if (user.forcePasswordChange) {
    return res.status(200).json({
      success: true,
      requiresPasswordChange: true,
      message: "Please change your temporary password.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  }

  sendToken(user, 200, "Login successful", res);
});

/**
 * LOGOUT
 */
export const logout = catchAsyncErrors(async (req, res) => {
  res.clearCookie("token").status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

/**
 * CURRENT USER
 */
export const getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email?.toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found.", 404));
  if (!user.accountVerified) return next(new ErrorHandler("Account not verified.", 403));

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
    return next(new ErrorHandler("Email could not be sent.", 500));
  }
});

/**
 * RESET PASSWORD
 */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match."));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorHandler(400, "Invalid or expired token."));

  user.password = password; // raw -> model will hash
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Password reset successful.", res);
});

/**
 * UPDATE PASSWORD (logged in)
 */
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword)
    return next(new ErrorHandler(400, "Please provide all password fields."));

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return next(new ErrorHandler(401, "Current password incorrect."));

  if (newPassword !== confirmNewPassword)
    return next(new ErrorHandler(400, "New passwords do not match."));

  user.password = newPassword; // raw -> model will hash
  await user.save();

  sendToken(user, 200, "Password updated successfully.", res);
});

/**
 * CHANGE PASSWORD (force change e.g. Supplier)
 */
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password +forcePasswordChange");
  if (!user) return next(new ErrorHandler(404, "User not found."));

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return next(new ErrorHandler(401, "Current password incorrect."));

  user.password = newPassword; // raw -> model will hash
  user.forcePasswordChange = false;
  await user.save();

  sendToken(user, 200, "Password changed successfully.", res);
});
