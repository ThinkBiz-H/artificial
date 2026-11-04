import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  Building2,
  CalendarDays,
  Clock,
  FolderTree,
  Hourglass,
  IndianRupee,
  Package,
  PackagePlus,
  ShoppingCart,
  Star,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useDashboardStats,
  useRecentOrders,
  useLowStock,
  useSalesChart,
  useCategoryAnalytics,
  useMonthlyRevenue,
  useLatestReviews,
} from "@/hooks/useDashboard";
import { useCustomerList } from "@/hooks/useCustomers";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const BRAND = "#5a1e36"; // --color-brand (SVG attributes can't read CSS variables)
const GOLD = "#b68b40";
const GRID = "#ece6e1";
const AXIS = { fontSize: 11, fill: "#8a7d82" };

const ORDER_TONE: Record<string, "success" | "danger" | "warning" | "info" | "neutral"> = {
  Pending: "warning",
  Confirmed: "info",
  Processing: "info",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "danger",
};

function Kpi({
  label,
  value,
  icon,
  tone = "default",
  to,
  isLoading,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: "default" | "brand" | "warning";
  to?: string;
  isLoading?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full items-start justify-between gap-3 rounded-xl border p-5 transition-shadow",
        tone === "brand" ? "border-transparent bg-brand text-white shadow-md" : "border-border bg-white hover:shadow-sm",
        tone === "warning" && "border-warning/30 bg-warning-bg",
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-xs font-medium uppercase tracking-wider", tone === "brand" ? "text-white/70" : "text-muted")}>{label}</p>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-24" />
        ) : (
          <p className={cn("mt-2 truncate text-2xl font-semibold tabular-nums", tone === "brand" ? "text-white" : "text-ink")}>{value}</p>
        )}
      </div>
      <span
        className={cn(
          "flex h-10 w-10 flex-none items-center justify-center rounded-lg",
          tone === "brand" ? "bg-white/15 text-white" : tone === "warning" ? "bg-white text-warning" : "bg-surface text-brand",
        )}
      >
        {icon}
      </span>
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

const QUICK_ACTIONS = [
  { label: "Add product", to: "/products/new", icon: PackagePlus },
  { label: "Import CSV", to: "/products", icon: Upload },
  { label: "Main categories", to: "/categories/main", icon: FolderTree },
  { label: "Create offer", to: "/offers", icon: BadgePercent },
  { label: "Inventory", to: "/inventory", icon: Boxes },
  { label: "Minimum order", to: "/settings/minimum-order", icon: IndianRupee },
];

