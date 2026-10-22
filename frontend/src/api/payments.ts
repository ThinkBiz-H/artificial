import { apiClient } from "./client";
import type { ApiEnvelope, Order, RazorpayOrder, PaymentTransaction } from "@/types";
import type { ShippingAddressInput } from "./orders";

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  /** Online checkout: price the bag and open a Razorpay order — no order exists until payment succeeds. */
  createIntent: (payload: { shippingAddress: ShippingAddressInput; couponCode?: string; shippingNotes?: string }) =>
    apiClient
      .post<ApiEnvelope<{ razorpayOrder: RazorpayOrder; razorpayKeyId: string; amount: number }>>("/payments/intent", payload)
      .then((r) => r.data),

  /** Verifies the Razorpay payment and creates the confirmed order. */
  confirmIntent: (payload: RazorpaySuccess) =>
    apiClient.post<ApiEnvelope<{ order: Order }>>("/payments/intent/confirm", payload).then((r) => r.data),

  verify: (payload: VerifyPaymentPayload) =>
    apiClient.post<ApiEnvelope<{ order: Order }>>("/payments/verify", payload).then((r) => r.data),

  failure: (payload: { orderId: string; reason?: string; razorpay_payment_id?: string }) =>
    apiClient.post<ApiEnvelope<{ order: Order }>>("/payments/failure", payload).then((r) => r.data),

  cancelled: (payload: { orderId: string }) =>
    apiClient.post<ApiEnvelope<{ order: Order }>>("/payments/cancelled", payload).then((r) => r.data),

  retry: (orderId: string) =>
    apiClient
      .post<ApiEnvelope<{ order: Order; razorpayOrder: RazorpayOrder; razorpayKeyId: string }>>(`/payments/${orderId}/retry`)
      .then((r) => r.data),

  transactions: (orderId: string) =>
    apiClient
      .get<ApiEnvelope<{ transactions: PaymentTransaction[] }>>(`/payments/${orderId}/transactions`)
      .then((r) => r.data),
};
