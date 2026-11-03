import type { CampaignCategory, CampaignStatus } from "@/api/notifications";

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  general: "General",
  promotional: "Promotional",
  flash_sale: "Flash sale",
  coupon: "Coupon",
  price_drop: "Price drop",
  back_in_stock: "Back in stock",
  wishlist: "Wishlist",
  order: "Order update",
  payment: "Payment",
};

export const STATUS_TONE: Record<CampaignStatus, "success" | "danger" | "warning" | "info" | "neutral"> = {
  draft: "neutral",
  scheduled: "info",
  sending: "warning",
  sent: "success",
  failed: "danger",
  cancelled: "neutral",
};

/** Deep links the app understands (mobile LinkResolver) — website paths. */
export const LINK_PRESETS: { value: string; label: string; needs?: "slug" | "query"; prefix?: string; placeholder?: string }[] = [
  { value: "", label: "No link (opens notifications)" },
  { value: "/", label: "Home" },
  { value: "product", label: "A product", needs: "slug", prefix: "/products/", placeholder: "product-slug" },
  { value: "category", label: "A category", needs: "slug", prefix: "/category/", placeholder: "category-slug" },
  { value: "/new-arrivals", label: "New arrivals" },
  { value: "/best-sellers", label: "Best sellers" },
  { value: "/trending", label: "Trending" },
  { value: "/sale", label: "Sale" },
  { value: "search", label: "Search results", needs: "query", prefix: "/search?q=", placeholder: "gold earrings" },
  { value: "/wishlist", label: "Wishlist" },
  { value: "/cart", label: "Cart" },
  { value: "/account/orders", label: "My orders" },
  { value: "custom", label: "Custom path or URL", needs: "slug", prefix: "", placeholder: "/products?sort=-salesCount or https://…" },
];

/** Splits a stored link back into a preset + its parameter (for editing). */
export function parseLink(link: string): { preset: string; param: string } {
  if (!link) return { preset: "", param: "" };
  const exact = LINK_PRESETS.find((p) => !p.needs && p.value === link);
  if (exact) return { preset: exact.value, param: "" };
  for (const p of LINK_PRESETS) {
    if (p.needs && p.prefix && link.startsWith(p.prefix)) {
      const param = link.slice(p.prefix.length);
      return { preset: p.value, param: p.needs === "query" ? decodeURIComponent(param) : param };
    }
  }
  return { preset: "custom", param: link };
}

export function buildLink(preset: string, param: string): string {
  const p = LINK_PRESETS.find((x) => x.value === preset);
  if (!p) return "";
  if (!p.needs) return p.value;
  const value = param.trim();
  if (!value) return "";
  return p.needs === "query" ? `${p.prefix}${encodeURIComponent(value)}` : `${p.prefix}${value}`;
}
