import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface RefreshResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ErrorResponse {
  code?: string;
  message?: string;
}

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Inject Access Token
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Queue Management
let isRefreshing = false;

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor
API.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isExpiredError =
      error.response?.status === 401 &&
      error.response.data?.code === "TOKEN_EXPIRED";

    if (isExpiredError && !originalRequest._retry) {
      // Queue Requests During Refresh
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Access Token
        const refreshResponse = await axios.post<RefreshResponse>(
          "http://localhost:5000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        );

        const { token, user } = refreshResponse.data;

        // Save New Credentials
        useAuthStore.getState().setCredentials({
          user,
          accessToken: token,
        });

        // Retry Queued Requests
        processQueue(null, token);

        // Retry Original Request
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return API(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        // Session Expired Completely
        useAuthStore.getState().clearCredentials();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
