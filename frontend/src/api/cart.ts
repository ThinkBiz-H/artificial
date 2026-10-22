import { apiClient } from "./client";
import type { ApiEnvelope, CartLineItem } from "@/types";

export interface AddToCartPayload {
  productId: string;
  quantity?: number;
  color?: string;
  colorHex?: string;
  size?: string;
  variantId?: string;
}

export const cartApi = {
  get: () =>
    apiClient.get<ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }>>("/cart").then((r) => r.data),

  add: (payload: AddToCartPayload) =>
    apiClient.post<ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }>>("/cart", payload).then((r) => r.data),

  /** `lineId` targets exactly one line; without it the server falls back to product (+variant). */
  updateItem: (productId: string, payload: { quantity: number; variantId?: string; lineId?: string }) =>
    apiClient
      .put<ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }>>(`/cart/${productId}`, payload)
      .then((r) => r.data),

  /** `lineId` removes exactly one line, `variantId` that variant's line; with neither, every line of the product. */
  removeItem: (productId: string, target: { variantId?: string; lineId?: string } = {}) =>
    apiClient
      .delete<ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }>>(`/cart/${productId}`, {
        params: target.lineId ? { lineId: target.lineId } : target.variantId !== undefined ? { variantId: target.variantId } : undefined,
      })
      .then((r) => r.data),

  clear: () => apiClient.delete<ApiEnvelope<{ cart: [] }>>("/cart").then((r) => r.data),

  applyCoupon: (code: string) =>
    apiClient
      .post<ApiEnvelope<{ code: string; discountAmount: number; subTotal: number; total: number }>>(
        "/cart/apply-coupon",
        { code },
      )
      .then((r) => r.data),

  removeCoupon: () => apiClient.delete<ApiEnvelope<{}>>("/cart/remove-coupon").then((r) => r.data),
};
