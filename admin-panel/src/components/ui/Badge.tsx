import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Pending: "bg-warning-bg text-warning",
  Confirmed: "bg-info-bg text-info",
  Packed: "bg-info-bg text-info",
  Shipped: "bg-info-bg text-info",
  "Out For Delivery": "bg-info-bg text-info",
  Delivered: "bg-success-bg text-success",
  Cancelled: "bg-danger-bg text-danger",
  Returned: "bg-danger-bg text-danger",
  Refunded: "bg-danger-bg text-danger",
  Paid: "bg-success-bg text-success",
  Failed: "bg-danger-bg text-danger",
  active: "bg-success-bg text-success",
  inactive: "bg-surface text-muted",
  draft: "bg-surface text-muted",
  published: "bg-success-bg text-success",
  unpublished: "bg-surface text-muted",
  scheduled: "bg-warning-bg text-warning",
};

export function Badge({ children, className, tone }: { children: React.ReactNode; className?: string; tone?: "success" | "danger" | "warning" | "info" | "neutral" }) {
  const toneClass = tone
    ? { success: "bg-success-bg text-success", danger: "bg-danger-bg text-danger", warning: "bg-warning-bg text-warning", info: "bg-info-bg text-info", neutral: "bg-surface text-muted" }[tone]
    : typeof children === "string"
      ? statusColors[children]
      : undefined;

  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", toneClass || "bg-surface text-ink", className)}>
      {children}
    </span>
  );
}
