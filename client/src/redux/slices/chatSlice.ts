// src/redux/slices/chatSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../store";
import api from "../../api/axios";

// ==========================
// Types
// ==========================
export type ChatType = "text" | "image" | "audio";

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  type: ChatType;
  message?: string;
  mediaUrl?: string;
  order: string;
  read: boolean;
  createdAt: string;
}

export interface ChatPreview {
  _id: string; // the other user’s ID
  latestMessage: ChatMessage;
}

interface ChatState {
  messages: ChatMessage[];
  chatList: ChatPreview[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  chatList: [],
  loading: false,
  error: null,
};

// ==========================
// Async Thunks
// ==========================

// Send message
export const sendMessage = createAsyncThunk<
  ChatMessage,
  { receiverId: string; orderId: string; message?: string; type?: string; file?: File },
  { rejectValue: string; dispatch: AppDispatch }
>("chat/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    // Ensure type is valid
    const messageType: ChatType =
      payload.type === "image" ? "image" : payload.type === "audio" ? "audio" : "text";

    const formData = new FormData();
    formData.append("receiverId", payload.receiverId);
    formData.append("orderId", payload.orderId);
    formData.append("type", messageType);
    if (payload.message) formData.append("message", payload.message);
    if (payload.file) formData.append("file", payload.file);

    const { data } = await api.post("/chat/send", formData, { withCredentials: true });

    return data.data as ChatMessage;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Get messages
export const getMessages = createAsyncThunk<
  ChatMessage[],
  { userId: string; orderId: string; page?: number; limit?: number },
  { rejectValue: string }
>("chat/getMessages", async ({ userId, orderId, page = 1, limit = 20 }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/chat/get/${userId}/${orderId}?page=${page}&limit=${limit}`, {
      withCredentials: true,
    });
    return data.messages as ChatMessage[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Get chat list
export const getChatList = createAsyncThunk<
  ChatPreview[],
  void,
  { rejectValue: string }
>("chat/getChatList", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/list", { withCredentials: true });
    return data.chats as ChatPreview[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Mark messages as read
export const markAsRead = createAsyncThunk<
  any,
  { senderId: string; orderId: string },
  { rejectValue: string }
>("chat/markAsRead", async ({ senderId, orderId }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/chat/mark-as-read/${senderId}/${orderId}`, {}, { withCredentials: true });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ==========================
// Slice
// ==========================
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChatState: () => initialState,
    addIncomingMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })

      // Get messages
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get chat list
      .addCase(getChatList.fulfilled, (state, action) => {
        state.chatList = action.payload;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state) => {
        // optionally update local messages as read
      });
  },
});

export const { resetChatState, addIncomingMessage } = chatSlice.actions;
export default chatSlice.reducer;

// ==========================
// Selectors
// ==========================
export const selectChatMessages = (state: RootState) => state.chat.messages;
export const selectChatList = (state: RootState) => state.chat.chatList;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
