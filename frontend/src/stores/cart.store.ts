import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem, Product, Variant } from "@/types";
import { resolveLineImage, resolveLineOptions } from "@/lib/itemOptions";
import { isSameLine, roundMoney, subtotalOf, withLineQuantity, withoutLine } from "@/lib/cartLines";

// Same price rule the backend uses in cart.controller.js#resolveLine —
// prefer a positive sale price, otherwise the base price.
function resolvePrice(product: Product, variant: Variant | null) {
  if (variant) return variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.price;
  return product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
}

interface GuestCartState {
  items: CartLineItem[];
  addItem: (params: {
    product: Product;
    variant?: Variant | null;
    quantity?: number;
    color?: string;
    size?: string;
  }) => void;
  /** Sets one line's quantity (the line is matched by product, variant, colour and size). */
  updateQuantity: (line: CartLineItem, quantity: number) => void;
  /** Removes exactly one line. */
  removeLine: (line: CartLineItem) => void;
  clear: () => void;
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ product, variant = null, quantity = 1, color: pickedColor, size: pickedSize }) => {
        // Same resolution the server does: the variant decides colour/size.
        const options = resolveLineOptions(product, variant, { color: pickedColor, size: pickedSize });
        const price = resolvePrice(product, variant);
        const candidate: CartLineItem = {
          product,
          variant,
          quantity,
          ...options,
          image: resolveLineImage(product, variant, options.color),
          price,
          itemTotal: roundMoney(price * quantity),
        };

        const existing = get().items.find((i) => isSameLine(i, candidate));
        set({
          items: existing ? withLineQuantity(get().items, existing, existing.quantity + quantity) : [...get().items, candidate],
        });
      },

      updateQuantity: (line, quantity) => set({ items: withLineQuantity(get().items, line, quantity) }),

      removeLine: (line) => set({ items: withoutLine(get().items, line) }),

      clear: () => set({ items: [] }),
    }),
    { name: "guest_cart" },
  ),
);

export function guestCartSubtotal(items: CartLineItem[]) {
  return subtotalOf(items);
}
