import { Link } from "react-router-dom";
import { ArrowRight, Heart, MapPin, Package, User } from "lucide-react";
import { useMyOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddresses } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/auth.store";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import { OrderCard } from "@/components/account/OrderCard";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading } = useMyOrders();
  const { data: wishlist } = useWishlist();
  const { data: addresses } = useAddresses();

  const active = (orders ?? []).filter((o) => !["Delivered", "Cancelled", "Returned", "Refunded"].includes(o.orderStatus)).length;
  const tiles = [
    { to: "/account/orders", icon: Package, label: "Orders", value: orders?.length ?? "—", note: active ? `${active} in progress` : "View history" },
    { to: "/account/wishlist", icon: Heart, label: "Wishlist", value: wishlist?.length ?? "—", note: "Saved pieces" },
    { to: "/account/addresses", icon: MapPin, label: "Addresses", value: addresses?.length ?? "—", note: "Manage delivery" },
    { to: "/account/profile", icon: User, label: "Profile", value: "", note: user?.mobile ? `+91 ${user.mobile}` : user?.email || "Your details" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map(({ to, icon: Icon, label, value, note }) => (
          <Link key={to} to={to} className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary">
            <Icon size={20} strokeWidth={1.25} className="text-accent" />
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-fg">{label}</span>
              {value !== "" && <span className="font-display text-2xl font-semibold text-fg">{value}</span>}
            </p>
            <p className="mt-0.5 truncate text-xs text-fg-muted">{note}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold text-fg">Recent orders</h2>
          {!!orders?.length && (
            <Link to="/account/orders" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-label text-accent hover:text-fg">
              View all <ArrowRight size={13} />
            </Link>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 2).map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="font-display text-2xl text-fg">No orders yet</p>
            <p className="mt-1 text-sm text-fg-muted">Your first sparkle is a click away.</p>
            <Link to="/products" className={buttonClasses({ className: "mt-5" })}>
              Start shopping
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
