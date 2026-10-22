import { useQuery } from "@tanstack/react-query";
import { categoriesApi, brandsApi, faqsApi, homeSectionsApi, announcementsApi, settingsApi, pagesApi } from "@/api/catalog";

export function useCategories(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoriesApi.list(params),
    select: (res) => res.data.categories,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoriesApi.tree(),
    select: (res) => res.data.categories,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesApi.bySlug(slug as string),
    enabled: !!slug,
    select: (res) => res.data.category,
  });
}

export function useBrands(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: () => brandsApi.list(params),
    select: (res) => res.data.brands,
  });
}

export function useBrand(slug: string | undefined) {
  return useQuery({
    queryKey: ["brand", slug],
    queryFn: () => brandsApi.bySlug(slug as string),
    enabled: !!slug,
    select: (res) => res.data.brand,
  });
}

export function useFaqs(category?: string) {
  return useQuery({
    queryKey: ["faqs", category],
    queryFn: () => faqsApi.list(category),
    select: (res) => res.data.faqs,
  });
}

export function useHomeSections() {
  return useQuery({
    queryKey: ["home-sections"],
    queryFn: () => homeSectionsApi.list(),
    select: (res) => res.data.sections,
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.list(),
    select: (res) => res.data.announcements,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    select: (res) => res.data.settings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCmsPage(slug: string | undefined) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: () => pagesApi.bySlug(slug as string),
    enabled: !!slug,
    select: (res) => res.data.page,
  });
}
