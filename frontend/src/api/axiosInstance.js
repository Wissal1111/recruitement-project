import axios from "axios";
import { getSession, setSession, clearSession } from "../utils/AuthSession";

const api = axios.create({
  baseURL: "http://localhost:90/api",
});

const authApi = axios.create({
  baseURL: "http://localhost:90/api",
});

api.interceptors.request.use((config) => {
  const { accessToken } = getSession();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (isAuthRoute) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = getSession();

      if (!refreshToken) {
        console.warn("⚠️ No refresh token found in session — clearing and rejecting");
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          const retryConfig = { ...originalRequest };
          retryConfig.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(retryConfig);
        });
      }

      isRefreshing = true;

      try {
        console.log("🔄 Attempting token refresh...");
        const res = await authApi.post("/auth/refresh-token", { refreshToken });

        const newAccessToken = res.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No accessToken returned from refresh endpoint");
        }

        console.log("✅ Token refreshed successfully");

        setSession({ accessToken: newAccessToken });

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (err) {
        console.group("🔴 Refresh Failed");
        console.log("Error status:", err.response?.status);
        console.log("Error data:", err.response?.data);
        console.log("Refresh token used:", refreshToken);
        console.groupEnd();

        processQueue(err, null);
        clearSession();
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;