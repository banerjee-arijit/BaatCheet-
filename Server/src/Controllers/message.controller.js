import messageModel from "../Model/message.model.js";
import UserModel from "../Model/user.model.js";
import cloudinary from "./../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

// ✅ Get all users with their last message
export const getUsers = async (req, res) => {
  try {
    const loggedinUserId = req.user._id;

    const filteredUsers = await UserModel.find({
      _id: { $ne: loggedinUserId },
    }).select("-password");

    // ✅ Get last message for each user
    const usersWithLastMessage = await Promise.all(
      filteredUsers.map(async (user) => {
        // Find last message between logged-in user and this user
        const lastMessage = await messageModel
          .findOne({
            $or: [
              { senderId: loggedinUserId, receiverId: user._id },
              { senderId: user._id, receiverId: loggedinUserId },
            ],
          })
          .sort({ createdAt: -1 }) // Latest first
          .select("text image createdAt senderId");

        return {
          ...user.toObject(),
          lastMessage:
            lastMessage?.text || (lastMessage?.image ? "📷 Image" : null),
          lastMessageTime: lastMessage?.createdAt || null,
          lastMessageSenderId: lastMessage?.senderId || null,
        };
      })
    );

    // ✅ Sort users by last message time (most recent first)
    usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    return res.status(200).json({ users: usersWithLastMessage });
  } catch (err) {
    console.log("Error in getUser Controller:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all messages (no change needed)
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user._id;
    const message = await messageModel
      .find({
        $or: [
          { senderId: senderId, receiverId: id },
          { senderId: id, receiverId: senderId },
        ],
      })
      .sort({ createdAt: 1 });
    return res.status(200).json({ messages: message });
  } catch (err) {
    console.log("Error in getMessage ");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Send message (no change needed)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadReponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadReponse.secure_url;
    }

    const newMessage = new messageModel({
      senderId: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json({ message: newMessage });
  } catch (err) {
    console.log("Error in sendMessage Controller:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
