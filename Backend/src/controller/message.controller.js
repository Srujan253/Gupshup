import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getIO, getReceiverSocketId } from "../lib/socket.js";

// 📌 Get users except the current one
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggenInUserId = req.user._id;
    const filterdUsers = await User.find({
      _id: { $ne: loggenInUserId },
    }).select("-password");

    res.status(200).json(filterdUsers);
  } catch (error) {
    console.error("Error in GetUserFor Sidebar", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Get chat messages between two users
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in GetMessages", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📌 Send a new message and notify receiver via socket
export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // ✅ Emit real-time message if receiver is online
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in SendMessages", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
