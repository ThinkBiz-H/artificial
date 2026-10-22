import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

const MAX_ITEMS = 12;

/** Snapshot of just what a ProductCard needs — keeps localStorage small. */
function snapshot(p: Product): Product {
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    images: (p.images ?? []).slice(0, 2),
    thumbnail: p.thumbnail,
    // A deleted category populates as null — keep it null rather than an empty object.
    category: p.category && typeof p.category === "object" ? { ...p.category, children: undefined } : p.category,
    hasVariants: p.hasVariants,
    rating: p.rating,
    numReviews: p.numReviews,
    createdAt: p.createdAt,
    featured: p.featured,
    status: p.status,
    reviews: [],
  } as Product;
}

interface RecentlyViewedState {
  items: Product[];
  add: (product: Product) => void;
}

/** Recently viewed products, per browser (works for guests too). */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) =>
        set({ items: [snapshot(product), ...get().items.filter((p) => p._id !== product._id)].slice(0, MAX_ITEMS) }),
    }),
    { name: "recently_viewed" },
  ),
);
