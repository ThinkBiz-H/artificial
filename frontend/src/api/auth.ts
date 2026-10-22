import { apiClient, refreshSession, setAccessToken } from "./client";
import type { ApiEnvelope, User, Session } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  mobile?: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<
        ApiEnvelope<{ userId: string; email: string }>
      >("/auth/register", payload)
      .then((r) => r.data),

  verifyOtp: async (payload: { mobile: string; otp: string }) => {
    const res = await apiClient.post<
      ApiEnvelope<{ user: User; accessToken: string }>
    >("/auth/verify-otp", payload);

    setAccessToken(res.data.data.accessToken);
    return res.data;
  },

  resendOtp: (payload: { mobile: string }) =>
  apiClient
    .post<ApiEnvelope<{}>>("/auth/resend-otp", payload)
    .then((r) => r.data),

  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<
      ApiEnvelope<{ user: User; accessToken: string }>
    >("/auth/login", payload);
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },

  // Returning-customer login — same OTP mechanism checkout uses, but for a
  // number that's already registered (404s otherwise). This is the primary
  // customer login path now, since checkout-created accounts have no
  // password the customer ever sees.
  mobileLoginRequestOtp: (payload: { mobile: string }) =>
    apiClient
      .post<
        ApiEnvelope<{ mobile: string; expiresInMinutes: number }>
      >("/auth/mobile/login", payload)
      .then((r) => r.data),

  mobileLoginVerifyOtp: async (payload: { mobile: string; otp: string }) => {
    const res = await apiClient.post<
      ApiEnvelope<{ user: User; accessToken: string }>
    >("/auth/mobile/verify", payload);
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

  forgotPassword: (payload: { email: string }) =>
    apiClient
      .post<ApiEnvelope<{}>>("/auth/forgot-password", payload)
      .then((r) => r.data),

  resetPassword: (token: string, payload: { password: string }) =>
    apiClient
      .post<ApiEnvelope<{}>>(`/auth/reset-password/${token}`, payload)
      .then((r) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient
      .post<ApiEnvelope<{}>>("/auth/change-password", payload)
      .then((r) => r.data),

  getMe: () =>
    apiClient.get<ApiEnvelope<{ user: User }>>("/auth/me").then((r) => r.data),

  logoutAll: (keepCurrentSession = false) =>
    apiClient
      .post<ApiEnvelope<{}>>("/auth/logout-all", { keepCurrentSession })
      .then((r) => r.data),

  getSessions: () =>
    apiClient
      .get<ApiEnvelope<{ sessions: Session[] }>>("/auth/sessions")
      .then((r) => r.data),

  revokeSession: (id: string) =>
    apiClient
      .delete<ApiEnvelope<{}>>(`/auth/sessions/${id}`)
      .then((r) => r.data),

  getLoginHistory: () =>
    apiClient
      .get<ApiEnvelope<{ history: unknown[] }>>("/auth/login-history")
      .then((r) => r.data),
      forgotPasswordMobile: (payload: { mobile: string }) =>
  apiClient
    .post<ApiEnvelope<{}>>("/auth/forgot-password/mobile", payload)
    .then((r) => r.data),

verifyResetOtp: (payload: { mobile: string; otp: string }) =>
  apiClient
    .post<ApiEnvelope<{}>>("/auth/forgot-password/verify-otp", payload)
    .then((r) => r.data),

resetPasswordMobile: (payload: {
  mobile: string;
  otp: string;
  password: string;
}) =>
  apiClient
    .post<ApiEnvelope<{}>>("/auth/reset-password/mobile", payload)
    .then((r) => r.data),
    
};
