// lib/socket.js
import { Server } from "socket.io";

let io;
const userSocketMap = {}; // userId -> socket.id
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? "https://gupshup-rbcp.onrender.com"
        : "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      for (let [uid, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) {
          delete userSocketMap[uid];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getIO = () => io;
export const getReceiverSocketId = (userId) => userSocketMap[userId] || null;
