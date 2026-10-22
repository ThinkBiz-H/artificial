import { apiClient } from "./client";
import type { ApiEnvelope, WishlistItem, CartLineItem } from "@/types";

export const wishlistApi = {
  get: () =>
    apiClient.get<ApiEnvelope<{ wishlist: WishlistItem[] }>>("/wishlist").then((r) => r.data),

  add: (productId: string) =>
    apiClient.post<ApiEnvelope<{ wishlist: string[] }>>(`/wishlist/${productId}`).then((r) => r.data),

  remove: (productId: string) =>
    apiClient.delete<ApiEnvelope<{ wishlist: string[] }>>(`/wishlist/${productId}`).then((r) => r.data),

  moveToCart: (productId: string, payload: { quantity?: number; color?: string; size?: string; variantId?: string } = {}) =>
    apiClient
      .post<ApiEnvelope<{ cart: CartLineItem[]; wishlist: string[] }>>(`/wishlist/${productId}/move-to-cart`, payload)
      .then((r) => r.data),
};
