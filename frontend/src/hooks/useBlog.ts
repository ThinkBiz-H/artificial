import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogApi, type BlogListParams } from "@/api/blog";

export function useBlogList(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogApi.list(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
  });
}

/** Latest posts with "Load more" (pages appended). */
export function useInfiniteBlogs(params: Omit<BlogListParams, "page"> & { startPage?: number }) {
  const { startPage = 1, ...rest } = params;
  return useInfiniteQuery({
    queryKey: ["blogs", "infinite", rest, startPage],
    queryFn: ({ pageParam }) => blogApi.list({ ...rest, page: pageParam }),
    initialPageParam: startPage,
    getNextPageParam: (last) => (last.data.page < last.data.totalPages ? last.data.page + 1 : undefined),
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogApi.bySlug(slug as string),
    enabled: !!slug,
    select: (res) => res.data,
  });
}

/** Warms the cache for a post (e.g. "Next article") so it opens instantly. */
export function usePrefetchBlog() {
  const qc = useQueryClient();
  return (slug: string) => qc.prefetchQuery({ queryKey: ["blog", slug], queryFn: () => blogApi.bySlug(slug), staleTime: 60_000 });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories(),
    select: (res) => res.data.categories,
  });
}

export function useBlogHighlights() {
  return useQuery({
    queryKey: ["blog-highlights"],
    queryFn: () => blogApi.highlights(),
    select: (res) => res.data,
    staleTime: 5 * 60_000,
  });
}
