import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryFormValues } from "@/api/categories";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useCategories(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ["admin-categories", params], queryFn: () => categoriesApi.list(params), select: (r) => r.data.categories });
}

export function useCategoryTree() {
  return useQuery({ queryKey: ["admin-categories", "tree"], queryFn: () => categoriesApi.tree(), select: (r) => r.data.categories });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CategoryFormValues) => categoriesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CategoryFormValues> }) => categoriesApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
