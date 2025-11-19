import express from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import geminiRoutes from "./routes/gemini.route.js";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js"; 
import helmet from "helmet";


// 👈 new

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

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

// Middleware
app.use(express.json({ limit: "10mb" }));
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src 'self' data:; img-src 'self' data:; connect-src *"
//   );
//   next();
// });
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",                  // Local dev
  "https://gupshup-rbcp.onrender.com",      // Production frontend
];




app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);




// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/gemini", geminiRoutes);

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
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  // ✅ Catch-all route for frontend routing (Render-safe version)
  app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}


// Init socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  connectDB();
});
