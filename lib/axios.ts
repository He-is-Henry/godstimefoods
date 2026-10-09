import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { useTokenStore } from "@/store/useTokenStore";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

let isRefreshing: boolean = false;
let queue: {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, accessToken?: string) => {
  queue.forEach((promise) => {
    if (error) promise.reject(error);
    else if (accessToken) promise.resolve(accessToken);
  });
  queue = [];
};

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useTokenStore.getState().accessToken;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes("login") ||
      originalRequest.url?.includes("refresh");

    if (error.response?.status === 401 && !isAuthRoute) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (!error.response) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (accessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh");
        const { accessToken } = res.data;

        useTokenStore.getState().setToken(accessToken);

        isRefreshing = false;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        isRefreshing = false;
        processQueue(refreshError);

        const refreshErr = refreshError as AxiosError;

        if (!refreshErr.response) {
          return Promise.reject(refreshErr);
        }

        useTokenStore.getState().clearToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
