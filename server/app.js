/* =========================================================
   ✅ Main Express App
========================================================= */

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// ✅ DB & Middleware Imports
import { connectDB } from "./db/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import {
  globalLimiter,
  limiter,
  loginLimiter,
} from "./middlewares/rateLimiter.js";
import { sanitizeMiddleware } from "./middlewares/sanitize.js";

// ✅ Routes
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import supplierRouter from "./routes/supplierRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js";
import chatRouter from "./routes/chatRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import recentlyViewedRouter from "./routes/recentlyViewedRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import adminRouter from "./routes/adminRouter.js";
import addressRouter from "./routes/addressRouter.js";
import offersRouter from "./routes/offersRouter.js";
import reportRouter from "./routes/reportRouter.js";
import disputeRouter from "./routes/disputeRouter.js";
import couponRouter from "./routes/couponRouter.js";
import walletRouter from "./routes/walletRouter.js";

dotenv.config({ path: "./config/.env" });

/* =========================================================
   ✅ Express App Setup
========================================================= */
const app = express();

// ✅ Apply Global Rate Limiter
app.use(globalLimiter);

// ✅ Core Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Static File Serving (for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   🚫 Removed express-fileupload (conflicts with multer)
========================================================= */
// ❌ app.use(fileUpload(...)) — removed to prevent "Unexpected end of form"

/* =========================================================
   🪵 Request Debug Logger
========================================================= */
app.use((req, res, next) => {
  console.log("📥 Incoming request:", req.method, req.originalUrl);
  next();
});

/* =========================================================
   🧼 Sanitize Middleware
========================================================= */
sanitizeMiddleware(app);

/* =========================================================
   ✅ API Routes
========================================================= */
app.use("/api/v1/auth", authRouter, limiter, loginLimiter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/suppliers", supplierRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/chat", chatRouter, limiter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/recently-viewed", recentlyViewedRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/offers", offersRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/disputes", disputeRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/wallet", walletRouter);

/* =========================================================
   ⚠️ Global Error Handler
========================================================= */
app.use(errorMiddleware);

/* =========================================================
   🔗 Database Connection
========================================================= */
connectDB();

/* =========================================================
   🚀 Export App
========================================================= */
export default app;
