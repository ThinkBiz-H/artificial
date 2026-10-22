import { useQuery } from "@tanstack/react-query";
import { categoryBannersApi } from "@/api/categoryBanners";

export function useCategoryBanner(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["category-banner", categoryId],
    queryFn: () => categoryBannersApi.byCategory(categoryId as string),
    enabled: !!categoryId,
    select: (res) => res.data.banner,
  });
}
