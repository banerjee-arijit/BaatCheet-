import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      selectedUser: null,
      messages: [],
      isUserLoading: false,
      isMessageLoading: false,

      getUsers: async () => {
        try {
          set({ isUserLoading: true });
          const res = await axiosInstance.get("/messages/user");
          set({ users: res.data.users, isUserLoading: false });
        } catch (err) {
          console.error("Error fetching users:", err);
          toast.error("Failed to load users");
          set({ isUserLoading: false });
        }
      },

      setSelectedUser: (user) => set({ selectedUser: user }),

      getMessages: async (userId) => {
        try {
          set({ isMessageLoading: true });
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data.messages, isMessageLoading: false });
        } catch (err) {
          console.error("Error fetching messages:", err);
          toast.error("Failed to load messages");
          set({ isMessageLoading: false });
        }
      },

      sendMessage: async (receiverId, messageData) => {
        try {
          const res = await axiosInstance.post(
            `/messages/send-messages/${receiverId}`,
            messageData
          );

          const newMessage = res.data.message;

          set((state) => ({
            messages: [...state.messages, newMessage],
          }));

          return newMessage;
        } catch (err) {
          console.error("Error sending message:", err);
          toast.error("Failed to send message");
          throw err;
        }
      },

      addMessage: (message) => {
        const { selectedUser } = get();

        if (
          selectedUser &&
          (message.senderId === selectedUser._id ||
            message.receiverId === selectedUser._id)
        ) {
          set((state) => ({
            messages: [...state.messages, message],
          }));
          console.log("✅ Message added to chat:", message);
        }
      },

      // ✅ FIXED: Better socket subscription with retry logic
      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) {
          console.log("❌ Socket not initialized yet");

          // ✅ Retry after 1 second if socket not ready
          setTimeout(() => {
            console.log("🔄 Retrying socket subscription...");
            get().subscribeToMessages();
          }, 1000);
          return;
        }

        if (!socket.connected) {
          console.log("❌ Socket not connected yet, waiting...");

          // ✅ Wait for socket to connect
          socket.once("connect", () => {
            console.log("✅ Socket connected, now subscribing...");
            get().subscribeToMessages();
          });
          return;
        }

        console.log("✅ Subscribed to newMessage events");

        // Remove previous listener to avoid duplicates
        socket.off("newMessage");

        // Listen for new messages
        socket.on("newMessage", (message) => {
          console.log("📨 Received newMessage event:", message);
          get().addMessage(message);
        });
      },

      unSubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        console.log("🔕 Unsubscribed from newMessage events");
        socket.off("newMessage");
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        selectedUser: state.selectedUser,
        users: state.users,
      }),
    }
  )
);
