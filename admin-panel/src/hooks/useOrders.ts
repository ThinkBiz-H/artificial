import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type OrderListParams, type UpdateOrderStatusPayload } from "@/api/orders";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useOrderList(params: OrderListParams) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => ordersApi.list(params),
    select: (r) => r.data,
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => ordersApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.order,
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => ordersApi.updateStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success("Order updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCreateShipment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courierId?: string) => ordersApi.createShipment(id, courierId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success("Shipment created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRequestPickup(id: string) {
  return useMutation({
    mutationFn: () => ordersApi.requestPickup(id),
    onSuccess: () => toast.success("Pickup requested"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCancelShipment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ordersApi.cancelShipment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success("Shipment cancelled");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useResendOrderEmail(id: string) {
  return useMutation({
    mutationFn: () => ordersApi.resendEmail(id),
    onSuccess: () => toast.success("Order confirmation email resent"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
