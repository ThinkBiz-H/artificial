/** URL ⇄ API mapping for the catalogue. Only fields the backend's generic filter supports are exposed. */

export const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "-createdAt", label: "Newest" },
  { value: "-salesCount", label: "Popular" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-rating", label: "Top Rated" },
];

export const PRICE_RANGES = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 – ₹1,000", min: "500", max: "1000" },
  { label: "₹1,000 – ₹2,000", min: "1000", max: "2000" },
  { label: "₹2,000 – ₹5,000", min: "2000", max: "5000" },
  { label: "Above ₹5,000", min: "5000", max: "" },
];

export interface CatalogFilters {
  page: number;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  rating?: string;
  sale: boolean;
  q?: string;
}

export function readFilters(sp: URLSearchParams): CatalogFilters {
  return {
    page: Number(sp.get("page")) || 1,
    category: sp.get("category") || undefined,
    brand: sp.get("brand") || undefined,
    sort: sp.get("sort") || undefined,
    minPrice: sp.get("minPrice") || "",
    maxPrice: sp.get("maxPrice") || "",
    inStock: sp.get("inStock") === "1",
    rating: sp.get("rating") || undefined,
    sale: sp.get("sale") === "1",
    q: sp.get("q") || undefined,
  };
}

/** Builds the /products query. `fixedCategory` wins over the URL (category pages). */
export function toApiParams(f: CatalogFilters, fixedCategory?: string, limit = 16) {
  const p: Record<string, unknown> = { page: f.page, limit };
  const category = fixedCategory || f.category;
  if (category) p.category = category;
  if (f.brand) p.brand = f.brand;
  if (f.sort) p.sort = f.sort;
  if (f.q) p.keyword = f.q;
  if (f.minPrice) p["price[gte]"] = f.minPrice;
  if (f.maxPrice) p["price[lte]"] = f.maxPrice;
  if (f.inStock) p["stock[gt]"] = 0;
  if (f.rating) p["rating[gte]"] = f.rating;
  if (f.sale) p["salePrice[gt]"] = 0;
  return p;
}

export function countActiveFilters(f: CatalogFilters, includeCategory: boolean) {
  return [
    includeCategory && f.category,
    f.brand,
    f.minPrice || f.maxPrice,
    f.inStock,
    f.rating,
    f.sale,
  ].filter(Boolean).length;
}
