import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, ShoppingBag, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useCart, useApplyCoupon } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { Seo } from "@/components/common/Seo";
import { CartLine } from "@/components/cart/CartLine";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { ProductRail } from "@/components/product/ProductRail";
import { useNewArrivals, useRelatedProducts } from "@/hooks/useProducts";

export function CartPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading } = useCart();
  const applyCoupon = useApplyCoupon();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ code: string; discountAmount: number; total: number } | null>(null);

  const items = data?.cart || [];
  const subTotal = data?.subTotal ?? items.reduce((sum, i) => sum + i.itemTotal, 0);
  const total = couponResult ? couponResult.total : subTotal;
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const { data: related } = useRelatedProducts(items[0]?.product._id);
  const { data: newArrivals } = useNewArrivals();
  const inBag = new Set(items.map((i) => i.product._id));
  const recommendations = [...(related ?? []), ...(newArrivals ?? [])]
    .filter((p, idx, arr) => !inBag.has(p._id) && arr.findIndex((x) => x._id === p._id) === idx)
    .slice(0, 10);
  const mrpSavings = items.reduce((s, i) => {
    const mrp = i.variant?.price ?? i.product.price;
    return s + Math.max(0, mrp - i.price) * i.quantity;
  }, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCoupon.mutate(couponCode.trim(), {
      onSuccess: (res) => {
        setCouponResult(res.data);
        toast.success(`Coupon applied — you saved ${formatCurrency(res.data.discountAmount)}`);
      },
    });
  };

  return (
    <>
    <div className="container-x py-10 sm:py-14">
      <Seo title="Shopping Bag" noindex />
      <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Step 1 of 2</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-fg sm:text-5xl">Your Bag</h1>
        </div>
        {count > 0 && <p className="pb-1 text-sm text-fg-muted">{count} item{count === 1 ? "" : "s"}</p>}
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" strokeWidth={1.25} />}
          title="Your bag is empty"
          description="Looks like you haven't added anything yet. Discover pieces made for every occasion."
          action={
            <Link to="/products" className={buttonClasses()}>
              Continue shopping
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
          <div>
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={`${item.product._id}-${item.variant?._id || ""}-${item.color || ""}-${item.size || ""}`} className="py-6 first:pt-0">
                  <CartLine item={item} />
                </li>
              ))}
            </ul>
            <Link to="/products" className="mt-4 inline-block text-sm text-fg-muted underline underline-offset-4 hover:text-fg">
              Continue shopping
            </Link>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-h,89px)+28px)] lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <h2 className="font-display text-2xl font-semibold text-fg">Order Summary</h2>
              <div className="mt-5">
                <FreeShippingProgress subTotal={subTotal} />
              </div>

              <div className="mt-5">
                {isAuthenticated ? (
                  couponResult ? (
                    <div className="flex items-center justify-between rounded-xl border border-dashed border-success/50 bg-success-soft px-3 py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-success">
                        <Tag size={14} /> <strong>{couponResult.code}</strong> applied
                      </span>
                      <button type="button" onClick={() => setCouponResult(null)} aria-label="Remove coupon" className="text-fg-muted hover:text-fg">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        aria-label="Coupon code"
                        className="h-11 min-w-0 flex-1 rounded-input border border-border bg-surface px-4 text-sm uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal focus:border-primary"
                      />
                      <Button type="submit" variant="outline" isLoading={applyCoupon.isPending}>
                        Apply
                      </Button>
                    </form>
                  )
                ) : (
                  <p className="text-sm text-fg-muted">
                    Have a coupon?{" "}
                    <Link to="/login" state={{ from: location.pathname }} className="font-medium text-fg underline underline-offset-4">
                      Log in
                    </Link>{" "}
                    to apply it.
                  </p>
                )}
              </div>

              <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Subtotal</dt>
                  <dd className="text-fg">{formatCurrency(subTotal)}</dd>
                </div>
                {couponResult && (
                  <div className="flex justify-between text-success">
                    <dt>Coupon ({couponResult.code})</dt>
                    <dd>−{formatCurrency(couponResult.discountAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Shipping</dt>
                  <dd className="text-fg-muted">Calculated at checkout</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt className="font-semibold text-fg">Total</dt>
                  <dd className="font-semibold text-fg">{formatCurrency(total)}</dd>
                </div>
              </dl>
              {mrpSavings > 0 && <p className="mt-3 text-sm text-success">You're saving {formatCurrency(mrpSavings)} on MRP</p>}

              <Button size="lg" className="mt-6 w-full" onClick={() => navigate("/checkout", { state: { couponCode: couponResult?.code } })}>
                Proceed to checkout
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
                <Lock size={12} /> Secure, encrypted checkout
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
    {!isLoading && <ProductRail eyebrow="Complete the look" title="You May Also Like" products={recommendations} className="border-t border-border" />}
    </>
  );
}
