import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useBrandLogo } from "@/hooks/useBrand";
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
  Palette,
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
  Warehouse as WarehouseIcon,
  CreditCard,
  LifeBuoy,
  LineChart,
  RotateCcw,
  Layers,
  BadgePercent,
  IndianRupee,
  Truck,
  CircleUser,
  Tags,
  Barcode,
  Cloud,
} from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { canView } from "@/lib/permissions";
import type { PermissionResource } from "@/types";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard; resource: PermissionResource };

/** Wholesale admin menu, in the order the team works through it. */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, resource: "Dashboard" }] },
  {
    label: "Sales",
    items: [
      { label: "Orders", to: "/orders", icon: ShoppingCart, resource: "Orders" },
      { label: "Business customers", to: "/customers", icon: Users, resource: "Customers" },
      { label: "Transactions", to: "/transactions", icon: CreditCard, resource: "Orders" },
      { label: "Returns & refunds", to: "/returns", icon: RotateCcw, resource: "Orders" },
      { label: "Support", to: "/support", icon: LifeBuoy, resource: "Customers" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", to: "/products", icon: Package, resource: "Products" },
      { label: "Main Categories", to: "/categories/main", icon: FolderTree, resource: "Categories" },
      { label: "Sub Categories", to: "/categories/sub", icon: Layers, resource: "Categories" },
      { label: "Collections & Tags", to: "/catalog/collections", icon: Tags, resource: "Products" },
      { label: "Brands", to: "/brands", icon: Tag, resource: "Brands" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Stock & ledger", to: "/inventory", icon: Boxes, resource: "Inventory" },
      { label: "Warehouses & transfers", to: "/warehouses", icon: WarehouseIcon, resource: "Warehouse" },
      { label: "Barcode labels", to: "/inventory/barcodes", icon: Barcode, resource: "Inventory" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Offers", to: "/offers", icon: BadgePercent, resource: "Coupons" },
      { label: "Coupons", to: "/coupons", icon: Ticket, resource: "Coupons" },
      { label: "Banners", to: "/marketing/category-banners", icon: Images, resource: "Settings" },
      { label: "Homepage Builder", to: "/cms/home-sections", icon: LayoutTemplate, resource: "Settings" },
      { label: "Notifications", to: "/notifications", icon: Bell, resource: "Notifications" },
      { label: "Reviews", to: "/reviews", icon: Star, resource: "Reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Gallery", to: "/media", icon: ImageIcon, resource: "Settings" },
      { label: "CMS Pages", to: "/cms/pages", icon: FileText, resource: "Settings" },
      { label: "Blog", to: "/blogs", icon: Newspaper, resource: "Blogs" },
      { label: "Announcement Bar", to: "/cms/announcement-bar", icon: Megaphone, resource: "Settings" },
    ],
  },
  {
    label: "Wholesale rules",
    items: [
      { label: "Minimum Order Settings", to: "/settings/minimum-order", icon: IndianRupee, resource: "Settings" },
      { label: "Delivery Charges", to: "/settings/delivery", icon: Truck, resource: "Settings" },
      { label: "Cloudinary & media", to: "/settings/cloudinary", icon: Cloud, resource: "Settings" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", to: "/reports", icon: BarChart3, resource: "Reports" },
      { label: "Analytics", to: "/analytics", icon: LineChart, resource: "Reports" },
      { label: "Audit log", to: "/audit-log", icon: ScrollText, resource: "Settings" },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Users", to: "/staff", icon: UserCog, resource: "Users" },
      { label: "Roles", to: "/roles", icon: ShieldCheck, resource: "Roles" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", to: "/settings", icon: Settings, resource: "Settings" },
      { label: "Brand Management", to: "/settings/brand", icon: Palette, resource: "Settings" },
      { label: "Profile", to: "/profile", icon: CircleUser, resource: "Dashboard" },
    ],
  },
];

/** The menu item for a path: the longest matching link wins (/settings vs /settings/delivery). */
const activeTo = (pathname: string) =>
  NAV_GROUPS.flatMap((g) => g.items)
    .map((i) => i.to)
    .filter((to) => pathname === to || pathname.startsWith(to + "/") || (to === "/categories/main" && pathname === "/categories"))
    .sort((a, b) => b.length - a.length)[0];

export function Sidebar() {
  const adminLogo = useBrandLogo("adminLogo");
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
      <div className="flex h-20 items-center justify-between px-5">
        <span className="flex items-center gap-3">
          <span className="flex h-12 items-center rounded-xl bg-white/95 px-2.5 shadow-sm">
            <img src={adminLogo} alt="" width={1264} height={843} className="h-9 w-auto object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e2c4a6]">Wholesale</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">ERP admin</span>
          </span>
        </span>
        <button
          className="text-white/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-6 pt-2">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a27e]/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeTo(pathname) === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#d4af37]"
                        : "text-white/65 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon size={16} className={active ? "text-[#e2c4a6]" : ""} />
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
      <aside className="hidden w-[264px] flex-none bg-gradient-to-b from-[#3a1424] via-[#2c0f1b] to-[#1f0b13] lg:block print:hidden">
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
            "absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-[#3a1424] via-[#2c0f1b] to-[#1f0b13] transition-transform duration-200",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </div>
      </div>
    </>
  );
}
