import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsApi, type CouponFormValues } from "@/api/coupons";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useCoupons() {
  return useQuery({ queryKey: ["admin-coupons"], queryFn: () => couponsApi.list(), select: (r) => r.data.coupons });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-coupon", id],
    queryFn: () => couponsApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.coupon,
  });
}

export function useCouponAnalytics(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-coupon-analytics", id],
    queryFn: () => couponsApi.analytics(id as string),
    enabled: !!id,
    select: (r) => r.data,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CouponFormValues) => couponsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CouponFormValues> }) => couponsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
