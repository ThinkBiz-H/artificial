import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Tag, TicketPercent } from "lucide-react";
import { useApplyCoupon, useCart } from "@/hooks/useCart";
import { useMyOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Coupons — there is no customer-facing coupon catalogue in the API, so this
 * page checks a code against the current bag (existing /cart/apply-coupon)
 * and lists the coupons used on past orders.
 */
export function CouponsPage() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { data: orders, isLoading } = useMyOrders();
  const applyCoupon = useApplyCoupon();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ code: string; discountAmount: number; subTotal: number; total: number } | null>(null);
  const bagEmpty = !cart?.cart?.length;

  const used = (orders ?? [])
    .filter((o) => o.coupon?.code)
    .map((o) => ({ code: o.coupon!.code!, saved: o.coupon!.discountAmount, order: o.orderNumber, id: o._id, date: o.createdAt }));

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setResult(null);
    applyCoupon.mutate(code.trim(), { onSuccess: (res) => setResult(res.data) });
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-3xl font-semibold text-fg">Coupons</h2>

      <section className="relative overflow-hidden rounded-card bg-primary p-6 text-fg-inverse sm:p-8">
        <TicketPercent size={120} strokeWidth={0.6} className="pointer-events-none absolute -right-6 -top-6 text-fg-inverse/10" />
        <p className="text-label font-semibold uppercase tracking-eyebrow text-accent-light">Have a code?</p>
        <p className="mt-2 font-display text-3xl font-semibold">Check your savings</p>
        <p className="mt-1 max-w-md text-sm text-fg-inverse/70">
          {bagEmpty ? "Add pieces to your bag, then enter a coupon to see what you'll save." : "We'll check the code against the items in your bag."}
        </p>
        <form onSubmit={check} className="mt-5 flex max-w-md gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            className="h-12 min-w-0 flex-1 rounded-input border border-fg-inverse/30 bg-surface/10 px-5 text-sm uppercase tracking-wider text-fg-inverse outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-fg-inverse/55 focus:border-fg-inverse"
          />
          <Button type="submit" variant="light" isLoading={applyCoupon.isPending} disabled={bagEmpty}>
            Check
          </Button>
        </form>
        {result && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-surface p-4 text-fg sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={18} className="text-success" />
              <span>
                <strong>{result.code}</strong> saves you <strong className="text-success">{formatCurrency(result.discountAmount)}</strong> on your bag
              </span>
            </p>
            <Button size="sm" onClick={() => navigate("/checkout", { state: { couponCode: result.code } })}>
              Use at checkout
            </Button>
          </div>
        )}
        {bagEmpty && (
          <Link to="/products" className={buttonClasses({ variant: "light", size: "sm", className: "mt-4" })}>
            Start shopping
          </Link>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-label text-fg">Coupons you've used</h3>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : used.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-fg-muted">No coupons used yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {used.map((u) => (
              <li key={u.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-primary">
                  <Tag size={17} />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold tracking-wider text-fg">{u.code}</p>
                  <p className="text-xs text-fg-muted">
                    Saved {formatCurrency(u.saved)} ·{" "}
                    <Link to={`/account/orders/${u.id}`} className="underline">
                      #{u.order}
                    </Link>{" "}
                    · {formatDate(u.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
