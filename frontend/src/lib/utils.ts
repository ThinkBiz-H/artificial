import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge taught about the custom design tokens in index.css, so e.g.
 * `text-label` (a font size) never cancels `text-fg-inverse` (a colour).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["2xs", "label"],
      radius: ["card", "panel", "pill"],
      shadow: ["soft", "lift"],
      tracking: ["label", "eyebrow", "display"],
      leading: ["display"],
      ease: ["luxe"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined | null): string {
  const value = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string; code?: string } | null | undefined;
  // A message from our API is already written for the shopper.
  if (e?.response?.data?.message) return e.response.data.message;
  // No response at all: the request timed out or never reached the server.
  if (e && !e.response) {
    if (e.code === "ECONNABORTED" || e.code === "ETIMEDOUT" || /timeout/i.test(e.message || "")) {
      return "The server is taking too long to respond. Please try again.";
    }
    if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
      return "We couldn't reach the server. Check your internet connection and try again.";
    }
  }
  return e?.message || "Something went wrong. Please try again.";
}

export function effectivePrice(item: { price?: number; salePrice?: number }): number {
  if (item.salePrice && item.salePrice > 0) return item.salePrice;
  return item.price || 0;
}

export function discountPercent(price?: number, salePrice?: number): number {
  if (!price || !salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

type ImageLike = { url: string } | undefined | null;

/** Primary display image for a product (thumbnail, else first gallery image). */
export function productImage(product: {
  thumbnail?: ImageLike;
  images?: { url: string }[];
}): string | undefined {
  return product.thumbnail?.url || product.images?.[0]?.url;
}

/** Products created in the last 30 days get a "New" badge. */
export function isNewProduct(createdAt?: string, days = 30): boolean {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age < days * 24 * 60 * 60 * 1000;
}

/** Strips HTML tags — used for meta descriptions built from rich text. */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Normalises an admin-entered social handle or URL into a full URL. */
export function socialUrl(network: string, value?: string): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  const bases: Record<string, string> = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    twitter: "https://x.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/in/",
    pinterest: "https://pinterest.com/",
    whatsapp: "https://wa.me/",
  };
  const base = bases[network];
  if (!base) return value;
  return network === "whatsapp" ? `${base}${handle.replace(/[^\d]/g, "")}` : `${base}${handle}`;
}
