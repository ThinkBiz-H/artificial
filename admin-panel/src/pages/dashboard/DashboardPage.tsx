import { Link } from "@tanstack/react-router";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Clock, CalendarDays, Hourglass, Activity, ScrollText } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLog";
import {
  useDashboardStats,
  useRecentOrders,
  useTopProducts,
  useLowStock,
  useSalesChart,
  useTopCustomers,
  useCategoryAnalytics,
} from "@/hooks/useDashboard";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

export function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recentOrders, isLoading: loadingOrders } = useRecentOrders();
  const { data: topProducts, isLoading: loadingTop } = useTopProducts();
  const { data: lowStock } = useLowStock();
  const { data: salesData, isLoading: loadingChart } = useSalesChart(30);
  const { data: topCustomers } = useTopCustomers(5);
  const { data: categoryAnalytics } = useCategoryAnalytics();
  const { data: activity } = useAuditLogs({ page: 1, limit: 8 });

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store's performance" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatCurrency(stats?.revenue ?? stats?.totalSales)} icon={<DollarSign size={15} />} isLoading={loadingStats} />
        <StatCard label="Total orders" value={formatNumber(stats?.totalOrders)} icon={<ShoppingCart size={15} />} isLoading={loadingStats} />
        <StatCard label="Total customers" value={formatNumber(stats?.totalCustomers)} icon={<Users size={15} />} isLoading={loadingStats} />
        <StatCard label="Total products" value={formatNumber(stats?.totalProducts)} icon={<Package size={15} />} isLoading={loadingStats} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's revenue" value={formatCurrency(stats?.todaySales)} icon={<CalendarDays size={15} />} isLoading={loadingStats} />
        <StatCard label="Today's orders" value={formatNumber(stats?.todayOrders)} icon={<ShoppingCart size={15} />} isLoading={loadingStats} />
        <StatCard label="Pending orders" value={<Link to="/orders" className="hover:underline">{formatNumber(stats?.pendingOrders)}</Link>} icon={<Hourglass size={15} />} isLoading={loadingStats} />
        <StatCard label="Active users (24h)" value={formatNumber(stats?.activeUsers)} icon={<Activity size={15} />} isLoading={loadingStats} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Sales trend" description="Last 30 days" />
          <CardBody>
            {loadingChart ? (
              <Skeleton className="h-64 w-full" />
            ) : !salesData || salesData.length === 0 ? (
              <EmptyState title="No sales data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
                    formatter={(value: unknown, name: unknown) => [name === "totalSales" ? formatCurrency(Number(value)) : String(value), name === "totalSales" ? "Revenue" : "Orders"]}
                  />
                  <Line type="monotone" dataKey="totalSales" stroke="#09090b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Low stock alerts" />
          <CardBody className="p-0">
            {!lowStock ? (
              <div className="p-5"><Skeleton className="h-32 w-full" /></div>
            ) : lowStock.products.length === 0 && lowStock.variants.length === 0 ? (
              <EmptyState icon={<AlertTriangle size={18} />} title="Stock levels are healthy" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.products.slice(0, 6).map((p) => (
                  <li key={p._id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <Link to="/products/$productId/edit" params={{ productId: p._id }} className="truncate text-ink hover:underline">
                      {p.title}
                    </Link>
                    <Badge tone="warning">{p.stock} left</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent orders" action={<Link to="/orders" className="text-xs font-medium text-ink hover:underline">View all</Link>} />
          <CardBody className="p-0">
            {loadingOrders ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <EmptyState icon={<Clock size={18} />} title="No orders yet" className="py-10" />
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recentOrders.map((order) => {
                    const customer = (typeof order.user === "object" ? order.user?.name : undefined) ?? "—";
                    return (
                      <Tr key={order._id}>
                        <Td>
                          <Link to="/orders/$orderId" params={{ orderId: order._id }} className="font-mono text-xs hover:underline">
                            {order.orderNumber}
                          </Link>
                        </Td>
                        <Td className="text-sm">{customer}</Td>
                        <Td><Badge>{order.orderStatus}</Badge></Td>
                        <Td className="text-right font-mono text-xs">{formatCurrency(order.grandTotal)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top products" />
          <CardBody className="p-0">
            {loadingTop ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : !topProducts || topProducts.length === 0 ? (
              <EmptyState title="No sales yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {topProducts.slice(0, 6).map((p) => (
                  <li key={p._id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="truncate text-ink">{p.title}</span>
                    <span className="flex-none font-mono text-xs text-muted">{p.totalSold ?? p.salesCount} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top customers" />
          <CardBody className="p-0">
            {!topCustomers ? (
              <div className="p-5"><Skeleton className="h-32 w-full" /></div>
            ) : topCustomers.length === 0 ? (
              <EmptyState title="No customer data yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {topCustomers.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="text-ink">{c.name}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </div>
                    <span className="font-mono text-xs">{formatCurrency(c.totalSpent)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Revenue by category" />
          <CardBody>
            {!categoryAnalytics ? (
              <Skeleton className="h-56 w-full" />
            ) : categoryAnalytics.length === 0 ? (
              <EmptyState title="No category data yet" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="categoryName" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} formatter={(v: unknown) => formatCurrency(Number(v))} />
                  <Bar dataKey="totalRevenue" fill="#09090b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Orders" description="Orders per day, last 30 days" />
          <CardBody>
            {loadingChart ? (
              <Skeleton className="h-56 w-full" />
            ) : !salesData || salesData.length === 0 ? (
              <EmptyState title="No orders yet" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#71717a" }} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }} formatter={(v: unknown) => [String(v), "Orders"]} />
                  <Bar dataKey="orderCount" fill="#09090b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Latest admin actions" action={<Link to="/audit-log" className="text-xs font-medium text-ink hover:underline">View all</Link>} />
          <CardBody className="p-0">
            {!activity ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : activity.logs.length === 0 ? (
              <EmptyState icon={<ScrollText size={18} />} title="No admin activity yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {activity.logs.map((log) => (
                  <li key={log._id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink">
                        <span className="font-medium">{typeof log.user === "object" && log.user ? log.user.name : "System"}</span>{" "}
                        <span className="font-mono text-xs text-muted">{log.method} {log.route}</span>
                      </p>
                    </div>
                    <span className="flex-none text-xs text-muted">{formatDateTime(log.createdAt)}</span>
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
