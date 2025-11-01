import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../Controllers/auth.controller.js";
import { protectRoute } from "../Middleware/auth.middleware.js";

const router = express.Router();

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Update Profile Route
router.put("/update-profile", protectRoute, updateProfile);

router.get("/check-auth", protectRoute, checkAuth);

export default router;
