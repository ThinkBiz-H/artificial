import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/api/blog";

export function useBlogList(params: { keyword?: string; category?: string; tag?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogApi.list(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
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

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogApi.categories(),
    select: (res) => res.data.categories,
  });
}
