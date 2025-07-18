import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5001/api'
      : 'https://gupshup-rbcp.onrender.com/api',
  withCredentials: true, // IMPORTANT: to send cookies
});
