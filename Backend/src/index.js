import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' data:; img-src 'self' data:; connect-src *"
  );
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "https://gupshup-rbcp.onrender.com"
      : "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Route Logger (optional)
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

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
  });
}

// Initialize socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
