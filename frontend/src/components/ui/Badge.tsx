import { cn } from "@/lib/utils";

// Keyed by the backend's exact order/payment status strings.
const statusColors: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Confirmed: "bg-surface-muted text-accent",
  Packed: "bg-surface-muted text-accent",
  Shipped: "bg-info-soft text-info",
  "Out For Delivery": "bg-info-soft text-info",
  Delivered: "bg-success-soft text-success",
  Cancelled: "bg-danger-soft text-danger",
  Returned: "bg-danger-soft text-danger",
  Refunded: "bg-surface-muted text-fg-soft",
  "Partially Refunded": "bg-surface-muted text-fg-soft",
  Paid: "bg-success-soft text-success",
  Failed: "bg-danger-soft text-danger",
};

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  const colorClass = typeof children === "string" ? statusColors[children] : undefined;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-label font-semibold tracking-wide",
        colorClass || "bg-surface-muted text-fg-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
