import { Link } from "react-router-dom";
import { Bell, Trash2 } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { formatDateTime, cn } from "@/lib/utils";

export function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();
  const notifications = data?.notifications || [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-semibold text-fg">
          Notifications
          {!!data?.unreadCount && <span className="ml-2 align-middle font-sans text-sm font-normal text-accent">{data.unreadCount} unread</span>}
        </h2>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => markAllRead.mutate()} disabled={!data?.unreadCount}>
              Mark all read
            </Button>
            <Button size="sm" variant="ghost" onClick={() => clearAll.mutate()}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" strokeWidth={1.25} />} title="You're all caught up" description="Order updates and offers will appear here." />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {notifications.map((n) => (
            <li
              key={n._id}
              onClick={() => !n.isRead && markRead.mutate(n._id)}
              className={cn("flex cursor-pointer items-start justify-between gap-3 p-4 sm:p-5", !n.isRead && "bg-canvas")}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className={cn("mt-1.5 h-2 w-2 flex-none rounded-full", n.isRead ? "bg-transparent" : "bg-accent-soft")} />
                <div className="min-w-0">
                  <p className={cn("text-sm text-fg", !n.isRead && "font-semibold")}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-fg-muted">{n.message}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                    {formatDateTime(n.createdAt)}
                    {n.relatedOrder && (
                      <Link to={`/account/orders/${n.relatedOrder}`} onClick={(e) => e.stopPropagation()} className="font-medium text-fg underline underline-offset-2">
                        View order
                      </Link>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification.mutate(n._id);
                }}
                aria-label="Delete notification"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-fg-muted hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
