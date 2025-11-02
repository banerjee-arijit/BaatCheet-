import express from "express";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import dotenv from "dotenv";
import connectDB from "./DB/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./utils/socket.js";
import path from "path";

dotenv.config();

const __dirname = path.resolve();

// ✅ Dynamic CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://baatcheet-1-p4p7.onrender.com"]
    : ["http://localhost:5173", "http://localhost:5000"];

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// API endpoints FIRST
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Client/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
  });
}

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
