import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiEnvelope } from "@/types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:5000/api/v1";

// In-memory access token only — the refresh token lives in an httpOnly
// cookie set by the backend. On app load we silently call
// /auth/refresh-token (withCredentials) to restore the session.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

/**
 * Identifies this app to the API so it gets its own refresh-token cookie
 * (swk_admin_rt) — otherwise it shares one with the storefront, and logging
 * in/out of either app replaces or ends the other's session.
 */
const CLIENT_HEADERS = { "X-Client-App": "admin" } as const;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", ...CLIENT_HEADERS },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/*
 * Single-flight refresh: the backend rotates the refresh token on every use,
 * so two refreshes with the same cookie race and the loser is rejected.
 * App start-up (twice under React StrictMode) and parallel 401s all share
 * this one in-flight request.
 */
let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiEnvelope<{ accessToken: string }>>(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true, headers: CLIENT_HEADERS })
      .then((res) => {
        const token = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const isAuthRoute =
      url.includes("/auth/login") || url.includes("/auth/refresh-token");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshSession();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export function unwrapKey<T>(envelope: ApiEnvelope<unknown>, key: string): T {
  return (envelope.data as Record<string, unknown> | undefined)?.[key] as T;
}
