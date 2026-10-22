import { NavLink, Outlet } from "react-router-dom";
import { Bell, Heart, LayoutDashboard, LogOut, MapPin, Package, RotateCcw, TicketPercent, Truck, User } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import { Seo } from "@/components/common/Seo";

const LINKS = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/track-order", label: "Track Order", icon: Truck },
  { to: "/account/returns", label: "Returns", icon: RotateCcw },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
];

export function AccountLayout() {
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const { data: notif } = useNotifications({ limit: 1 });
  const unread = notif?.unreadCount ?? 0;

  return (
    <div className="container-x py-8 sm:py-12">
      <Seo title="My Account" noindex />
      <div className="relative overflow-hidden rounded-panel bg-primary px-6 py-8 text-fg-inverse sm:px-10 sm:py-10">
        <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-accent-light/25" aria-hidden />
        <span className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full border border-accent-light/15" aria-hidden />
        <p className="ornament text-label font-semibold uppercase tracking-eyebrow text-accent-light">My account</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 font-sub text-sm text-fg-inverse/75">Your orders, wishlist and details — all in one place.</p>
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-[calc(var(--header-h,89px)+28px)] lg:self-start lg:rounded-card lg:border lg:border-border lg:bg-surface lg:p-3 lg:shadow-soft">
          <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-none items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-xl lg:border-0 lg:py-3",
                    isActive
                      ? "border-primary bg-primary text-fg-inverse lg:bg-surface-muted lg:font-semibold lg:text-primary lg:before:absolute lg:before:inset-y-2.5 lg:before:left-0 lg:before:w-[3px] lg:before:rounded-full lg:before:bg-accent-soft"
                      : "border-border bg-surface text-fg-soft hover:text-fg lg:bg-transparent lg:hover:bg-surface-muted/60",
                  )
                }
              >
                <Icon size={16} strokeWidth={1.5} aria-hidden />
                {label}
                {label === "Notifications" && unread > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold text-fg-inverse" aria-label={`${unread} unread`}>{unread}</span>
                )}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex flex-none items-center gap-3 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm text-danger lg:mt-2 lg:rounded-xl lg:border-0 lg:bg-transparent lg:py-3 lg:hover:bg-danger-soft"
            >
              <LogOut size={16} strokeWidth={1.5} aria-hidden />
              Log out
            </button>
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
