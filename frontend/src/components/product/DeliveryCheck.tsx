import { useState } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";
import { shippingApi, type ShippingCalculateResult } from "@/api/shipping";
import { formatCurrency } from "@/lib/utils";

/** Pincode delivery estimate via the existing /shipping/calculate API (same calculation checkout uses). */
export function DeliveryCheck({ weight, subTotal }: { weight?: number; subTotal: number }) {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "ok" | "error"; result?: ShippingCalculateResult; message?: string }>({
    status: "idle",
  });

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) return setState({ status: "error", message: "Please enter a valid 6-digit pincode." });
    setState({ status: "loading" });
    try {
      const { data } = await shippingApi.calculate({ pincode, weight: weight || 0.5, subTotal });
      setState({ status: "ok", result: data.data });
    } catch {
      setState({ status: "error", message: "We couldn't confirm delivery to this pincode right now." });
    }
  };

  const r = state.result;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-fg">
        <MapPin size={15} strokeWidth={1.75} className="text-accent" /> Check delivery
      </p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Enter pincode"
          aria-label="Delivery pincode"
          className="h-10 min-w-0 flex-1 rounded-input border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="flex h-10 flex-none items-center gap-2 rounded-pill border border-primary px-4 text-label font-semibold uppercase tracking-wider text-fg transition-colors hover:bg-primary hover:text-fg-inverse disabled:opacity-60"
        >
          {state.status === "loading" && <Loader2 size={13} className="animate-spin" />}
          Check
        </button>
      </form>
      {state.status === "ok" && r && (
        <p className="mt-3 flex items-start gap-2 text-sm text-fg-soft" role="status">
          <Truck size={15} className="mt-0.5 flex-none text-success" />
          <span>
            {r.estimatedDays ? (
              <>
                Delivery in about <strong className="font-semibold text-fg">{r.estimatedDays} days</strong>
              </>
            ) : (
              "Delivery available"
            )}
            {" · "}
            {r.freeShipping || r.shippingCharge === 0 ? (
              <strong className="font-semibold text-success">Free shipping</strong>
            ) : (
              <>Shipping {formatCurrency(r.shippingCharge)}</>
            )}
          </span>
        </p>
      )}
      {state.status === "error" && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
