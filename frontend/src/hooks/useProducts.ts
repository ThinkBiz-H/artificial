import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, type ProductListParams } from "@/api/products";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

export function useProductList(
  params: ProductListParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    // The whole params object is part of the key so every filter (price
    // range, availability, rating, …) triggers its own fetch/cache entry.
    queryKey: ["products", "list", params],
    queryFn: () => productsApi.list(params),
    // Callers filtering by an id that loads asynchronously (a category or
    // brand's _id, resolved from its slug first) must pass
    // `enabled: !!category?._id` — otherwise this fires once with that
    // filter undefined (an unscoped "all products" request) before the
    // parent record resolves, and that unfiltered result briefly renders
    // under a query key shared by every category/brand page.
    enabled: options?.enabled ?? true,
    select: (res) => res.data,
  });
}

/**
 * Same /products listing, fetched page by page for infinite scroll. `params`
 * must not include `page` — pages are driven by the query itself.
 */
export function useInfiniteProductList(params: Omit<ProductListParams, "page">, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) => productsApi.list({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = last.data.pagination;
      return p && p.page < p.totalPages ? p.page + 1 : undefined;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.bySlug(slug as string),
    enabled: !!slug,
    select: (res) => res.data.product,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.featured(),
    select: (res) => res.data.products,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => productsApi.newArrivals(),
    select: (res) => res.data.products,
  });
}

export function useTrendingProducts(limit?: number) {
  return useQuery({
    queryKey: ["products", "trending", limit],
    queryFn: () => productsApi.trending(limit),
    select: (res) => res.data.products,
  });
}

export function useBestSellers(limit?: number) {
  return useQuery({
    queryKey: ["products", "bestsellers", limit],
    queryFn: () => productsApi.bestsellers(limit),
    select: (res) => res.data.products,
  });
}

export function useTopRated(limit?: number) {
  return useQuery({
    queryKey: ["products", "top-rated", limit],
    queryFn: () => productsApi.topRated(limit),
    select: (res) => res.data.products,
  });
}

export function useRelatedProducts(id: string | undefined) {
  return useQuery({
    queryKey: ["products", "related", id],
    queryFn: () => productsApi.related(id as string),
    enabled: !!id,
    select: (res) => res.data.products,
  });
}

export function useRecentlyViewed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["products", "recently-viewed"],
    queryFn: () => productsApi.recentlyViewed(),
    enabled: isAuthenticated,
    select: (res) => res.data.items,
  });
}

export function useTrackView() {
  return useMutation({
    mutationFn: (id: string) => productsApi.trackView(id),
  });
}

export function useProductReviews(id: string | undefined) {
  return useQuery({
    queryKey: ["product-reviews", id],
    queryFn: () => productsApi.getReviews(id as string),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useAddReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      productsApi.addReview(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product"] });
      toast.success("Review added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useProductSearch(
  query: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () =>
      productsApi.list({
        keyword: query,
        page: 1,
        limit: 6,
      }),
    enabled: options?.enabled ?? !!query.trim(),
    select: (res) => res.data,
  });
}
