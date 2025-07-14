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
