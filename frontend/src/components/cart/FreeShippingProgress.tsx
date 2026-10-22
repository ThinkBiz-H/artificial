import { Truck } from "lucide-react";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { formatCurrency } from "@/lib/utils";

/** "Add ₹X more for free shipping" — threshold from Admin > Settings > Shipping. Display only; checkout's shipping API is authoritative. */
export function FreeShippingProgress({ subTotal }: { subTotal: number }) {
  const { freeShippingEnabled, freeShippingThreshold } = useStoreInfo();
  if (!freeShippingEnabled || freeShippingThreshold <= 0) return null;

  const remaining = Math.max(0, freeShippingThreshold - subTotal);
  const pct = Math.min(100, (subTotal / freeShippingThreshold) * 100);

  return (
    <div className="rounded-xl bg-surface-muted/60 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-fg">
        <Truck size={15} strokeWidth={1.75} className="flex-none text-accent" />
        {remaining > 0 ? (
          <span>
            Add <strong className="font-semibold">{formatCurrency(remaining)}</strong> more for free shipping
          </span>
        ) : (
          <span className="font-medium">You've unlocked free shipping</span>
        )}
      </p>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-accent-soft transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
