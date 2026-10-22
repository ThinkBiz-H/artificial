import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandsApi, type BrandFormValues } from "@/api/brands";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useBrands(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ["admin-brands", params], queryFn: () => brandsApi.list(params), select: (r) => r.data.brands });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: BrandFormValues) => brandsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<BrandFormValues> }) => brandsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
