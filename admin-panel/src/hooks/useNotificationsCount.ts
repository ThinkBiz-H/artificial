import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsSelfApi } from "@/api/notificationsSelf";
import { useAuthStore } from "@/stores/auth.store";

export function useNotifications(params: { page?: number; limit?: number } = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const query = useQuery({
    queryKey: ["self-notifications", params],
    queryFn: () => notificationsSelfApi.list(params),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    select: (r) => r.data,
  });
  return { ...query, unreadCount: query.data?.unreadCount || 0 };
}

export function useMarkSelfNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsSelfApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["self-notifications"] }),
  });
}

export function useMarkAllSelfNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsSelfApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["self-notifications"] }),
  });
}
