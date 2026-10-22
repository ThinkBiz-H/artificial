import { Link } from "react-router-dom";
import type { Order } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrderCard({ order }: { order: Order }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  const thumbs = order.items.slice(0, 3);
  const trackable = !["Cancelled", "Returned", "Refunded"].includes(order.orderStatus);

  return (
    <article className="rounded-2xl border border-border bg-surface">
      <header className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-border bg-surface-muted/60 px-5 py-4 text-xs sm:grid-cols-4">
        <div>
          <p className="text-fg-muted">Order</p>
          <p className="mt-0.5 font-semibold text-fg">#{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-fg-muted">Placed on</p>
          <p className="mt-0.5 font-medium text-fg">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-fg-muted">Total</p>
          <p className="mt-0.5 font-semibold text-fg">{formatCurrency(order.grandTotal)}</p>
        </div>
        <div>
          <p className="text-fg-muted">Payment</p>
          <p className="mt-0.5 font-medium text-fg">
            {order.paymentMethod === "cod" ? "COD" : "Online"} · <span className={order.paymentStatus === "Paid" ? "text-success" : order.paymentStatus === "Failed" ? "text-danger" : ""}>{order.paymentStatus}</span>
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {thumbs.map((item, i) => (
              <div key={i} className="h-16 w-14 overflow-hidden rounded-2xl border-2 border-fg-inverse bg-surface-muted">
                {item.thumbnail && <img src={item.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <Badge>{order.orderStatus}</Badge>
            <p className="mt-1.5 line-clamp-1 text-sm text-fg">
              {order.items[0]?.title}
              {order.items.length > 1 && <span className="text-fg-muted"> + {order.items.length - 1} more</span>}
            </p>
            <p className="text-xs text-fg-muted">
              {count} item{count === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/account/orders/${order._id}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
            View order
          </Link>
          {trackable && (
            <Link to={`/account/orders/${order._id}#track`} className={buttonClasses({ size: "sm" })}>
              Track
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
