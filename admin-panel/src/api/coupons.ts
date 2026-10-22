import { apiClient } from "./client";
import type { ApiEnvelope, Coupon, CouponAnalytics } from "@/types";

export interface CouponFormValues {
  code: string;
  discount: number;
  type: "percentage" | "flat";
  expiry: string;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export const couponsApi = {
  list: () => apiClient.get<ApiEnvelope<{ coupons: Coupon[] }>>("/coupons").then((r) => r.data),
  byId: (id: string) => apiClient.get<ApiEnvelope<{ coupon: Coupon }>>(`/coupons/${id}`).then((r) => r.data),
  create: (values: CouponFormValues) => apiClient.post<ApiEnvelope<{ coupon: Coupon }>>("/coupons", values).then((r) => r.data),
  update: (id: string, values: Partial<CouponFormValues>) =>
    apiClient.put<ApiEnvelope<{ coupon: Coupon }>>(`/coupons/${id}`, values).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/coupons/${id}`).then((r) => r.data),
  overview: () => apiClient.get<ApiEnvelope<Record<string, unknown>>>("/coupons/analytics/overview").then((r) => r.data),
  analytics: (id: string) => apiClient.get<ApiEnvelope<CouponAnalytics>>(`/coupons/${id}/analytics`).then((r) => r.data),
};
