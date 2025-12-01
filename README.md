# GupShup
# 🚀 Backend Project Structure

This backend is built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. Below is a simple explanation of how the project is organized and what each part does.

---

## 📁 Folders and Their Purpose

### `models/`
- Stores **schemas** using Mongoose.
- A schema defines how data (like users or posts) is stored in the database.

### `controllers/`
- Handles the **main logic**.
- For example, registering a user, logging in, or sending data to the frontend.

### `routes/`
- Manages **API endpoints** like `/login` or `/register`.
- Each route connects to a controller function.

### `middleware/`
- Functions that run **before** controllers.
- Used for checking JWT tokens, validating data, or handling errors.

### `lib/`
- Contains **helper functions**.
- Examples: creating JWT tokens or uploading to Cloudinary.

---

## 🔐 JWT Tokens
- Used to **securely log in users**.
- Created using `jsonwebtoken` and sent to the frontend.

## 🍪 Cookies
- Store the JWT token on the frontend.
- Help keep the user logged in.

## ☁️ Cloudinary
- Used to **store images or files** online.
- Requires an API key to work.

## 🛢️ Mongoose
- Connects the app to **MongoDB**.
- Used to define schemas and interact with the database.

## 🌐 CORS
- Allows the **frontend and backend to talk to each other** even if they are on different ports or domains.

---

## ✅ Tools Used

| Tool           | What it does                      |
|----------------|-----------------------------------|
| `jsonwebtoken` | Creates secure login tokens       |
| `mongoose`     | Works with MongoDB                |
| `cors`         | Allows frontend-backend requests  |
| `cookie-parser`| Helps read cookies                |
| `cloudinary`   | Uploads and stores images/files   |
| `dotenv`       | Stores secret keys in `.env` file |

---

## 📌 Summary

This structure keeps your code **clean**, **organized**, and **easy to scale**. You can quickly add new features or update existing ones without confusion.

---

In an era where digital communication is paramount, "Gupshup" emerges as a modern, full-stack real-time chat application designed to facilitate seamless connectivity. Built upon the robust MERN stack (MongoDB, Express.js, React, Node.js), this project addresses the need for instant, reliable, and secure messaging platforms. The application leverages Socket.IO to establish bi-directional, low-latency communication channels, enabling features such as instant message delivery, real-time typing indicators, and live user status updates.

The backend architecture follows a clean, modular structure, ensuring scalability and maintainability, while MongoDB serves as a flexible data store for user profiles and chat histories. Security is prioritized through the implementation of JWT (JSON Web Tokens) for authentication and HTTP-only cookies for session management. On the client side, the application utilizes React with Vite for a highly responsive user interface, styled with Tailwind CSS and DaisyUI to ensure cross-device compatibility. By integrating cloud-based media storage via Cloudinary and global state management through Zustand, Gupshup provides a comprehensive, production-ready solution that demonstrates the practical application of modern web technologies in building complex communication systems.

