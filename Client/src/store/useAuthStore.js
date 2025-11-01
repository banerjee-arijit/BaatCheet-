// useAuthStore.js - UPDATED connectSocket function
import { create } from "zustand";
import { axiosInstance } from "./../lib/axios";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE == "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: true,
      isSigningUp: false,
      isLoading: false,
      isProfileUpdating: false,
      socket: null,
      onlineUsers: [],

      checkAuth: async () => {
        try {
          set({ isCheckingAuth: true });
          const response = await axiosInstance.get("/auth/check-auth");
          const isAuth = !!response.data.user;
          set({
            user: response.data.user || null,
            isAuthenticated: isAuth,
            isCheckingAuth: false,
          });

          if (isAuth) {
            get().connectSocket();
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            isCheckingAuth: false,
            user: null,
            onlineUsers: [],
          });
          console.error("Error checking authentication:", error);
        }
      },

      signup: async (formData, navigate) => {
        if (!formData.username || !formData.email || !formData.password)
          return toast.error("All fields are required");

        if (formData.password.length < 6)
          return toast.error("Password must be at least 6 characters long");

        if (!/\S+@\S+\.\S+/.test(formData.email))
          return toast.error("Please enter a valid email address");

        try {
          set({ isSigningUp: true });
          const response = await axiosInstance.post("/auth/signup", formData);
          toast.success("Account created successfully! Please log in.");
          set({ isSigningUp: false });
          navigate("/login");
        } catch (error) {
          console.error("Failed to create user:", error);
          toast.error(
            error.response?.data?.message || "Signup failed. Try again."
          );
          set({ isSigningUp: false });
        }
      },

      login: async (formData, navigate) => {
        if (!formData.email || !formData.password)
          return toast.error("All fields are required");

        try {
          set({ isLoading: true });
          const response = await axiosInstance.post("/auth/login", formData);
          set({
            isAuthenticated: true,
            user: response.data.user || null,
            isLoading: false,
            onlineUsers: [],
          });
          toast.success("Logged in successfully");

          setTimeout(() => {
            get().connectSocket();
          }, 100);

          navigate("/");
        } catch (error) {
          console.error("Failed to login:", error);
          toast.error(
            error.response?.data?.message || "Login failed. Try again."
          );
          set({ isLoading: false });
        }
      },

      logout: async (navigate) => {
        try {
          get().disConnectSocket();
          await axiosInstance.post("/auth/logout");
          set({
            isAuthenticated: false,
            user: null,
            socket: null,
            onlineUsers: [],
          });
          toast.success("Logged out successfully");
          navigate("/login");
        } catch (error) {
          console.log("Failed to logout");
          toast.error("Failed to logout. Try again.");
        }
      },

      updateProfile: async (data) => {
        set({ isProfileUpdating: true });
        try {
          const response = await axiosInstance.put(
            "/auth/update-profile",
            data
          );
          set({ user: response.data.user });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Profile update failed:", error);
          toast.error(
            error.response?.data?.message ||
              "Failed to upload profile image. Try again."
          );
        } finally {
          set({ isProfileUpdating: false });
        }
      },

      connectSocket: () => {
        const { user, socket } = get();

        if (!user || !user._id) {
          console.log("❌ Cannot connect socket: No user logged in");
          return;
        }

        if (socket?.connected) {
          console.log("✅ Socket already connected");
          return;
        }

        console.log("🔌 Connecting socket for user:", user._id);

        const newSocket = io(BASE_URL, {
          query: { userId: user._id },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
          console.log("✅ Socket connected successfully:", newSocket.id);
        });

        newSocket.on("onlineUsers", (userIds) => {
          console.log("📡 Online users updated:", userIds);
          set({ onlineUsers: userIds });
        });

        // ✅ REMOVED newMessage listener from here - it should be in ChatPage only

        newSocket.on("disconnect", () => {
          console.log("❌ Socket disconnected");
        });

        newSocket.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
        });

        set({ socket: newSocket });
      },

      disConnectSocket: () => {
        const { socket } = get();
        if (socket) {
          console.log("🔌 Disconnecting socket...");
          socket.disconnect();
          socket.removeAllListeners();
          set({ socket: null, onlineUsers: [] });
        }
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
