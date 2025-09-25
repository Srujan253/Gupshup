import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// ✅ Define WebSocket base URL correctly for dev/prod
const SOCKET_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : "https://gupshup-rbcp.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
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
      get().connectSocket();
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to create account");
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
      get().connectSocket();
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket: currentSocket } = get();

    if (!authUser || currentSocket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true, // ✅ Important for cookies
      transports: ["websocket"], // ✅ Forces WebSocket transport
      query: { userId: authUser._id },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIDs) => {
      set({ onlineUsers: userIDs });
    });

    // Add more events here as needed...

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket: currentSocket } = get();
    if (currentSocket?.connected) {
      currentSocket.disconnect();
      set({ socket: null });
    }
  },
}));
