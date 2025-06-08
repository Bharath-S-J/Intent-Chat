import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5010" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  contacts: [],          // <-- Add contacts state
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      await get().fetchContacts();    // Fetch contacts after auth
      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  fetchContacts: async () => {
    try {
      const res = await axiosInstance.get("user/contacts"); // Adjust endpoint as needed
      set({ contacts: res.data });
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      };
      if (data.inviteFrom) payload.inviteFrom = data.inviteFrom;

      const res = await axiosInstance.post("/auth/signup", payload);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      await get().fetchContacts();    // Fetch contacts after signup
      get().connectSocket();
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      await get().fetchContacts();    // Fetch contacts after login
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, contacts: [], onlineUsers: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error("Logout error:", error);
      const message = error.response?.data?.message || "Logout failed. Please try again.";
      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      const message = error.response?.data?.message || "Profile update failed.";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket, contacts } = get();
    if (!authUser || (socket && socket.connected)) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.connect();

    newSocket.on("getOnlineUsers", (userIds) => {
      // Filter online user IDs by contacts' IDs
      const contactIds = contacts.map((c) => (typeof c === "string" ? c : c._id));
      const onlineContacts = userIds.filter((id) => contactIds.includes(id));
      set({ onlineUsers: onlineContacts });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
