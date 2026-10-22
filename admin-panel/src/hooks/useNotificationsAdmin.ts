import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsAdminApi } from "@/api/notifications";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useTemplates(params: { type?: string; channel?: string } = {}) {
  return useQuery({ queryKey: ["admin-templates", params], queryFn: () => notificationsAdminApi.templates(params), select: (r) => r.data.templates });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: { type: string; channel: string; subject?: string; body: string; isActive?: boolean }) =>
      notificationsAdminApi.createTemplate(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<{ subject: string; body: string; isActive: boolean }> }) =>
      notificationsAdminApi.updateTemplate(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsAdminApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useBroadcast() {
  return useMutation({
    mutationFn: (values: { audience?: "all" | "admins"; title: string; message: string }) => notificationsAdminApi.broadcast(values),
    onSuccess: (res) => toast.success(`Broadcast sent to ${res.data.sent}/${res.data.total} user(s)`),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
