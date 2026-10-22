import { apiClient } from "./client";
import type { ApiEnvelope, NotificationTemplate } from "@/types";

export const notificationsAdminApi = {
  templates: (params: { type?: string; channel?: string } = {}) =>
    apiClient.get<ApiEnvelope<{ templates: NotificationTemplate[] }>>("/admin/notification-templates", { params }).then((r) => r.data),

  createTemplate: (values: { type: string; channel: string; subject?: string; body: string; isActive?: boolean }) =>
    apiClient.post<ApiEnvelope<{ template: NotificationTemplate }>>("/admin/notification-templates", values).then((r) => r.data),

  updateTemplate: (id: string, values: Partial<{ subject: string; body: string; isActive: boolean }>) =>
    apiClient.put<ApiEnvelope<{ template: NotificationTemplate }>>(`/admin/notification-templates/${id}`, values).then((r) => r.data),

  deleteTemplate: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/notification-templates/${id}`).then((r) => r.data),

  broadcast: (values: { audience?: "all" | "admins"; title: string; message: string }) =>
    apiClient.post<ApiEnvelope<{ sent: number; total: number }>>("/admin/notifications/broadcast", values).then((r) => r.data),
};
