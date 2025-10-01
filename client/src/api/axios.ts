import { saveAccessToken } from "../utils/tokenStorage";
import axios, { type InternalAxiosRequestConfig } from "axios";

// ==========================
// Axios Instance
// ==========================
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // send HttpOnly refresh cookies
});

// ==========================
// Request Interceptor
// ==========================
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ==========================
// Response Interceptor
// ==========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auto-refresh for these endpoints
    const skipRefreshEndpoints = [
      "/auth/login",
      "/auth/change-password",
      "/auth/verify-otp",
      "/auth/register",
      "/auth/logout",
    ];

    if (
      error.response?.status === 401 &&
      !skipRefreshEndpoints.includes(originalRequest.url || "")
    ) {
      try {
        // Call refresh token endpoint
        const { data } = await axios.post(
          "http://localhost:8000/api/v1/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        // Save new access token
        if (data.accessToken) saveAccessToken(data.accessToken);

        // Update Authorization header for original request
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, remove token
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
