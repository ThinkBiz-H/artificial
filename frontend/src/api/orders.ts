import { apiClient } from "./client";
import type { ApiEnvelope, Order, RazorpayOrder } from "@/types";

export interface ShippingAddressInput {
  fullName: string;
  email?: string;
  mobile?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddressInput;
  paymentMethod: "cod" | "razorpay";
  couponCode?: string;
  shippingNotes?: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient
      .post<ApiEnvelope<{ order: Order; razorpayOrder?: RazorpayOrder; razorpayKeyId?: string }>>("/orders", payload)
      .then((r) => r.data),

  myOrders: () =>
    apiClient.get<ApiEnvelope<{ orders: Order[]; count: number }>>("/orders/my-orders").then((r) => r.data),

  byId: (id: string) => apiClient.get<ApiEnvelope<{ order: Order }>>(`/orders/${id}`).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    apiClient.patch<ApiEnvelope<{ order: Order }>>(`/orders/${id}/cancel`, { reason }).then((r) => r.data),

  track: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ orderNumber: string; orderStatus: string; tracking: unknown; courier: unknown; statusHistory: unknown[]; live: unknown }>>(
        `/orders/${id}/track`,
      )
      .then((r) => r.data),

  invoiceUrl: (id: string) => `/orders/${id}/invoice`,
};
