import { apiClient } from "./client";
import type { ApiEnvelope, AdminUser, Pagination } from "@/types";

export interface CustomerListParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
}

export const customersApi = {
  list: (params: CustomerListParams = {}) =>
    apiClient.get<ApiEnvelope<{ users: AdminUser[]; pagination: Pagination }>>("/admin/users", { params }).then((r) => r.data),

  byId: (id: string) => apiClient.get<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}`).then((r) => r.data),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),

  updatePermissions: (id: string, permissions: string[]) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/permissions`, { permissions }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/users/${id}`).then((r) => r.data),

  permissionCatalog: () => apiClient.get<ApiEnvelope<{ permissions: string[] }>>("/admin/permissions").then((r) => r.data),
};
