import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";

// ==========================
// Cloudinary configuration
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// ==========================
// Server setup
// ==========================
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// ==========================
// Socket.IO setup
// ==========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io and onlineUsers map to app for controller access
app.set("io", io);
const onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);

// ==========================
// Socket.IO connection
// ==========================
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Register a user to track online status
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`User registered: ${userId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ==========================
// Start server
// ==========================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
