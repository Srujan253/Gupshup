import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

// ✅ Helmet CSP Middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://gupshup-rbcp.onrender.com", "wss://gupshup-rbcp.onrender.com"],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://randomuser.me"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

// ✅ Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ CORS config
const allowedOrigins = [
  "http://localhost:5173",
  "https://gupshup-rbcp.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 🔍 Debug Registered Routes
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

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

// ✅ Initialize Socket.IO
initSocket(server);

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
