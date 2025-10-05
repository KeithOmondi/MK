import React, { useEffect, useState, useRef, type ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  getMessages,
  sendMessage,
  markAsRead,
  addIncomingMessage,
  selectChatMessages,
  selectChatLoading,
} from "../../../redux/slices/chatSlice";
import type { AppDispatch } from "../../../redux/store";
import { FiPaperclip, FiSend } from "react-icons/fi";

interface ChatLayoutProps {
  chatWithId: string;
  chatWithName: string;
  orderId: string;
}

let socket: Socket;

const ChatLayout: React.FC<ChatLayoutProps> = ({ chatWithId, chatWithName, orderId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(selectChatMessages);
  const loading = useSelector(selectChatLoading);

  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Socket.IO
  useEffect(() => {
    socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:8000", {
      withCredentials: true,
    });

    socket.emit("registerUser", chatWithId);

    socket.on("newMessage", (msg) => {
      dispatch(addIncomingMessage(msg));
    });

    return () => {
      socket.disconnect();
    };
  }, [chatWithId, dispatch]);

  // Fetch messages
  useEffect(() => {
    if (orderId && chatWithId) {
      dispatch(getMessages({ userId: chatWithId, orderId }));
      dispatch(markAsRead({ senderId: chatWithId, orderId }));
    }
  }, [orderId, chatWithId, dispatch]);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSend = async (type: "text" | "image" | "audio" = "text") => {
    if (!orderId || !chatWithId) return;

    if (type === "text" && !newMessage.trim()) return;

    await dispatch(
      sendMessage({
        receiverId: chatWithId,
        orderId,
        message: type === "text" ? newMessage : undefined,
        type,
        file: file || undefined,
      })
    );

    setNewMessage("");
    setFile(null);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[80vh] bg-gray-50 border border-green-200 rounded-2xl mt-10 shadow-lg">
      <div className="bg-green-600 text-white p-4 rounded-t-2xl font-bold text-xl">
        Chat with {chatWithName}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && <p className="text-gray-500">Loading messages...</p>}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender === chatWithId ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-xs break-words ${
                msg.sender === chatWithId
                  ? "bg-green-100 text-green-900"
                  : "bg-green-600 text-white"
              }`}
            >
              {msg.message}
              {msg.mediaUrl && (
                msg.type === "audio" ? (
                  <audio controls className="mt-2 w-full">
                    <source src={msg.mediaUrl} />
                  </audio>
                ) : (
                  <img
                    src={msg.mediaUrl}
                    alt="media"
                    className="mt-2 max-h-48 rounded-lg"
                  />
                )
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <div className="p-4 flex gap-2 border-t border-green-200 items-center">
        <input
          type="text"
          className="flex-1 p-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend("text")}
        />
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileChange} />
          <FiPaperclip className="text-green-600 w-6 h-6 hover:text-green-700" />
        </label>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          onClick={() => handleSend(file ? (file.type.startsWith("audio") ? "audio" : "image") : "text")}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatLayout;
