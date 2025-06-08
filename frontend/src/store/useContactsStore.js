import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useContactsStore = create((set, get) => ({
  contacts: [],
  isLoading: false,
  isAdding: false,
  isRemoving: false,

  // Fetch contacts from backend
  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/user/contacts"); // Adjust base URL if needed
      set({ contacts: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to load contacts");
    }
  },

  // Add contact by email
  addContactByEmail: async (email) => {
    if (!email) return toast.error("Email is required");
    set({ isAdding: true });
    try {
      const { data } = await axiosInstance.post("/user/contacts", { email });
      toast.success(data.message);
      await get().fetchContacts(); // Refresh contacts list after add
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add contact");
    } finally {
      set({ isAdding: false });
    }
  },

  // Remove contact by user ID
  removeContact: async (contactUserId) => {
    if (!contactUserId) return toast.error("Invalid contact user ID");
    set({ isRemoving: true });
    try {
      const { data } = await axiosInstance.delete(`/user/contacts/${contactUserId}`);
      toast.success(data.message);
      await get().fetchContacts(); // Refresh contacts list after removal
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove contact");
    } finally {
      set({ isRemoving: false });
    }
  },
}));
