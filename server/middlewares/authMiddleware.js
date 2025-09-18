import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";

// ✅ Authentication middleware
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler(401, "Please log in to access this resource."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Include role in query if needed for extra validation
    req.user = await User.findById(decoded.id).select("+role");

    if (!req.user) {
      return next(new ErrorHandler(401, "User no longer exists."));
    }

    next();
  } catch (err) {
    return next(new ErrorHandler(401, "Invalid or expired token."));
  }
});

// ✅ Authorization middleware (role-based)
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

    next(); // user is authorized
  };
};