/** Wholesale ERP overview: today, catalogue health, sales trends, latest activity. */
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recentOrders, isLoading: loadingOrders } = useRecentOrders();
  const { data: lowStock } = useLowStock();
  const { data: salesData, isLoading: loadingChart } = useSalesChart(30);
  const { data: categoryAnalytics } = useCategoryAnalytics();
  const { data: monthly } = useMonthlyRevenue(12);
  const { data: reviews } = useLatestReviews(6);
  const { data: customers } = useCustomerList({ page: 1, limit: 5, sort: "-createdAt" });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const topCategories = [...(categoryAnalytics ?? [])].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 6);
  const topRevenue = topCategories[0]?.totalRevenue || 1;
  const latestCustomers = customers?.users ?? [];

  return (
    <div className="space-y-6">
      {/* Header + quick actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-white to-surface p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {greeting}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">Here's how the wholesale business is doing today.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:w-auto">
          {QUICK_ACTIONS.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-3 text-center text-[11px] font-medium text-ink transition-colors hover:border-brand hover:text-brand"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Today */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today's orders" value={formatNumber(stats?.todayOrders)} icon={<ShoppingCart size={18} />} tone="brand" to="/orders" isLoading={loadingStats} />
        <Kpi label="Today's revenue" value={formatCurrency(stats?.todaySales)} icon={<CalendarDays size={18} />} isLoading={loadingStats} />
        <Kpi label="Pending orders" value={formatNumber(stats?.pendingOrders)} icon={<Hourglass size={18} />} to="/orders" isLoading={loadingStats} />
        <Kpi label="Total revenue" value={formatCurrency(stats?.revenue ?? stats?.totalSales)} icon={<IndianRupee size={18} />} isLoading={loadingStats} />
      </div>

      {/* Catalogue & customers */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Products" value={formatNumber(stats?.totalProducts)} icon={<Package size={18} />} to="/products" isLoading={loadingStats} />
        <Kpi
          label="Categories"
          value={
            stats?.totalCategories !== undefined ? (
              <>
                {formatNumber(stats.mainCategories)} <span className="text-sm font-normal text-muted">main · {formatNumber((stats.totalCategories ?? 0) - (stats.mainCategories ?? 0))} sub</span>
              </>
            ) : (
              "—"
            )
          }
          icon={<FolderTree size={18} />}
          to="/categories/main"
          isLoading={loadingStats}
        />
        <Kpi
          label="Customers · wholesale buyers"
          value={
            <>
              {formatNumber(stats?.totalCustomers)} <span className="text-sm font-normal text-muted">· {formatNumber(stats?.wholesaleBuyers ?? 0)} with GST / business</span>
            </>
          }
          icon={<Building2 size={18} />}
          to="/customers"
          isLoading={loadingStats}
        />
        <Kpi
          label="Low stock"
          value={formatNumber(stats?.lowStockCount ?? lowStock?.products.length ?? 0)}
          icon={<AlertTriangle size={18} />}
          tone={(stats?.lowStockCount ?? 0) > 0 ? "warning" : "default"}
          to="/inventory"
          isLoading={loadingStats}
        />
      </div>

      {/* Revenue graph + top categories */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue" description="Paid orders, last 30 days" />
          <CardBody>
            {loadingChart ? (
              <Skeleton className="h-64 w-full" />
            ) : !salesData?.length ? (
              <EmptyState title="No sales in the last 30 days" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="_id" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }}
                    formatter={(value: unknown, name: unknown) => [name === "totalSales" ? formatCurrency(Number(value)) : String(value), name === "totalSales" ? "Revenue" : "Orders"]}
                  />
                  <Area type="monotone" dataKey="totalSales" stroke={BRAND} strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top selling categories" description="By revenue" />
          <CardBody>
            {!categoryAnalytics ? (
              <Skeleton className="h-56 w-full" />
            ) : !topCategories.length ? (
              <EmptyState title="No category sales yet" className="py-10" />
            ) : (
              <ul className="space-y-4">
                {topCategories.map((c) => (
                  <li key={c.categoryName}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-ink">{c.categoryName}</span>
                      <span className="font-mono text-xs text-muted">{formatCurrency(c.totalRevenue)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-[#b68b40]" style={{ width: `${Math.max(4, (c.totalRevenue / topRevenue) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Monthly sales + low stock */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Monthly sales" description="Revenue per month, last 12 months" />
          <CardBody>
            {!monthly ? (
              <Skeleton className="h-56 w-full" />
            ) : !monthly.length ? (
              <EmptyState title="No monthly data yet" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="_id" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }} formatter={(v: unknown) => [formatCurrency(Number(v)), "Revenue"]} />
                  <Bar dataKey="totalRevenue" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Low stock" action={<Link to="/inventory" className="text-xs font-medium text-brand hover:underline">Inventory</Link>} />
          <CardBody className="p-0">
            {!lowStock ? (
              <div className="p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : lowStock.products.length === 0 && lowStock.variants.length === 0 ? (
              <EmptyState icon={<AlertTriangle size={18} />} title="Stock levels are healthy" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.products.slice(0, 7).map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <Link to="/products/$productId/edit" params={{ productId: p._id }} className="truncate text-ink hover:underline">
                      {p.title}
                    </Link>
                    <Badge tone={p.stock <= 0 ? "danger" : "warning"}>{p.stock <= 0 ? "Out of stock" : `${p.stock} left`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader title="Recent orders" action={<Link to="/orders" className="text-xs font-medium text-brand hover:underline">View all</Link>} />
        <CardBody className="p-0">
          {loadingOrders ? (
            <div className="p-5">
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !recentOrders?.length ? (
            <EmptyState icon={<Clock size={18} />} title="No orders yet" className="py-10" />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Buyer</Th>
                  <Th>Date</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </Thead>
              <Tbody>
                {recentOrders.map((order) => {
                  const customer = (typeof order.user === "object" ? order.user?.name : undefined) ?? order.shippingAddress?.fullName ?? "—";
                  return (
                    <Tr key={order._id}>
                      <Td>
                        <Link to="/orders/$orderId" params={{ orderId: order._id }} className="font-mono text-xs text-brand hover:underline">
                          {order.orderNumber}
                        </Link>
                      </Td>
                      <Td className="text-sm">
                        {order.business?.name || customer}
                        {order.business?.name && <span className="block text-xs text-muted">{customer}</span>}
                      </Td>
                      <Td className="text-xs text-muted">{formatDate(order.createdAt)}</Td>
                      <Td>
                        <Badge tone={order.paymentStatus === "Paid" ? "success" : "neutral"}>{order.paymentStatus}</Badge>
                      </Td>
                      <Td>
                        <Badge tone={ORDER_TONE[order.orderStatus] ?? "neutral"}>{order.orderStatus}</Badge>
                      </Td>
                      <Td className="text-right font-mono text-sm">{formatCurrency(order.grandTotal)}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Latest reviews + latest customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Latest reviews" action={<Link to="/reviews" className="text-xs font-medium text-brand hover:underline">All reviews</Link>} />
          <CardBody className="p-0">
            {!reviews ? (
              <div className="p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !reviews.length ? (
              <EmptyState icon={<Star size={18} />} title="No reviews yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {reviews.map((r) => (
                  <li key={r._id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-ink">{r.product.title}</p>
                      <span className="flex flex-none items-center gap-0.5 text-xs font-semibold text-warning">
                        {r.rating} <Star size={11} className="fill-current" />
                      </span>
                    </div>
                    {r.comment && <p className="mt-0.5 line-clamp-1 text-xs text-muted">“{r.comment}”</p>}
                    <p className="mt-0.5 text-[11px] text-muted-light">
                      {r.userName} · {formatDate(r.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Latest customers" action={<Link to="/customers" className="text-xs font-medium text-brand hover:underline">All customers</Link>} />
          <CardBody className="p-0">
            {!customers ? (
              <div className="p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !latestCustomers.length ? (
              <EmptyState icon={<Users size={18} />} title="No customers yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {latestCustomers.map((c) => (
                  <li key={c._id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface text-sm font-semibold text-brand">
                      {(c.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link to="/customers/$customerId" params={{ customerId: c._id }} className="truncate text-sm font-medium text-ink hover:underline">
                        {c.name || "Unnamed"}
                      </Link>
                      <p className="truncate text-xs text-muted">{c.mobile || c.email}</p>
                    </div>
                    <span className="flex flex-none items-center gap-1 text-xs text-muted">
                      <UserPlus size={12} /> {formatDate(c.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
