import axios from "axios";
import { getCookie } from "../services/cookies";

const env = import.meta.env;

const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "X-Custom-Header": "foobar" },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getCookie("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        // case 401:
        //   window.location = "/";
        //   break;
        case 500:
          console.error("Server error:", error.response.data);
          break;
        default:
          console.error("An error occurred:", error.response.data);
      }
    } else {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
