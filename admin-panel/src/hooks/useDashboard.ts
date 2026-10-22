import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => dashboardApi.stats(), select: (r) => r.data });
}
export function useRecentOrders() {
  return useQuery({ queryKey: ["dashboard", "recent-orders"], queryFn: () => dashboardApi.recentOrders(), select: (r) => r.data.orders });
}
export function useTopProducts() {
  return useQuery({ queryKey: ["dashboard", "top-products"], queryFn: () => dashboardApi.topProducts(), select: (r) => r.data.topProducts });
}
export function useLowStock(threshold?: number) {
  return useQuery({ queryKey: ["dashboard", "low-stock", threshold], queryFn: () => dashboardApi.lowStock(threshold), select: (r) => r.data });
}
export function useSalesChart(range: 7 | 30 = 7) {
  return useQuery({ queryKey: ["dashboard", "sales-chart", range], queryFn: () => dashboardApi.salesChart(range), select: (r) => r.data.salesData });
}
export function useTopCustomers(limit?: number) {
  return useQuery({ queryKey: ["dashboard", "top-customers", limit], queryFn: () => dashboardApi.topCustomers(limit), select: (r) => r.data.topCustomers });
}
export function useCategoryAnalytics() {
  return useQuery({ queryKey: ["dashboard", "category-analytics"], queryFn: () => dashboardApi.categoryAnalytics(), select: (r) => r.data.categoryAnalytics });
}
export function useMonthlyRevenue(months?: number) {
  return useQuery({ queryKey: ["dashboard", "monthly-revenue", months], queryFn: () => dashboardApi.monthlyRevenue(months), select: (r) => r.data.monthlyRevenue });
}
