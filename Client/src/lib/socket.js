import { io } from "socket.io-client";

// ✅ Get auth user from localStorage
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

// ✅ Create socket connection
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

let socket = null;

// ✅ Initialize socket with userId
export const initializeSocket = () => {
  const authUser = getAuthUser();

  if (!authUser?._id) {
    console.log("⚠️ No authenticated user found");
    return null;
  }

  if (socket?.connected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  socket = io(SOCKET_URL, {
    query: {
      userId: authUser._id, // ✅ Send userId in query
    },
  });

  // ✅ Socket event listeners
  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
    console.log("👤 User ID:", authUser._id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket server");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  return socket;
};

// ✅ Get existing socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// ✅ Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};

export default getSocket;
