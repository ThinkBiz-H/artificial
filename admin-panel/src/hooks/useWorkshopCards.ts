import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workshopCardsApi, type WorkshopCardFormValues } from "@/api/workshopCards";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useWorkshopCards() {
  return useQuery({
    queryKey: ["admin-workshop-cards"],
    queryFn: () => workshopCardsApi.list(),
    select: (r) => r.data.cards,
  });
}

export function useCreateWorkshopCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: WorkshopCardFormValues) => workshopCardsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-cards"] });
      toast.success("Workshop card created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateWorkshopCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<WorkshopCardFormValues> }) =>
      workshopCardsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-cards"] });
      toast.success("Workshop card updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReorderWorkshopCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => workshopCardsApi.reorder(order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-cards"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteWorkshopCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workshopCardsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-workshop-cards"] });
      toast.success("Workshop card deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
