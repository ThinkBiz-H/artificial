import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reelsApi, type ReelFormValues } from "@/api/reels";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useAddReel(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ReelFormValues) => reelsApi.create(sectionId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Reel added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateReel(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, values }: { reelId: string; values: Partial<ReelFormValues> }) =>
      reelsApi.update(sectionId, reelId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Reel updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteReel(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reelId: string) => reelsApi.remove(sectionId, reelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Reel deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReorderReels(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => reelsApi.reorder(sectionId, order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
