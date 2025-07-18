import axios from 'axios';
const isLocalhost = window.location.hostname === "localhost";

// 👇 Dynamically set baseURL based on where the app is running
const baseURL = isLocalhost
  ? "http://localhost:5001/api"  // local backend
  : "https://gupshup-rbcp.onrender.com/api";  // deployed backend

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});