import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_API_URL || "https://api.gosawa.org";
const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export default api;
