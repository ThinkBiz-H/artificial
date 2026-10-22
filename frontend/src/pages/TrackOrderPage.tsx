import { Link, useLocation } from "react-router-dom";
import { PackageSearch, Truck } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useMyOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { Seo } from "@/components/common/Seo";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderTracker } from "@/components/account/OrderTracker";

const ACTIVE = ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery"];

/** Track Order — shows live progress for the customer's open orders (tracking is per-account in the API). */
export function TrackOrderPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const location = useLocation();
  const { data: orders, isLoading, isError, refetch } = useMyOrders();
  const active = (orders ?? []).filter((o) => ACTIVE.includes(o.orderStatus));
  const crumbs = [{ name: "Home", path: "/" }, { name: "Track order", path: "/track-order" }];

  return (
    <>
      <Seo title="Track your order" description="Follow your jewellery from our studio to your doorstep." canonicalPath="/track-order" />
      <PageHeader eyebrow="Customer care" title="Track Your Order" description="Follow every step — from packing to your doorstep." crumbs={crumbs} />
      <div className="container-x py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          {isInitializing ? null : !isAuthenticated ? (
            <EmptyState
              icon={<PackageSearch className="h-7 w-7" strokeWidth={1.25} />}
              title="Log in to track your orders"
              description="Use the mobile number you ordered with — we'll show every order and its live status."
              action={
                <Link to="/login" state={{ from: location.pathname }} className={buttonClasses()}>
                  Log in with OTP
                </Link>
              }
            />
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-card" />
              <Skeleton className="h-48 w-full rounded-card" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : active.length === 0 ? (
            <EmptyState
              icon={<Truck className="h-7 w-7" strokeWidth={1.25} />}
              title="No orders on the way"
              description="Your delivered and past orders are in My Orders."
              action={
                <Link to="/account/orders" className={buttonClasses({ variant: "outline" })}>
                  View all orders
                </Link>
              }
            />
          ) : (
            <div className="space-y-5">
              {active.map((order) => (
                <article key={order._id} className="rounded-card border border-border bg-surface p-5 shadow-soft sm:p-7">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl font-semibold text-fg">Order #{order.orderNumber}</p>
                      <p className="text-sm text-fg-muted">
                        {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"} · {formatCurrency(order.grandTotal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{order.orderStatus}</Badge>
                      <Link to={`/account/orders/${order._id}#track`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                        Details
                      </Link>
                    </div>
                  </div>
                  <OrderTracker order={order} />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
