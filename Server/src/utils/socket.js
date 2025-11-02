import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://baatcheet-1-p4p7.onrender.com"]
    : ["http://localhost:5173", "http://localhost:5000"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("========================================");
  console.log("✅ NEW CONNECTION");
  console.log("Socket ID:", socket.id);
  console.log("Query params:", socket.handshake.query);
  console.log("========================================");

  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} mapped to socket ${socket.id}`);
    console.log("Current online users:", Object.keys(userSocketMap));

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  } else {
    console.log("⚠️ No valid userId in connection");
  }

  socket.on("disconnect", () => {
    console.log("========================================");
    console.log("❌ DISCONNECT");
    console.log("Socket ID:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log("Removed user:", userId);
      console.log("Remaining online users:", Object.keys(userSocketMap));
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
    console.log("========================================");
  });
});

export { io, app, server };
