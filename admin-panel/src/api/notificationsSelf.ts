import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

// The admin's OWN notification inbox — same shared /notifications resource
// customers use (each user, including admins, has their own feed).
export interface SelfNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsSelfApi = {
  list: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    apiClient
      .get<ApiEnvelope<{ notifications: SelfNotification[]; unreadCount: number; pagination: { total: number; page: number; limit: number; totalPages: number } }>>(
        "/notifications",
        { params },
      )
      .then((r) => r.data),
  markRead: (id: string) => apiClient.patch<ApiEnvelope<{}>>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.patch<ApiEnvelope<{}>>("/notifications/read-all").then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/notifications/${id}`).then((r) => r.data),
};
