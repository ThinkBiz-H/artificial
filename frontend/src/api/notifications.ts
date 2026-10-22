import { apiClient } from "./client";
import type { ApiEnvelope, AppNotification, Pagination } from "@/types";

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    apiClient
      .get<ApiEnvelope<{ notifications: AppNotification[]; unreadCount: number; pagination: Pagination }>>(
        "/notifications",
        { params },
      )
      .then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch<ApiEnvelope<{ notification: AppNotification }>>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch<ApiEnvelope<{ modifiedCount: number }>>("/notifications/read-all").then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/notifications/${id}`).then((r) => r.data),

  clearAll: () => apiClient.delete<ApiEnvelope<{}>>("/notifications").then((r) => r.data),

  registerPushToken: (token: string) =>
    apiClient.post<ApiEnvelope<{}>>("/notifications/push-token", { token }).then((r) => r.data),

  unregisterPushToken: (token: string) =>
    apiClient.delete<ApiEnvelope<{}>>("/notifications/push-token", { data: { token } }).then((r) => r.data),
};
