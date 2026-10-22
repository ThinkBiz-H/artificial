import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type RoleFormValues } from "@/api/roles";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useRoles() {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => rolesApi.list(),
    select: (r) => r.data,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: RoleFormValues) => rolesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<RoleFormValues> }) =>
      rolesApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
