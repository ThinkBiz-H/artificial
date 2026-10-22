import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffApi, type StaffFormValues } from "@/api/staff";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useStaffList() {
  return useQuery({
    queryKey: ["admin-staff"],
    queryFn: () => staffApi.list(),
    select: (r) => r.data.staff,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: StaffFormValues) => staffApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff account created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<StaffFormValues> }) =>
      staffApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff account updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      toast.success("Staff account deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
