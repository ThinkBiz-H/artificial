import { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { OrderCard } from "@/components/account/OrderCard";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "In progress", match: (s: string) => ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery"].includes(s) },
  { key: "delivered", label: "Delivered", match: (s: string) => s === "Delivered" },
  { key: "cancelled", label: "Cancelled / Returned", match: (s: string) => ["Cancelled", "Returned", "Refunded"].includes(s) },
];

export function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useMyOrders();
  const [filter, setFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-7 w-7" strokeWidth={1.25} />}
        title="No orders yet"
        description="When you place an order, you'll be able to track it here."
        action={
          <Link to="/products" className={buttonClasses()}>
            Start shopping
          </Link>
        }
      />
    );
  }

  const match = FILTERS.find((f) => f.key === filter)!.match;
  const visible = orders.filter((o) => match(o.orderStatus));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold text-fg">My Orders</h2>
      </div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-none rounded-full border px-4 py-1.5 text-sm transition-colors",
              filter === f.key ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-fg-muted">No orders in this view.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
