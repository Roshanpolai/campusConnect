import axios from "axios";

// Centralized API client: attaches the JWT and normalizes the base URL.
const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cc_token");
      localStorage.removeItem("cc_user");
    }
    return Promise.reject(error);
  }
);

export default api;
