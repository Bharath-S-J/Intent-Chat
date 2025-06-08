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
      const message = error.response?.data?.message || "Failed to fetch messages.";
      toast.error(message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

sendMessage: async (formData) => {
  const { selectedUser, messages } = get();
  if (!selectedUser) {
    toast.error("No user selected.");
    return;
  }

  try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    set({ messages: [...messages, res.data] });
  } catch (error) {
    const message = error.response?.data?.message || "Failed to send message.";
    toast.error(message);
  }
},


  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser || !socket || !socket.connected) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

      if (isMessageSentFromSelectedUser) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
