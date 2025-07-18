import { Server } from "socket.io";

let io;
const userSocketMap = {}; // userId -> socket.id

export const initSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend-domain.com", // ✅ Replace with your actual frontend domain
    "https://gupshup-rbcp.onrender.com", // optional, if also deployed there
  ];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn("🛑 CORS blocked origin:", origin);
          callback(new Error("Not allowed by CORS: " + origin));
        }
      },
      credentials: true,
    },
    transports: ["websocket"], // ✅ force websocket only in production
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

      for (const [uid, sid] of Object.entries(userSocketMap)) {
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
