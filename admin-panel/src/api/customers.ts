import { apiClient } from "./client";
import type { ApiEnvelope, AdminUser, Pagination, CustomerType, LedgerEntry } from "@/types";

export interface CustomerListParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: string;
  isActive?: boolean;
  customerType?: string;
  /** Business verification status (unverified / pending / verified / rejected). */
  verification?: string;
}

export const customersApi = {
  list: (params: CustomerListParams = {}) =>
    apiClient.get<ApiEnvelope<{ users: AdminUser[]; pagination: Pagination }>>("/admin/users", { params }).then((r) => r.data),

  byId: (id: string) => apiClient.get<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}`).then((r) => r.data),

  updateStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),

  updateBusiness: (id: string, values: { verification?: string; note?: string; creditLimit?: number; businessName?: string; gstin?: string }) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/business`, values).then((r) => r.data),

  ledger: (id: string) => apiClient.get<ApiEnvelope<{ entries: LedgerEntry[] }>>(`/admin/users/${id}/ledger`).then((r) => r.data),

  adjustLedger: (id: string, values: { kind: "wallet" | "points"; amount: number; note: string }) =>
    apiClient.post<ApiEnvelope<{ walletBalance: number; rewardPoints: number }>>(`/admin/users/${id}/ledger`, values).then((r) => r.data),

  updateCustomerType: (id: string, customerType: CustomerType) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/customer-type`, { customerType }).then((r) => r.data),

  updatePermissions: (id: string, permissions: string[]) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/permissions`, { permissions }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/users/${id}`).then((r) => r.data),

  permissionCatalog: () => apiClient.get<ApiEnvelope<{ permissions: string[] }>>("/admin/permissions").then((r) => r.data),
};
