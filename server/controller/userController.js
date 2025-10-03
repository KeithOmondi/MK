import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

// ==========================
// Get All Verified Users
// ==========================
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ accountVerified: true }).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: users,
  });
});

// ==========================
// Get Single User by ID
// ==========================
export const getUserById = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ==========================
// Update User
// ==========================
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Update avatar if provided
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("Please upload a valid image format", 400));
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "MKSTORE",
    });

    user.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // Update basic fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// ==========================
// Delete User
// ==========================
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Delete avatar from Cloudinary if exists
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// ==========================
// Register New Admin
// ==========================
export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.avatar) {
    return next(new ErrorHandler("Please upload an image", 400));
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please provide all fields", 400));
  }

  const isRegistered = await User.findOne({ email, role: "Admin", accountVerified: true });
  if (isRegistered) return next(new ErrorHandler("Admin already registered", 400));

  if (password.length < 8 || password.length > 20) {
    return next(new ErrorHandler("Password must be between 8 and 20 characters", 400));
  }

  const { avatar } = req.files;
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(new ErrorHandler("Please upload a valid image format", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "MKSTORE",
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    role: "Admin",
    accountVerified: true,
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    data: admin,
  });
});
