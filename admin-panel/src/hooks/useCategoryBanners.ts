import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryBannersApi, type CategoryBannerFormValues } from "@/api/categoryBanners";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useCategoryBanners() {
  return useQuery({
    queryKey: ["category-banners"],
    queryFn: () => categoryBannersApi.list(),
    select: (r) => r.data.banners,
  });
}

export function useCreateCategoryBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CategoryBannerFormValues) => categoryBannersApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-banners"] });
      toast.success("Category banner created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCategoryBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CategoryBannerFormValues> }) =>
      categoryBannersApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-banners"] });
      toast.success("Category banner updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCategoryBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryBannersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-banners"] });
      toast.success("Category banner deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
