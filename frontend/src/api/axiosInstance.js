import axios from "axios";
import { getSession, setSession, clearSession } from "../utils/AuthSession";

const api = axios.create({
  baseURL: "http://localhost:90/api",
});

/* =========================
   REQUEST: attach token
========================= */
api.interceptors.request.use((config) => {
  const { accessToken } = getSession();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

/* =========================
   REFRESH LOGIC
========================= */

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  queue = [];
};

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const url = originalRequest?.url || "";

    // 🚨 SKIP AUTH ROUTES (VERY IMPORTANT)
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const { refreshToken } = getSession();

      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:90/api/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        setSession({
          accessToken: newAccessToken,
          refreshToken,
          user: getSession().user,
        });

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // ❌ ONLY clear session (NO redirect here)
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