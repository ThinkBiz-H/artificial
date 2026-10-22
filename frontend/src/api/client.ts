import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiEnvelope } from "@/types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:5000/api/v1";

/**
 * Upper bound for any API call. The slowest legitimate request is an OTP
 * send (the backend retries the SMS provider once, ~16s worst case), so 30s
 * never cuts a real request short but stops a hung one spinning forever.
 */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Identifies this app to the API so it gets its own refresh-token cookie
 * (swk_rt) instead of the generic shared one — on a shared host (and on
 * localhost, across every local project) a same-named cookie from another
 * app would otherwise shadow ours and break the session.
 */
const CLIENT_HEADERS = { "X-Client-App": "storefront" } as const;

// In-memory access token. Never persisted to localStorage — the refresh
// token lives in an httpOnly cookie (set by the backend), so on a fresh
// page load we silently call /auth/refresh-token to get a new access token.
let accessToken: string | null = null;

/*
 * Session hint (not a secret): "1" after a login/refresh, "0" after a logout
 * or a rejected refresh. Lets start-up skip the refresh call for visitors who
 * are known to be logged out — otherwise every guest page load is a 401
 * (console + server log noise). Missing = unknown, so we still try.
 */
const SESSION_HINT_KEY = "swk_session";
function writeSessionHint(value: "0" | "1") {
  try {
    localStorage.setItem(SESSION_HINT_KEY, value);
  } catch {
    /* storage unavailable (private mode) — fall back to always trying */
  }
}
/** False only when this browser is known to have no session. */
export function mayHaveSession() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  writeSessionHint(token ? "1" : "0");
}

export function getAccessToken() {
  return accessToken;
}

/** Called when the session is truly over (the refresh token was rejected). Registered by the auth store. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

/** Error surfaced to the UI when the session can't be renewed. */
export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send/receive the httpOnly refreshToken cookie
  timeout: REQUEST_TIMEOUT_MS,
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
 * ---- Single-flight refresh ----
 * The backend rotates the refresh token on every use, so two refreshes with
 * the same cookie race and the loser is rejected. Every caller (app start-up,
 * React StrictMode's double effect, parallel 401s) shares this one promise.
 */
let refreshPromise: Promise<string> | null = null;

/** Gets a new access token from the refresh cookie. Concurrent calls share one request. */
export function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiEnvelope<{ accessToken: string }>>(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true, timeout: REQUEST_TIMEOUT_MS, headers: CLIENT_HEADERS })
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

/** True when the refresh endpoint itself said the session is over (as opposed to a network failure). */
export function isSessionRejected(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Don't try to refresh on the auth endpoints themselves.
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh-token");
    // Only a request that carried an access token can have an expired one. A
    // guest's 401 just means "login required" — refreshing would be noise.
    const hadToken = !!originalRequest?.headers?.Authorization;

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthRoute || !hadToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const token = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      if (isSessionRejected(refreshErr)) {
        // The refresh token itself is invalid/expired — the session is over.
        setAccessToken(null);
        onSessionExpired?.();
        return Promise.reject(new SessionExpiredError());
      }
      // Network failure while refreshing: keep the session, report the original error.
      return Promise.reject(error);
    }
  },
);

/** Unwraps `data.data.<key>` for the common single-key response shape. */
export function unwrapKey<T>(envelope: ApiEnvelope<unknown>, key: string): T {
  return (envelope.data as Record<string, unknown> | undefined)?.[key] as T;
}
