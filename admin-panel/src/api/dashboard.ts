import { apiClient } from "./client";
import type { ApiEnvelope, Order, TopProduct, Product, Variant } from "@/types";

export const dashboardApi = {
  stats: () =>
    apiClient
      .get<ApiEnvelope<{ totalSales: number; todaySales: number; totalOrders: number; totalProducts: number; totalCustomers: number; revenue: number; todayOrders: number; pendingOrders: number; activeUsers: number }>>(
        "/admin/dashboard/stats",
      )
      .then((r) => r.data),

  recentOrders: () => apiClient.get<ApiEnvelope<{ orders: Order[] }>>("/admin/dashboard/recent-orders").then((r) => r.data),

  topProducts: () =>
    apiClient
      .get<ApiEnvelope<{ topProducts: (TopProduct & { _id: string; totalSold: number; totalRevenue: number })[] }>>(
        "/admin/dashboard/top-products",
      )
      .then((r) => r.data),

  lowStock: (threshold?: number) =>
    apiClient
      .get<ApiEnvelope<{ products: Product[]; variants: (Variant & { product: { title: string; thumbnail?: string } })[]; threshold: number }>>(
        "/admin/dashboard/low-stock",
        { params: { threshold } },
      )
      .then((r) => r.data),

  salesChart: (range: 7 | 30 = 7) =>
    apiClient
      .get<ApiEnvelope<{ range: number; salesData: { _id: string; totalSales: number; orderCount: number }[] }>>(
        "/admin/dashboard/charts",
        { params: { range } },
      )
      .then((r) => r.data),

  topCustomers: (limit?: number) =>
    apiClient
      .get<ApiEnvelope<{ topCustomers: { userId: string; name: string; email: string; totalSpent: number; orderCount: number }[] }>>(
        "/admin/dashboard/top-customers",
        { params: { limit } },
      )
      .then((r) => r.data),

  categoryAnalytics: () =>
    apiClient
      .get<ApiEnvelope<{ categoryAnalytics: { categoryId: string; categoryName: string; totalRevenue: number; unitsSold: number }[] }>>(
        "/admin/dashboard/category-analytics",
      )
      .then((r) => r.data),

  monthlyRevenue: (months?: number) =>
    apiClient
      .get<ApiEnvelope<{ months: number; monthlyRevenue: { _id: string; totalRevenue: number; orderCount: number }[] }>>(
        "/admin/dashboard/monthly-revenue",
        { params: { months } },
      )
      .then((r) => r.data),
};
