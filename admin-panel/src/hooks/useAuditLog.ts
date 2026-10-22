import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "@/api/auditLog";

export function useAuditLogs(params: { userId?: string; route?: string; method?: string; page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ["audit-logs", params], queryFn: () => auditLogApi.list(params), select: (r) => r.data, placeholderData: (p) => p });
}
