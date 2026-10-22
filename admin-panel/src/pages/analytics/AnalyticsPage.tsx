import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardApi } from "@/api/dashboard";
import { useCategoryAnalytics, useDashboardStats, useTopCustomers, useTopProducts } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatCurrency, formatNumber } from "@/lib/utils";

const axis = { fontSize: 11, fill: "#71717a" };
const tooltipStyle = { borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 };

/** Revenue, orders, customers, monthly sales, top products and top categories. */
export function AnalyticsPage() {
  const [months, setMonths] = useState(12);
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const monthly = useQuery({
    queryKey: ["analytics-monthly", months],
    queryFn: () => dashboardApi.monthlyRevenue(months),
    select: (r) => r.data.monthlyRevenue,
  });
  const { data: topProducts } = useTopProducts();
  const { data: categories } = useCategoryAnalytics();
  const { data: topCustomers } = useTopCustomers(10);

  const periodRevenue = (monthly.data ?? []).reduce((s, m) => s + m.totalRevenue, 0);
  const periodOrders = (monthly.data ?? []).reduce((s, m) => s + m.orderCount, 0);
  const aov = periodOrders ? periodRevenue / periodOrders : 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Sales performance across your store"
        action={
          <Select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-40">
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={`Revenue · ${months} mo`} value={formatCurrency(periodRevenue)} icon={<DollarSign size={15} />} isLoading={monthly.isLoading} />
        <StatCard label={`Orders · ${months} mo`} value={formatNumber(periodOrders)} icon={<ShoppingCart size={15} />} isLoading={monthly.isLoading} />
        <StatCard label="Average order value" value={formatCurrency(aov)} icon={<TrendingUp size={15} />} isLoading={monthly.isLoading} />
        <StatCard label="Customers" value={formatNumber(stats?.totalCustomers)} icon={<Users size={15} />} isLoading={loadingStats} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Monthly sales" description="Paid revenue per month" />
          <CardBody>
            {monthly.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !monthly.data?.length ? (
              <EmptyState title="No sales in this period" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthly.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="_id" tick={axis} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [formatCurrency(Number(v)), "Revenue"]} />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#09090b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Orders" description="Paid orders per month" />
          <CardBody>
            {monthly.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !monthly.data?.length ? (
              <EmptyState title="No orders in this period" className="py-10" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="_id" tick={axis} tickLine={false} axisLine={{ stroke: "#e4e4e7" }} />
                  <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [String(v), "Orders"]} />
                  <Bar dataKey="orderCount" fill="#09090b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Top products" />
          <CardBody className="p-0">
            {!topProducts ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : topProducts.length === 0 ? (
              <EmptyState title="No sales yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {topProducts.slice(0, 10).map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span className="truncate">{p.title}</span>
                    <span className="flex-none text-right font-mono text-xs text-muted">
                      {p.totalSold ?? p.salesCount} sold{p.totalRevenue ? ` · ${formatCurrency(p.totalRevenue)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top categories" />
          <CardBody className="p-0">
            {!categories ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : categories.length === 0 ? (
              <EmptyState title="No category sales yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {[...categories].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10).map((c) => (
                  <li key={c.categoryId} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span className="truncate">{c.categoryName}</span>
                    <span className="flex-none font-mono text-xs text-muted">{c.unitsSold} units · {formatCurrency(c.totalRevenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top customers" />
          <CardBody className="p-0">
            {!topCustomers ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : topCustomers.length === 0 ? (
              <EmptyState title="No customer data yet" className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {topCustomers.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <span className="truncate">{c.name}<span className="ml-1 text-xs text-muted">{c.orderCount} orders</span></span>
                    <span className="flex-none font-mono text-xs">{formatCurrency(c.totalSpent)}</span>
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
