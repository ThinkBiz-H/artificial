import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type CreateOrderPayload } from "@/api/orders";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => ordersApi.myOrders(),
    select: (res) => res.data.orders,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.byId(id as string),
    enabled: !!id,
    select: (res) => res.data.order,
  });
}

export function useOrderTracking(id: string | undefined) {
  return useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => ordersApi.track(id as string),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.id] });
      toast.success("Order cancelled");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
