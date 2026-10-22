import { apiClient } from "./client";
import type { ApiEnvelope, PermissionAction, PermissionEntry, PermissionResource, Role } from "@/types";

export interface RoleFormValues {
  name: string;
  description?: string;
  permissions: PermissionEntry[];
}

export const rolesApi = {
  list: () =>
    apiClient
      .get<
        ApiEnvelope<{ roles: Role[]; resources: PermissionResource[]; actions: PermissionAction[] }>
      >("/roles")
      .then((r) => r.data),

  byId: (id: string) =>
    apiClient.get<ApiEnvelope<{ role: Role }>>(`/roles/${id}`).then((r) => r.data),

  create: (values: RoleFormValues) =>
    apiClient.post<ApiEnvelope<{ role: Role }>>("/roles", values).then((r) => r.data),

  update: (id: string, values: Partial<RoleFormValues>) =>
    apiClient.put<ApiEnvelope<{ role: Role }>>(`/roles/${id}`, values).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/roles/${id}`).then((r) => r.data),
};
