import { Check, ExternalLink, PackageX, Truck } from "lucide-react";
import type { Order } from "@/types";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

/** The backend's forward order statuses, in order (Order.orderStatus). */
const FLOW: { status: Order["orderStatus"]; label: string }[] = [
  { status: "Pending", label: "Order placed" },
  { status: "Confirmed", label: "Confirmed" },
  { status: "Packed", label: "Packed" },
  { status: "Shipped", label: "Shipped" },
  { status: "Out For Delivery", label: "Out for delivery" },
  { status: "Delivered", label: "Delivered" },
];

const TERMINAL = ["Cancelled", "Returned", "Refunded"];

interface LiveActivity {
  date?: string;
  activity?: string;
  location?: string;
  status?: string;
  ["sr-status-label"]?: string;
}

/** Pulls scan events out of Shiprocket's track-by-AWB payload (shape varies by courier). */
export function extractLiveActivities(live: unknown): LiveActivity[] {
  if (!live || typeof live !== "object") return [];
  const field = (o: unknown, k: string): unknown => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined);
  const l = live as Record<string, unknown>;
  const data = field(l, "tracking_data") ?? field(l[Object.keys(l)[0]], "tracking_data") ?? l;
  const acts = field(data, "shipment_track_activities");
  return Array.isArray(acts) ? (acts as LiveActivity[]) : [];
}

export function OrderTracker({ order, live }: { order: Order; live?: unknown }) {
  const terminal = TERMINAL.includes(order.orderStatus);
  const currentIndex = FLOW.findIndex((s) => s.status === order.orderStatus);
  const reached = (i: number) => !terminal && i <= currentIndex;
  const when = (status: string) => {
    const entry = [...(order.statusHistory ?? [])].reverse().find((h) => h.status === status);
    return entry?.changedAt ?? (status === "Pending" ? order.createdAt : undefined);
  };
  const activities = extractLiveActivities(live);
  const tracking = order.tracking;
  const courier = order.courier?.courierName || order.courier?.partner;

  return (
    <div>
      {terminal ? (
        <div className="flex items-start gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          <PackageX size={20} strokeWidth={1.5} className="flex-none" />
          <div>
            <p className="font-semibold">Order {order.orderStatus.toLowerCase()}</p>
            {order.cancelReason && <p className="mt-0.5 text-fg-soft">Reason: {order.cancelReason}</p>}
            {order.cancelledAt && <p className="mt-0.5 text-fg-soft">{formatDateTime(order.cancelledAt)}</p>}
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal on desktop, vertical on mobile */}
          <ol className="hidden items-start sm:flex">
            {FLOW.map((step, i) => (
              <li key={step.status} className="relative flex flex-1 flex-col items-center text-center">
                {i > 0 && <span className={cn("absolute right-1/2 top-3.5 h-0.5 w-full", reached(i) ? "bg-primary" : "bg-border")} aria-hidden />}
                <span
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2",
                    reached(i) ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface",
                    i === currentIndex && "ring-4 ring-accent-soft/25",
                  )}
                >
                  {reached(i) && <Check size={13} strokeWidth={3} />}
                </span>
                <span className={cn("mt-2.5 text-xs font-medium", reached(i) ? "text-fg" : "text-fg-muted")}>{step.label}</span>
                {reached(i) && when(step.status) && <span className="mt-0.5 text-label text-fg-muted">{formatDate(when(step.status))}</span>}
              </li>
            ))}
          </ol>
          <ol className="space-y-0 sm:hidden">
            {FLOW.map((step, i) => (
              <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
                {i < FLOW.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5", reached(i + 1) ? "bg-primary" : "bg-border")} aria-hidden />}
                <span className={cn("relative z-10 flex h-7 w-7 flex-none items-center justify-center rounded-full border-2", reached(i) ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface")}>
                  {reached(i) && <Check size={13} strokeWidth={3} />}
                </span>
                <div className="pt-0.5">
                  <p className={cn("text-sm font-medium", reached(i) ? "text-fg" : "text-fg-muted")}>{step.label}</p>
                  {reached(i) && when(step.status) && <p className="text-xs text-fg-muted">{formatDateTime(when(step.status))}</p>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {(tracking?.number || courier || tracking?.estimatedDeliveryDate) && (
        <div className="mt-6 grid gap-4 rounded-2xl bg-surface-muted p-4 text-sm sm:grid-cols-3">
          {courier && (
            <div>
              <p className="text-xs text-fg-muted">Courier</p>
              <p className="mt-0.5 font-medium text-fg">{courier}</p>
            </div>
          )}
          {tracking?.number && (
            <div>
              <p className="text-xs text-fg-muted">Tracking number</p>
              <p className="mt-0.5 font-medium text-fg">{tracking.number}</p>
            </div>
          )}
          {tracking?.estimatedDeliveryDate && !terminal && order.orderStatus !== "Delivered" && (
            <div>
              <p className="text-xs text-fg-muted">Estimated delivery</p>
              <p className="mt-0.5 font-medium text-fg">{formatDate(tracking.estimatedDeliveryDate)}</p>
            </div>
          )}
          {tracking?.url && (
            <a
              href={tracking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg underline underline-offset-4 sm:col-span-3"
            >
              <Truck size={15} /> Track with courier <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-label text-fg">Shipment updates</p>
          <ul className="mt-3 space-y-3 border-l border-border pl-4">
            {activities.slice(0, 12).map((a, i) => (
              <li key={i} className="relative text-sm">
                <span className={cn("absolute -left-[21px] top-1.5 h-2 w-2 rounded-full", i === 0 ? "bg-accent-soft" : "bg-border-strong")} />
                <p className="text-fg">{a["sr-status-label"] || a.activity || a.status}</p>
                <p className="text-xs text-fg-muted">
                  {[a.location, a.date && formatDateTime(a.date)].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
