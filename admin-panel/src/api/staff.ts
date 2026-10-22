import { apiClient } from "./client";
import type { ApiEnvelope, PermissionEntry, StaffAccount } from "@/types";

export interface StaffFormValues {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  roleRef?: string | null;
  customPermissions?: PermissionEntry[];
  isActive?: boolean;
}

export const staffApi = {
  list: () =>
    apiClient.get<ApiEnvelope<{ staff: StaffAccount[] }>>("/staff").then((r) => r.data),

  byId: (id: string) =>
    apiClient.get<ApiEnvelope<{ staff: StaffAccount }>>(`/staff/${id}`).then((r) => r.data),

  create: (values: StaffFormValues) =>
    apiClient.post<ApiEnvelope<{ staff: StaffAccount }>>("/staff", values).then((r) => r.data),

  update: (id: string, values: Partial<StaffFormValues>) =>
    apiClient.put<ApiEnvelope<{ staff: StaffAccount }>>(`/staff/${id}`, values).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/staff/${id}`).then((r) => r.data),
};
