import bcrypt from "bcrypt";
import UserModel from "../Model/user.model.js";
import { generateToken } from "../utils/utils.js";
import cloudinary from "../utils/cloudinary.js";
// Signup Controller
export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }
    const saltPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltPassword);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate token and send response
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        username: newUser.username,
        email: newUser.email,
        id: newUser._id,
        password: newUser.password,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data." });
    }
  } catch (err) {
    console.log("error in signUp controller", err.message);
    return res.status(500).json({ message: "Server error." });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      username: user.username,
      email: user.email,
      id: user._id,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.log("error in login controller" + err.message);
    return res.status(500).json({ message: "Server error." });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.log("Error in logout controller");
    return res.status(500).json({ message: "Server error." });
  }
};

// Update Profile Controller to cloudinary
export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;

    if (!profilePicture || profilePicture === "") {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    console.log("Uploading to Cloudinary..."); // 🔍 Debug
    const uploadResponse = await cloudinary.uploader.upload(profilePicture);
    console.log("Cloudinary URL:", uploadResponse.secure_url); // 🔍 Debug

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    console.log("Updated user in DB:", updatedUser); // 🔍 Debug

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error in update profile controller:", err);
    return res.status(500).json({
      message: "Server error.",
      error: err.message, // ✅ Error details bhejo
    });
  }
};
// Check Auth Controller
export const checkAuth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.log("Error in checkAuth controller:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
