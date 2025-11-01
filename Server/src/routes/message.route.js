import express from "express";

import {
  getUsers,
  getMessages,
  sendMessage,
} from "../Controllers/message.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";
const router = express.Router();

//message routes will be defined here
router.get("/user", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send-messages/:id", protectRoute, sendMessage);

export default router;
