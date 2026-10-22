import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { checkoutApi, type PaymentMethodId } from "@/api/checkout";
import { useAuthStore } from "@/stores/auth.store";
import type { CartLineItem } from "@/types";

/**
 * Checkout summary priced by the backend (same pricing as the order: items,
 * coupon, prepaid discount, shipping, GST, total) plus the payment methods
 * the admin has enabled. Re-prices when the bag, pincode, method or coupon
 * changes; the previous summary stays on screen while it does.
 */
export function useCheckoutQuote({
  lines,
  pincode,
  paymentMethod,
  couponCode,
}: {
  lines: CartLineItem[];
  pincode?: string;
  paymentMethod?: PaymentMethodId | null;
  couponCode?: string;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const validPincode = /^\d{6}$/.test(pincode ?? "") ? pincode : undefined;
  // Logged-in shoppers are priced from their server bag; guests send theirs.
  const items = isAuthenticated
    ? undefined
    : lines.map((l) => ({ productId: l.product._id, variantId: l.variant?._id, quantity: l.quantity, color: l.color, size: l.size }));
  const bagKey = lines.map((l) => `${l.lineId ?? l.product._id}:${l.variant?._id ?? ""}:${l.color ?? ""}:${l.size ?? ""}:${l.quantity}`).join("|");

  return useQuery({
    queryKey: ["checkout-quote", isAuthenticated, bagKey, validPincode ?? "", paymentMethod ?? "", couponCode ?? ""],
    queryFn: () => checkoutApi.quote({ items, pincode: validPincode, paymentMethod, couponCode: couponCode || undefined }),
    enabled: lines.length > 0,
    placeholderData: keepPreviousData,
    select: (res) => res.data,
    staleTime: 30_000,
  });
}
