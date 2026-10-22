import { apiClient } from "./client";
import type { ApiEnvelope, AuditLog } from "@/types";

export const auditLogApi = {
  list: (params: { userId?: string; route?: string; method?: string; page?: number; limit?: number } = {}) =>
    apiClient
      .get<ApiEnvelope<{ logs: AuditLog[]; total: number; page: number; totalPages: number }>>("/admin/audit-logs", { params })
      .then((r) => r.data),
};
