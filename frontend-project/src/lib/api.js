import axios from "axios";

// 1. Read the key from your .env file or default to the live production domain
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://onrender.com";

// 2. Create the Axios instance using that base URL (appending /api for your routes)
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export default api;
