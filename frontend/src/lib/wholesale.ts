import type { Product } from "@/types";

/** Pieces per pack (1 = loose). */
export const packSizeOf = (p: Pick<Product, "packSize">) => Math.max(1, Math.floor(p.packSize || 1));

/** Smallest orderable quantity: the MOQ, rounded up to whole packs. */
export const minQtyOf = (p: Pick<Product, "minOrderQuantity" | "packSize">) => {
  const pack = packSizeOf(p);
  return Math.ceil(Math.max(1, p.minOrderQuantity || 1) / pack) * pack;
};

/** Best bulk tier reached by a quantity (same rule as the backend's utils/wholesalePricing.js). */
export const bulkTierFor = (p: Pick<Product, "bulkPricing">, qty: number) =>
  [...(p.bulkPricing ?? [])].filter((t) => t.minQty > 0 && t.discountPercent > 0 && qty >= t.minQty).sort((a, b) => b.discountPercent - a.discountPercent)[0];

/** Per-piece price after the bulk tier for this quantity (dealer pricing is applied in the cart). */
export const tierPrice = (base: number, p: Pick<Product, "bulkPricing">, qty: number) => {
  const tier = bulkTierFor(p, qty);
  return tier ? Math.round(base * (1 - Math.min(tier.discountPercent, 90) / 100) * 100) / 100 : base;
};
