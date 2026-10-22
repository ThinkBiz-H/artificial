import type { ColorOption, ItemOptionValues, Product, Variant } from "@/types";

/*
 * Jewellery option helpers — the client-side mirror of
 * backend/utils/itemOptions.js, so guest-cart lines show exactly what the
 * server would store once the shopper logs in.
 */

const same = (a?: string, b?: string) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

const attr = (variant: Variant | null | undefined, key: string) => variant?.attributes?.find((a) => same(a.key, key))?.value || "";

/** A variant's colour / size — variants saved before the explicit fields keep them in `attributes`. */
export const variantColor = (v?: Variant | null) => v?.color || attr(v, "color");
export const variantSize = (v?: Variant | null) => v?.size || attr(v, "size");

/** Product colour options, falling back to the legacy name list (no swatch). */
export function productColorOptions(product: Product): ColorOption[] {
  if (product.colorOptions?.length) return product.colorOptions;
  return (product.colors ?? []).map((name) => ({ name }));
}

export const findColorOption = (product: Product, name?: string) => (name ? productColorOptions(product).find((c) => same(c.name, name)) : undefined);

/** Options for a line: the variant decides colour/size, metal/plating come from the product. */
export function resolveLineOptions(product: Product, variant: Variant | null | undefined, picked: { color?: string; size?: string } = {}): ItemOptionValues {
  const color = variantColor(variant) || picked.color || "";
  return {
    color: color || undefined,
    colorHex: variant?.colorHex || findColorOption(product, color)?.hex || undefined,
    size: variantSize(variant) || picked.size || undefined,
    metal: product.metal || undefined,
    plating: product.plating || undefined,
  };
}

/** Line image: variant image → colour gallery → product thumbnail / first image. */
export function resolveLineImage(product: Product, variant: Variant | null | undefined, color?: string) {
  return variant?.images?.[0]?.url || findColorOption(product, color)?.images?.[0]?.url || product.thumbnail?.url || product.images?.[0]?.url || undefined;
}

/** Labelled parts in display order — only the ones that exist. */
export function optionParts(item: ItemOptionValues) {
  return [
    item.color ? { label: "Color", value: item.color, hex: item.colorHex } : null,
    item.size ? { label: "Size", value: item.size } : null,
    item.metal ? { label: "Metal", value: item.metal } : null,
    item.plating ? { label: "Plating", value: item.plating } : null,
  ].filter((p): p is { label: string; value: string; hex?: string } => p !== null);
}
