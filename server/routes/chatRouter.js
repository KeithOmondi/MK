import express from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
  getChatList,
} from "../controller/chatController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js"; // multer

const router = express.Router();

router.post("/send", isAuthenticated, upload.single("media"), sendMessage); // single media upload
router.get("/:userId", isAuthenticated, getMessages);
router.put("/read/:senderId", isAuthenticated, markAsRead);
router.get("/list", isAuthenticated, getChatList);

export default router;
