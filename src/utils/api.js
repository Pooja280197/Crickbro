import axios from "axios";
import { toast } from "react-toastify";
import { clientApiBaseURL } from "../config/env";
let isLoginPopupOpen = false;

const api = axios.create({
  baseURL: clientApiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // CORS ke liye
});


// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the runtime set multipart boundary (default JSON Content-Type breaks file uploads)
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response?.status === 401 && !isLoginPopupOpen) {
        isLoginPopupOpen = true;
        toast.error("Session expired. Please login again.");
        window.dispatchEvent(new Event("openLoginPopup"));
      }
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;