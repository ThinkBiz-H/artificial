import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Users,
  ShoppingCart,
  Ticket,
  Star,
  Newspaper,
  FileText,
  Bell,
  Settings,
  BarChart3,
  ImageIcon,
  ScrollText,
  X,
  LayoutTemplate,
  Megaphone,
  Images,
  ShieldCheck,
  UserCog,
  Boxes,
  CreditCard,
  LifeBuoy,
  LineChart,
  RotateCcw,
} from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { canView } from "@/lib/permissions";
import type { PermissionResource } from "@/types";

const NAV_GROUPS: {
  label: string;
  items: { label: string; to: string; icon: typeof LayoutDashboard; resource: PermissionResource }[];
}[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, resource: "Dashboard" }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", to: "/products", icon: Package, resource: "Products" },
      { label: "Categories", to: "/categories", icon: FolderTree, resource: "Categories" },
      { label: "Brands", to: "/brands", icon: Tag, resource: "Brands" },
      { label: "Inventory", to: "/inventory", icon: Boxes, resource: "Inventory" },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", to: "/orders", icon: ShoppingCart, resource: "Orders" },
      { label: "Transactions", to: "/transactions", icon: CreditCard, resource: "Orders" },
      { label: "Returns & refunds", to: "/returns", icon: RotateCcw, resource: "Orders" },
      { label: "Customers", to: "/customers", icon: Users, resource: "Customers" },
      { label: "Coupons", to: "/coupons", icon: Ticket, resource: "Coupons" },
      { label: "Reviews", to: "/reviews", icon: Star, resource: "Reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", to: "/blogs", icon: Newspaper, resource: "Blogs" },
      { label: "CMS Pages", to: "/cms/pages", icon: FileText, resource: "Settings" },
      { label: "Homepage Builder", to: "/cms/home-sections", icon: LayoutTemplate, resource: "Settings" },
      { label: "Announcement Bar", to: "/cms/announcement-bar", icon: Megaphone, resource: "Settings" },
      { label: "Media Library", to: "/media", icon: ImageIcon, resource: "Settings" },
    ],
  },
  {
    label: "Marketing",
    items: [{ label: "Category Banners", to: "/marketing/category-banners", icon: Images, resource: "Settings" }],
  },
  {
    label: "Engagement",
    items: [
      { label: "Notifications", to: "/notifications", icon: Bell, resource: "Notifications" },
      { label: "Support", to: "/support", icon: LifeBuoy, resource: "Customers" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", to: "/analytics", icon: LineChart, resource: "Reports" },
      { label: "Reports", to: "/reports", icon: BarChart3, resource: "Reports" },
      { label: "Audit log", to: "/audit-log", icon: ScrollText, resource: "Settings" },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Staff", to: "/staff", icon: UserCog, resource: "Users" },
      { label: "Roles", to: "/roles", icon: ShieldCheck, resource: "Roles" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", to: "/settings", icon: Settings, resource: "Settings" }],
  },
];

export function Sidebar() {
  const isOpen = useUiStore((s) => s.isSidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Every item is filtered to what the current admin can actually View —
  // a UX convenience (see lib/permissions.ts); the real enforcement is the
  // backend's requirePermission(resource, action) on each route.
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canView(item.resource)),
  })).filter((group) => group.items.length > 0);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <span className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold uppercase tracking-[0.22em] text-brand">Swastikala</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Admin</span>
        </span>
        <button
          className="lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "text-ink-soft hover:bg-surface",
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 flex-none border-r border-border bg-white lg:block print:hidden">
        {content}
      </aside>
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-72 bg-white transition-transform duration-200",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </div>
      </div>
    </>
  );
}
