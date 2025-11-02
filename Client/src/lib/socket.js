import { io } from "socket.io-client";

const getAuthUser = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.authUser || null;
    }
  } catch (error) {
    console.error("Error getting auth user:", error);
  }
  return null;
};

const SOCKET_URL = import.meta.env.PROD
  ? "https://baatcheet-1-p4p7.onrender.com"
  : "http://localhost:5000";

console.log("🌍 Socket URL:", SOCKET_URL);

let socket = null;

export const initializeSocket = () => {
  const authUser = getAuthUser();

  if (!authUser?._id) {
    console.log("❌ Cannot connect socket: No user logged in");
    return null;
  }

  if (socket?.connected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  console.log("🔌 Connecting to socket server:", SOCKET_URL);
  console.log("👤 User ID:", authUser._id);

  socket = io(SOCKET_URL, {
    query: {
      userId: authUser._id,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
