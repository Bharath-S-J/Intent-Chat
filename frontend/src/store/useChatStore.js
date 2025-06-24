import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  lastReceivedMessageText: "",
  smartReplies: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/user/contacts");
      set({ users: res.data });
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch users.";
      toast.error(message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch messages.";
      toast.error(message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  generateSmartReplies: async (message) => {
    try {
      const res = await axiosInstance.post("/ai/smart-reply", { message });
      const replies = res.data.replies || [];
      set({ smartReplies: replies });
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
      set({ smartReplies: [] });
    }
  },

  sendMessage: async (formData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Optimistic update with temporary "Detecting..." tone
      set({
        messages: [...messages, res.data],
        smartReplies: [],
        lastReceivedMessageText: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send message.";
      toast.error(message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const authUserId = useAuthStore.getState().user?._id;
    const { selectedUser } = get();

    if (!socket || !socket.connected) return;

    // 1. Handle incoming messages (both sent and received)
    socket.on("newMessage", (newMessage) => {
      let shouldGenerateSmartReplies = false;

      set((state) => {
        const exists = state.messages.some((msg) => msg._id === newMessage._id);
        if (exists) return state;

        const shouldAdd =
          newMessage.senderId === selectedUser?._id ||
          newMessage.receiverId === authUserId;

        const isIncoming = newMessage.senderId === selectedUser?._id;

        if (shouldAdd && isIncoming && newMessage.text) {
          shouldGenerateSmartReplies = true;
        }

        return shouldAdd
          ? {
              messages: [...state.messages, newMessage],
              lastReceivedMessageText: isIncoming
                ? newMessage.text
                : state.lastReceivedMessageText,
            }
          : state;
      });

      if (shouldGenerateSmartReplies) {
        get().generateSmartReplies(newMessage.text);
      }
    });

    // 2. Handle tone updates for existing messages
    socket.on("updateMessageTone", ({ messageId, tone }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, tone } : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("updateMessageTone");
    }
  },

  setSelectedUser: (user) => {
    set({
      selectedUser: user,
      smartReplies: [],
      lastReceivedMessageText: "", 
    });
  },
}));
