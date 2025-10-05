// src/pages/SupplierChat.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import {
  getMessages,
  sendMessage,
  markAsRead,
  addIncomingMessage,
  selectChatMessages,
  selectChatLoading,
} from "../../redux/slices/chatSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { BACKEND_URL } from "../../config"; // import from config.ts

let socket: Socket;

const SupplierChat: React.FC = () => {
  const { orderId, buyerId } = useParams<{ orderId: string; buyerId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(selectChatMessages);
  const loading = useSelector(selectChatLoading);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // --------------------------
  // Initialize Socket.IO
  // --------------------------
  useEffect(() => {
    if (!currentUser) return;

    console.log("Connecting to socket...");
    socket = io(BACKEND_URL, { withCredentials: true });

    // Register current user
    socket.emit("registerUser", currentUser._id);
    console.log("Registered socket user:", currentUser._id);

    // Listen for incoming messages
    socket.on("newMessage", (msg) => {
      console.log("Received message via socket:", msg);
      dispatch(addIncomingMessage(msg));
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [currentUser, dispatch]);

  // --------------------------
  // Load messages & mark as read
  // --------------------------
  useEffect(() => {
    if (orderId && buyerId) {
      console.log("Fetching messages...");
      dispatch(getMessages({ userId: buyerId, orderId }));
      dispatch(markAsRead({ senderId: buyerId, orderId }));
    }
  }, [orderId, buyerId, dispatch]);

  // --------------------------
  // Auto-scroll to latest
  // --------------------------
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --------------------------
  // Send message
  // --------------------------
  const handleSend = async () => {
    if (!newMessage.trim() || !orderId || !buyerId) return;

    console.log("Sending message:", newMessage);
    try {
      const result = await dispatch(
        sendMessage({ receiverId: buyerId, orderId, message: newMessage })
      ).unwrap();

      console.log("Message sent successfully:", result);

      // Emit via socket to receiver
      if (socket) {
        socket.emit("sendMessage", result); // optional if your backend expects this
      }

      setNewMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[80vh] bg-gray-50 border border-green-200 rounded-2xl mt-10">
      <div className="bg-green-600 text-white p-4 rounded-t-2xl font-bold text-xl">
        Chat with Buyer
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && <p className="text-gray-500">Loading messages...</p>}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === buyerId ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`p-3 rounded-xl max-w-xs break-words ${
                msg.sender === buyerId ? "bg-green-100 text-green-900" : "bg-green-600 text-white"
              }`}
            >
              {msg.message}
              {msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="media" className="mt-2 max-h-48 rounded-lg" />
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="p-4 flex gap-2 border-t border-green-200">
        <input
          type="text"
          className="flex-1 p-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition cursor-pointer"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SupplierChat;
