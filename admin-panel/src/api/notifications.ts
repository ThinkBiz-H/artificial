import { apiClient } from "./client";
import type { ApiEnvelope, NotificationTemplate, Pagination } from "@/types";

export const notificationsAdminApi = {
  templates: (params: { type?: string; channel?: string } = {}) =>
    apiClient.get<ApiEnvelope<{ templates: NotificationTemplate[] }>>("/admin/notification-templates", { params }).then((r) => r.data),

  createTemplate: (values: TemplateInput) =>
    apiClient.post<ApiEnvelope<{ template: NotificationTemplate }>>("/admin/notification-templates", values).then((r) => r.data),

  updateTemplate: (id: string, values: Partial<TemplateInput>) =>
    apiClient.put<ApiEnvelope<{ template: NotificationTemplate }>>(`/admin/notification-templates/${id}`, values).then((r) => r.data),

  deleteTemplate: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/notification-templates/${id}`).then((r) => r.data),

  broadcast: (values: { audience?: "all" | "admins"; title: string; message: string }) =>
    apiClient.post<ApiEnvelope<{ sent: number; total: number }>>("/admin/notifications/broadcast", values).then((r) => r.data),

  /* ---------------- Notification Center: push campaigns ---------------- */

  campaigns: (params: { status?: string; category?: string; page?: number; limit?: number } = {}) =>
    apiClient
      .get<ApiEnvelope<{ campaigns: NotificationCampaign[]; pagination: Pagination }>>("/admin/notifications/campaigns", { params })
      .then((r) => r.data),

  campaign: (id: string) =>
    apiClient.get<ApiEnvelope<{ campaign: NotificationCampaign }>>(`/admin/notifications/campaigns/${id}`).then((r) => r.data),

  campaignSummary: (days = 30) =>
    apiClient.get<ApiEnvelope<CampaignSummary>>("/admin/notifications/campaigns/summary", { params: { days } }).then((r) => r.data),

  estimate: (audience: CampaignAudience) =>
    apiClient
      .post<ApiEnvelope<{ users: number | null; devices: number | null }>>("/admin/notifications/campaigns/estimate", { audience })
      .then((r) => r.data),

  createCampaign: (values: CampaignInput & { sendNow?: boolean }) =>
    apiClient.post<ApiEnvelope<{ campaign: NotificationCampaign }>>("/admin/notifications/campaigns", values).then((r) => r.data),

  updateCampaign: (id: string, values: Partial<CampaignInput>) =>
    apiClient.put<ApiEnvelope<{ campaign: NotificationCampaign }>>(`/admin/notifications/campaigns/${id}`, values).then((r) => r.data),

  sendCampaign: (id: string) => apiClient.post<ApiEnvelope<{ id: string }>>(`/admin/notifications/campaigns/${id}/send`).then((r) => r.data),
  cancelCampaign: (id: string) =>
    apiClient.post<ApiEnvelope<{ campaign: NotificationCampaign }>>(`/admin/notifications/campaigns/${id}/cancel`).then((r) => r.data),
  duplicateCampaign: (id: string) =>
    apiClient.post<ApiEnvelope<{ campaign: NotificationCampaign }>>(`/admin/notifications/campaigns/${id}/duplicate`).then((r) => r.data),
  retryCampaign: (id: string) => apiClient.post<ApiEnvelope<{ id: string }>>(`/admin/notifications/campaigns/${id}/retry`).then((r) => r.data),
  retryFailedDeliveries: (days = 7) =>
    apiClient.post<ApiEnvelope<{ count: number }>>("/admin/notifications/jobs/retry-failed", { days }).then((r) => r.data),
  deleteCampaign: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/notifications/campaigns/${id}`).then((r) => r.data),

  sendTest: (values: { title: string; body: string; imageUrl?: string; link?: string }) =>
    apiClient
      .post<ApiEnvelope<{ delivered: number; failed: number; provider: string }>>("/admin/notifications/test", values)
      .then((r) => r.data),
};

export interface TemplateInput {
  type: string;
  channel: string;
  subject?: string;
  body: string;
  isActive?: boolean;
  name?: string;
  imageUrl?: string;
  link?: string;
}

export type CampaignCategory =
  | "general"
  | "promotional"
  | "flash_sale"
  | "coupon"
  | "price_drop"
  | "back_in_stock"
  | "wishlist"
  | "order"
  | "payment";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";

export interface CampaignAudience {
  type: "all" | "users" | "topic" | "admins";
  userIds?: string[];
  topic?: string;
}

export interface CampaignInput {
  title: string;
  body: string;
  imageUrl?: string;
  link?: string;
  category: CampaignCategory;
  audience: CampaignAudience;
  saveInApp: boolean;
  scheduledAt?: string | null;
}

export interface NotificationCampaign extends Omit<CampaignInput, "audience"> {
  _id: string;
  audience: { type: CampaignAudience["type"]; topic?: string; userIds: (string | { _id: string; name: string; email?: string })[] };
  status: CampaignStatus;
  sentAt?: string | null;
  error?: string;
  provider?: string;
  stats: { targetedUsers: number; devices: number; delivered: number; failed: number; invalidTokensRemoved: number; inApp: number; opened: number };
  createdBy?: { _id: string; name: string } | null;
  createdAt: string;
}

export interface CampaignSummary {
  days: number;
  totals: { campaigns: number; delivered: number; failed: number; opened: number; inApp: number; clickRate: number };
  byCategory: { category: CampaignCategory; campaigns: number; delivered: number; opened: number }[];
  scheduled: number;
  push: { configured: boolean };
  topics: string[];
}
