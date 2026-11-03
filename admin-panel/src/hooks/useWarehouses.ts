import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { warehousesApi, type WarehouseInput } from "@/api/warehouses";
import { getErrorMessage } from "@/lib/utils";

/** Every warehouse query starts with "warehouses" — realtime events refresh them all. */
export const WAREHOUSE_KEYS = {
  all: ["warehouses"] as const,
  overview: ["warehouses", "overview"] as const,
  list: ["warehouses", "list"] as const,
  summary: (id: string) => ["warehouses", "summary", id] as const,
};

export function useWarehouseOverview() {
  return useQuery({ queryKey: WAREHOUSE_KEYS.overview, queryFn: warehousesApi.overview, select: (r) => r.data });
}

export function useWarehouseList() {
  return useQuery({ queryKey: WAREHOUSE_KEYS.list, queryFn: warehousesApi.list, select: (r) => r.data.warehouses });
}

export function useWarehouseSummary(id: string | null) {
  return useQuery({
    queryKey: WAREHOUSE_KEYS.summary(id ?? ""),
    queryFn: () => warehousesApi.summary(id as string),
    enabled: !!id,
    select: (r) => r.data,
  });
}

function useWarehouseMutation<TVars>(fn: (vars: TVars) => Promise<{ message: string }>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: WAREHOUSE_KEYS.all });
      qc.invalidateQueries({ queryKey: ["inventory-stock"] });
      qc.invalidateQueries({ queryKey: ["inventory-movements"] });
      toast.success(r.message);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export const useCreateWarehouse = () => useWarehouseMutation((values: WarehouseInput) => warehousesApi.create(values));
export const useUpdateWarehouse = () =>
  useWarehouseMutation(({ id, values }: { id: string; values: WarehouseInput }) => warehousesApi.update(id, values));
export const useDeactivateWarehouse = () => useWarehouseMutation((id: string) => warehousesApi.deactivate(id));
export const useRepairWarehouses = () => useWarehouseMutation(() => warehousesApi.repair());
export const useTransferStock = () => useWarehouseMutation(warehousesApi.transfer);
