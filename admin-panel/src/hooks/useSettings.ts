import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/api/settings";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useSettings() {
  return useQuery({ queryKey: ["admin-settings"], queryFn: () => settingsApi.get(), select: (r) => r.data.settings });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => settingsApi.update(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => settingsApi.updateLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Logo updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateFavicon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => settingsApi.updateFavicon(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Favicon updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useEnvironmentStatus() {
  return useQuery({ queryKey: ["environment-status"], queryFn: () => settingsApi.environmentStatus(), select: (r) => r.data.environment });
}
