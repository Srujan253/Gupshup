import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js"; // 👈 new

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Debug Registered Routes
try {
  console.log("\n🔍 Registered Routes:");
  app._router?.stack?.forEach((middleware) => {
    const route = middleware?.route;
    if (route && route.path) {
      console.log("Route:", route.path);
    } else if (middleware?.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route && handler.route.path) {
          console.log("Route:", handler.route.path);
        }
      });
    }
  });
} catch (err) {
  console.error("Route logging failed safely:", err.message);
}
// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Init socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
