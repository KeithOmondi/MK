import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import Address from "../models/addressModel.js";

/**
 * @desc   Get all addresses of logged-in user
 * @route  GET /api/addresses
 * @access Private
 */
export const getAddresses = catchAsyncErrors(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: addresses.length,
    data: addresses,
  });
});

/**
 * @desc   Add new address
 * @route  POST /api/addresses
 * @access Private
 */
export const addAddress = catchAsyncErrors(async (req, res) => {
  const { street, city, state, postalCode, country } = req.body;

  if (!street || !city || !state || !postalCode || !country) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  const address = await Address.create({
    user: req.user._id,
    street,
    city,
    state,
    postalCode,
    country,
  });

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: address,
  });
});

/**
 * @desc   Update address
 * @route  PUT /api/addresses/:id
 * @access Private
 */
export const updateAddress = catchAsyncErrors(async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found or you are not authorized",
    });
  }

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: address,
  });
});

/**
 * @desc   Delete address
 * @route  DELETE /api/addresses/:id
 * @access Private
 */
export const deleteAddress = catchAsyncErrors(async (req, res) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: "Address not found or you are not authorized",
    });
  }

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});
