import axios from "axios";

const api = axios.create({
  baseURL: "https://sangeetlistenerbkend.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — let AuthContext handle redirect
      console.warn("Session expired or unauthorized");
    }
    return Promise.reject(error);
  }
);

export default api;
