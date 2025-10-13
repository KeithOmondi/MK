import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// DB & Middleware
import { connectDB } from "./db/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import {
  globalLimiter,
  limiter,
  loginLimiter,
} from "./middlewares/rateLimiter.js";
import { sanitizeMiddleware } from "./middlewares/sanitize.js";

// Routes
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
import reportRouter from "./routes/reportRouter.js"
import disputeRouter from "./routes/disputeRouter.js"
import couponRouter from "./routes/couponRouter.js"
import walletRouter from "./routes/walletRouter.js"
import fileUpload from "express-fileupload";

dotenv.config({ path: "./config/.env" });

const app = express();
// Apply to all routes
app.use(globalLimiter);

// ✅ Security & middlewares
app.use(helmet());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ✅ Debug logger
app.use((req, res, next) => {
  console.log("📥 Incoming request:", req.originalUrl, req.body);
  next();
});

// ✅ Apply sanitizer globally
sanitizeMiddleware(app);  



// ✅ Routes
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

// ✅ Global error handler
app.use(errorMiddleware);

// ✅ DB connection
connectDB();

// Export only the app
export default app;
