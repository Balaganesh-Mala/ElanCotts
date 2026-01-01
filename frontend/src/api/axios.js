import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ Uses .env VITE_API_BASE_URL
  timeout: 15000,
});

// Attach token automatically (if exists)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("Axios API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
