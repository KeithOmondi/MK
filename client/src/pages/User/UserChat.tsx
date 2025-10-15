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
import { BACKEND_URL } from "../../config";
import { Paperclip, Smile, Send, ArrowLeft } from "lucide-react";

let socket: Socket;

const UserChat: React.FC = () => {
  const { orderId, supplierId } = useParams<{ orderId: string; supplierId: string }>();
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

    socket = io(BACKEND_URL, { withCredentials: true });
    socket.emit("registerUser", currentUser._id);

    socket.on("newMessage", (msg) => {
      dispatch(addIncomingMessage(msg));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, dispatch]);

  // --------------------------
  // Load messages & mark as read
  // --------------------------
  useEffect(() => {
    if (orderId && supplierId) {
      dispatch(getMessages({ userId: supplierId, orderId }));
      dispatch(markAsRead({ senderId: supplierId, orderId }));
    }
  }, [orderId, supplierId, dispatch]);

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
    if (!newMessage.trim() || !orderId || !supplierId) return;

    try {
      const result = await dispatch(
        sendMessage({ receiverId: supplierId, orderId, message: newMessage })
      ).unwrap();

      if (socket) socket.emit("sendMessage", result);

      setNewMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="w-full h-[90vh] max-w-4xl mx-auto bg-[#e5ddd5] rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-300 mt-6">
      {/* Header */}
      <div className="bg-[#075E54] text-white flex items-center p-3">
        <button
          onClick={() => window.history.back()}
          className="mr-3 text-white hover:text-gray-200"
        >
          <ArrowLeft size={22} />
        </button>
        <img
          src="/default-avatar.png"
          alt="Supplier Avatar"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div>
          <h2 className="font-semibold">Supplier Chat</h2>
          <p className="text-xs text-gray-200">Online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('/chat-bg.png')] bg-cover bg-center">
        {loading && <p className="text-gray-600 text-center mt-4">Loading messages...</p>}

        {messages.map((msg) => {
          const isMine = msg.sender !== supplierId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg shadow-md ${
                  isMine
                    ? "bg-[#DCF8C6] text-gray-900"
                    : "bg-white text-gray-900"
                }`}
              >
                {msg.message}
                {msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="media"
                    className="mt-2 max-h-48 rounded-lg"
                  />
                )}
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#f0f0f0] flex items-center gap-3">
        <button className="text-gray-600 hover:text-gray-800">
          <Smile size={22} />
        </button>

        <button className="text-gray-600 hover:text-gray-800">
          <Paperclip size={22} />
        </button>

        <input
          type="text"
          className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="bg-[#075E54] text-white p-2 rounded-full hover:bg-[#0b7d70]"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default UserChat;
