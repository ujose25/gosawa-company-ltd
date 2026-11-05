import axios from "axios";

// FIXED: Changed from "https://onrender.com" to your specific backend instance link
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://gosawa-company-ltd-3.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export default api;
