import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";

/**
 * ==========================
 * Authentication Middleware
 * ==========================
 * Validates the accessToken sent via Authorization header (Bearer).
 * If valid, attaches the user to req.user.
 */
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Prefer Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Optional: you could also check cookies if needed
  // token ||= req.cookies?.accessToken;

  if (!token) {
    return next(new ErrorHandler(401, "Access token missing. Please log in."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB and include role
    const user = await User.findById(decoded.id).select("+role");
    if (!user) {
      return next(new ErrorHandler(401, "User no longer exists."));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorHandler(401, "Invalid or expired access token."));
  }
});

/**
 * ==========================
 * Authorization Middleware
 * ==========================
 * Ensures the authenticated user has one of the allowed roles.
 */
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler(401, "Not authenticated."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          403,
          `Role '${req.user.role}' is not allowed to access this resource.`
        )
      );
    }

    next();
  };
};
