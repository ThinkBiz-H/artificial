import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi, type AddToCartPayload } from "@/api/cart";
import { useAuthStore } from "@/stores/auth.store";
import { useGuestCartStore, guestCartSubtotal } from "@/stores/cart.store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { subtotalOf, withLineQuantity, withoutLine } from "@/lib/cartLines";
import type { ApiEnvelope, CartLineItem, Product, Variant } from "@/types";

const CART_KEY = ["cart"];

function guestEnvelope(
  items: CartLineItem[],
): ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }> {
  return {
    success: true,
    message: "",
    data: { cart: items, subTotal: guestCartSubtotal(items) },
    error: null,
  };
}

/** Cart, unified across guest (localStorage) and authenticated (server) shoppers. */
export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestItems = useGuestCartStore((s) => s.items);

  const query = useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
    select: (res) => res.data,
  });

  if (isAuthenticated) return query;

  return {
    ...query,
    data: { cart: guestItems, subTotal: guestCartSubtotal(guestItems) },
    isLoading: false,
    isPending: false,
  };
}

export interface AddToCartInput extends AddToCartPayload {
  product: Product;
  variant?: Variant | null;
}

type CartEnvelope = ApiEnvelope<{ cart: CartLineItem[]; subTotal: number }>;

/** A cached server cart with its lines replaced (subtotal recomputed). */
function withLines(envelope: CartEnvelope, lines: CartLineItem[]): CartEnvelope {
  return { ...envelope, data: { ...envelope.data, cart: lines, subTotal: subtotalOf(lines) } };
}

export function useAddToCart() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addGuestItem = useGuestCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: AddToCartInput) => {
      if (isAuthenticated) return cartApi.add(payload);

      addGuestItem({
        product: payload.product,
        variant: payload.variant,
        quantity: payload.quantity,
        color: payload.color,
        size: payload.size,
      });
      return guestEnvelope(useGuestCartStore.getState().items);
    },
    onSuccess: (res) => {
      // The server answers with the whole updated cart — use it directly
      // instead of refetching (one request, and the badge updates at once).
      if (isAuthenticated) qc.setQueryData(CART_KEY, res);
      toast.success("Added to cart");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/**
 * Sets one line's quantity. The new quantity and subtotal show immediately
 * (header badge, slide cart, cart page and checkout all read the same
 * cache); on failure the previous cart is restored.
 */
export function useUpdateCartItem() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateGuestQuantity = useGuestCartStore((s) => s.updateQuantity);

  return useMutation({
    mutationFn: async ({ line, quantity }: { line: CartLineItem; quantity: number }) => {
      if (isAuthenticated) {
        return cartApi.updateItem(line.product._id, { quantity, variantId: line.variant?._id, lineId: line.lineId });
      }
      updateGuestQuantity(line, quantity);
      return guestEnvelope(useGuestCartStore.getState().items);
    },
    onMutate: async ({ line, quantity }) => {
      if (!isAuthenticated) return undefined;
      await qc.cancelQueries({ queryKey: CART_KEY });
      const previous = qc.getQueryData<CartEnvelope>(CART_KEY);
      if (previous) qc.setQueryData(CART_KEY, withLines(previous, withLineQuantity(previous.data.cart, line, quantity)));
      return { previous };
    },
    onSuccess: (res) => {
      if (isAuthenticated) qc.setQueryData(CART_KEY, res);
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(CART_KEY, context.previous);
      toast.error(getErrorMessage(err));
    },
  });
}

/** Removes exactly one line (one product/variant/colour/size combination). */
export function useRemoveCartItem() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const removeGuestLine = useGuestCartStore((s) => s.removeLine);

  return useMutation({
    mutationFn: async (line: CartLineItem) => {
      if (isAuthenticated) {
        return cartApi.removeItem(line.product._id, line.lineId ? { lineId: line.lineId } : { variantId: line.variant?._id ?? "" });
      }
      removeGuestLine(line);
      return guestEnvelope(useGuestCartStore.getState().items);
    },
    onMutate: async (line) => {
      if (!isAuthenticated) return undefined;
      await qc.cancelQueries({ queryKey: CART_KEY });
      const previous = qc.getQueryData<CartEnvelope>(CART_KEY);
      if (previous) qc.setQueryData(CART_KEY, withLines(previous, withoutLine(previous.data.cart, line)));
      return { previous };
    },
    onSuccess: (res) => {
      if (isAuthenticated) qc.setQueryData(CART_KEY, res);
      toast.success("Removed from cart");
    },
    onError: (err, _line, context) => {
      if (context?.previous) qc.setQueryData(CART_KEY, context.previous);
      toast.error(getErrorMessage(err));
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearGuestCart = useGuestCartStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) return cartApi.clear();
      clearGuestCart();
      return guestEnvelope([]);
    },
    onSuccess: () => {
      if (isAuthenticated) qc.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/**
 * After OTP login, replays the guest cart into the now-authenticated user's
 * server cart via the existing addToCart endpoint (which already merges
 * quantities for matching product/variant/color/size), then clears the
 * local guest cart. No guest cart data is lost.
 */
export function useMergeGuestCartIntoServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const items = useGuestCartStore.getState().items;
      for (const item of items) {
        await cartApi.add({
          productId: item.product._id,
          variantId: item.variant?._id,
          quantity: item.quantity,
          color: item.color,
          colorHex: item.colorHex,
          size: item.size,
        });
      }
      useGuestCartStore.getState().clear();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}
