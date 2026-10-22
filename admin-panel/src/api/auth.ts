import { apiClient, refreshSession, setAccessToken } from "./client";
import type { ApiEnvelope, AdminUser } from "@/types";

export interface LoginPayload { email: string; password: string }

export const authApi = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<ApiEnvelope<{ user: AdminUser; accessToken: string }>>("/auth/login", payload);
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<ApiEnvelope<{}>>("/auth/logout");
    setAccessToken(null);
    return res.data;
  },
  /** Goes through the shared single-flight refresh (see api/client.ts). */
  refreshToken: () => refreshSession().then((accessToken) => ({ data: { accessToken } })),
  getMe: () => apiClient.get<ApiEnvelope<{ user: AdminUser }>>("/auth/me").then((r) => r.data),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiEnvelope<{}>>("/auth/change-password", payload).then((r) => r.data),
};
