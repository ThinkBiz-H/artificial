import { useStoreInfo } from "@/hooks/useStoreInfo";

/** Where the bag stands against the wholesale minimum (Admin > Settings > Wholesale). */
export function useMinimumOrder(subTotal: number) {
  const { wholesaleEnabled, minOrderValue } = useStoreInfo();
  const value = wholesaleEnabled ? minOrderValue : 0;
  const remaining = Math.max(0, value - subTotal);
  return { enabled: value > 0, value, remaining, met: remaining <= 0, pct: value > 0 ? Math.min(100, (subTotal / value) * 100) : 100 };
}
