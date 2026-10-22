import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi, type CustomerListParams } from "@/api/customers";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useCustomerList(params: CustomerListParams) {
  return useQuery({
    queryKey: ["admin-customers", params],
    queryFn: () => customersApi.list(params),
    select: (r) => r.data,
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => customersApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.user,
  });
}

export function useUpdateCustomerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => customersApi.updateStatus(id, isActive),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      qc.invalidateQueries({ queryKey: ["admin-customer", vars.id] });
      toast.success(vars.isActive ? "Customer activated" : "Customer blocked");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Customer deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function usePermissionCatalog() {
  return useQuery({ queryKey: ["permission-catalog"], queryFn: () => customersApi.permissionCatalog(), select: (r) => r.data.permissions });
}
