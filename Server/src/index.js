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

// Middleware
app.use(express.json({ limit: "10mb" })); // Combined - removed duplicate
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const __dirname = path.resolve();

// endpoints
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // ✅ === use karo, = nahi
  app.use(express.static(path.join(__dirname, "../Client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client/dist/index.html"));
  });
}
// Start the server and connect to the database
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
