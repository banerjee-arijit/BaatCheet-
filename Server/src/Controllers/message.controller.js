import messageModel from "../Model/message.model.js";
import UserModel from "../Model/user.model.js";
import cloudinary from "./../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js"; // ✅ Import io

//get all users except logged in user
export const getUsers = async (req, res) => {
  try {
    const loggedinUserId = req.user._id;
    const filterdUsers = await UserModel.find({
      _id: { $ne: loggedinUserId },
    }).select("-password");
    return res.status(200).json({ users: filterdUsers });
  } catch (err) {
    console.log("Error in getUser Controller");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all messages between logged in user and other user
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

//send message controller
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params; // ✅ Rename id to receiverId
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadReponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadReponse.secure_url;
    }

    const newMessage = new messageModel({
      senderId: senderId,
      receiverId: receiverId, // ✅ Now correct
      text: text,
      image: imageUrl,
    });
    await newMessage.save();

    // ✅ Send message via socket to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(200).json({ message: newMessage });
  } catch (err) {
    console.log("Error in sendMessage Controller:", err); // ✅ Log error details
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
