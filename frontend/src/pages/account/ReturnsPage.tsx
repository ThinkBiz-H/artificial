import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth.store";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { StartChatButton } from "@/components/common/StartChatButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

const RETURNED = ["Returned", "Refunded"];

function ReturnRow({ order, action }: { order: Order; action?: React.ReactNode }) {
  const first = order.items[0];
  const more = order.items.length - 1;
  return (
    <li className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {first?.thumbnail && <img src={first.thumbnail} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 flex-none rounded-xl object-cover" />}
        <div className="min-w-0">
          <Link to={`/account/orders/${order._id}`} className="font-display text-lg font-semibold text-fg hover:text-primary">
            Order #{order.orderNumber}
          </Link>
          <p className="truncate text-sm text-fg-muted">
            {first?.title}
            {more > 0 ? ` + ${more} more` : ""} · {formatCurrency(order.grandTotal)}
          </p>
          <p className="mt-0.5 text-xs text-fg-muted">
            {order.orderStatus === "Delivered" && order.deliveredAt ? `Delivered ${formatDate(order.deliveredAt)}` : `${order.orderStatus} · ${formatDate(order.createdAt)}`}
          </p>
        </div>
      </div>
      {action}
    </li>
  );
}

/**
 * Returns — return requests are handled by the store team (there is no
 * customer return API), so this page lists returned/refunded orders and,
 * for delivered orders, hands off to support with the order number filled in.
 */
export function ReturnsPage() {
  const { data: orders, isLoading, isError, refetch } = useMyOrders();
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-card" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const returned = (orders ?? []).filter((o) => RETURNED.includes(o.orderStatus));
  const delivered = (orders ?? []).filter((o) => o.orderStatus === "Delivered");

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-3xl font-semibold text-fg sm:text-4xl">Returns & refunds</h2>
        <p className="mt-2 max-w-xl font-sub text-sm leading-relaxed text-fg-muted">
          Need to return a piece? Reach out with your order number and our team will guide you through it.{" "}
          <Link to="/refund-policy" className="text-primary underline underline-offset-4">
            Read our returns policy
          </Link>
          .
        </p>
      </div>

      {delivered.length > 0 && (
        <section aria-labelledby="returns-eligible">
          <h3 id="returns-eligible" className="eyebrow">
            Delivered orders
          </h3>
          <ul className="mt-4 space-y-3">
            {delivered.map((o) => (
              <ReturnRow
                key={o._id}
                order={o}
                action={
                  <div className="flex flex-none flex-wrap gap-2">
                    <StartChatButton orderNumber={o.orderNumber} customerName={o.shippingAddress.fullName || user?.name || ""} />
                    <Link to={`/contact?order=${encodeURIComponent(o.orderNumber)}`} className={buttonClasses({ variant: "ghost" })}>
                      Contact us
                    </Link>
                  </div>
                }
              />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="returns-history">
        <h3 id="returns-history" className="eyebrow">
          Return history
        </h3>
        {returned.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {returned.map((o) => (
              <ReturnRow
                key={o._id}
                order={o}
                action={
                  <span className="flex-none rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                    {o.orderStatus === "Refunded" || o.paymentStatus === "Refunded" ? "Refunded" : "Returned"}
                  </span>
                }
              />
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={<RotateCcw className="h-7 w-7" strokeWidth={1.25} />}
              title="No returns yet"
              description="Returned and refunded orders will appear here."
            />
          </div>
        )}
      </section>
    </div>
  );
}
