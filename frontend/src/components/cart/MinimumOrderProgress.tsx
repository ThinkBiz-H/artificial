import { Truck } from "lucide-react";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useMinimumOrder } from "@/hooks/useMinimumOrder";
import { formatCurrency } from "@/lib/utils";
import { FreeShippingProgress } from "./FreeShippingProgress";

/**
 * Wholesale minimum order bar, styled exactly like FreeShippingProgress:
 * "₹2,850 added · ₹2,150 more required". Display only — checkout enforces the
 * same minimum server-side. Without a minimum it is the free-shipping bar.
 */
export function MinimumOrderProgress({ subTotal }: { subTotal: number }) {
  const { freeDelivery } = useStoreInfo();
  const min = useMinimumOrder(subTotal);
  if (!min.enabled) return <FreeShippingProgress subTotal={subTotal} />;

  return (
    <div className="rounded-xl bg-surface-muted/60 px-4 py-3" role="status">
      <p className="flex items-center gap-2 text-sm text-fg">
        <Truck size={15} strokeWidth={1.75} className="flex-none text-accent" />
        {min.met ? (
          <span className="font-medium">{freeDelivery ? "Minimum order reached — free delivery unlocked" : "Minimum order reached"}</span>
        ) : (
          <span>
            <strong className="font-semibold">{formatCurrency(subTotal)}</strong> added · <strong className="font-semibold">{formatCurrency(min.remaining)}</strong> more required
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-accent-soft transition-[width] duration-500" style={{ width: `${min.pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        Minimum wholesale order {formatCurrency(min.value)}
        {freeDelivery ? " · Free delivery" : ""}
      </p>
    </div>
  );
}
