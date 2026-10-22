import { apiClient, API_BASE_URL } from "./client";
import type { ApiEnvelope, Order, Pagination } from "@/types";

export interface OrderListParams {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  orderNumber?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface UpdateOrderStatusPayload {
  orderStatus?: string;
  note?: string;
  adminNote?: string;
  shippingNotes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  courierPartner?: string;
  courierName?: string;
  deliveryFailed?: boolean;
}

export const ordersApi = {
  list: (params: OrderListParams = {}) =>
    apiClient
      .get<
        ApiEnvelope<{ orders: Order[]; pagination: Pagination }>
      >("/orders", { params })
      .then((r) => r.data),

  byId: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ order: Order }>>(`/orders/${id}`)
      .then((r) => r.data),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    apiClient
      .patch<ApiEnvelope<{ order: Order }>>(`/orders/${id}/status`, payload)
      .then((r) => r.data),

  track: (id: string) =>
    apiClient
      .get<
        ApiEnvelope<{
          orderNumber: string;
          orderStatus: string;
          tracking: unknown;
          courier: unknown;
          statusHistory: unknown[];
        }>
      >(`/orders/${id}/track`)
      .then((r) => r.data),

  createShipment: (id: string, courierId?: string) =>
    apiClient
      .post<
        ApiEnvelope<{ order: Order }>
      >(`/orders/${id}/shipment`, { courierId })
      .then((r) => r.data),

  requestPickup: (id: string) =>
    apiClient
      .post<ApiEnvelope<{}>>(`/orders/${id}/shipment/pickup`)
      .then((r) => r.data),

  cancelShipment: (id: string) =>
    apiClient
      .post<ApiEnvelope<{}>>(`/orders/${id}/shipment/cancel`)
      .then((r) => r.data),

  resendEmail: (id: string) =>
    apiClient
      .post<ApiEnvelope<{}>>(`/orders/${id}/resend-email`)
      .then((r) => r.data),

  invoiceUrl: (id: string) => `${API_BASE_URL}/orders/${id}/invoice`,
};
