// src/api/axios.ts
import { saveAccessToken, getAccessToken, removeAccessToken } from "../utils/tokenStorage";
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
  const token = getAccessToken();
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

    // Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

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
      originalRequest &&
      !skipRefreshEndpoints.includes(originalRequest.url || "")
    ) {
      try {
        originalRequest._retry = true;

        // Call refresh token endpoint
        const { data } = await axios.post(
          "http://localhost:8000/api/v1/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        // ✅ Save new access token using helper
        const newToken = saveAccessToken(data.accessToken);

        if (newToken) {
          // Update Authorization header for original request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }

        // Retry original request with updated token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear stored token
        removeAccessToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
