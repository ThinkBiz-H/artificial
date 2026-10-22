import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import type { Product, Variant } from "@/types";
import { useAddToCart } from "@/hooks/useCart";
import { useUiStore } from "@/stores/ui.store";
import { Button } from "@/components/ui/Button";
import { cn, effectivePrice, formatCurrency, productImage } from "@/lib/utils";

/**
 * "Frequently bought together" — the current piece plus up to two add-ons:
 * the admin's cross-sell picks first (when they're in the related list with
 * full details), then other related products. Only in-stock, single-option
 * add-ons are offered so they can be added in one click.
 */
export function FrequentlyBoughtTogether({
  product,
  variant,
  related,
}: {
  product: Product;
  variant?: Variant;
  related?: Product[];
}) {
  const addToCart = useAddToCart();
  const openCart = useUiStore((s) => s.setCartDrawerOpen);
  const [adding, setAdding] = useState(false);

  const addOns = useMemo(() => {
    const crossIds = new Set((product.crossSell ?? []).map((c) => (typeof c === "string" ? c : c._id)));
    const eligible = (related ?? []).filter((p) => p._id !== product._id && !p.hasVariants && p.stock > 0);
    return [...eligible.filter((p) => crossIds.has(p._id)), ...eligible.filter((p) => !crossIds.has(p._id))].slice(0, 2);
  }, [product, related]);

  const currentAvailable = product.hasVariants ? !!variant && variant.stock > 0 : product.stock > 0;
  const items = [
    { key: "current", product, variant, price: variant ? effectivePrice(variant) : effectivePrice(product), image: variant?.images?.[0]?.url || productImage(product), available: currentAvailable },
    ...addOns.map((p) => ({ key: p._id, product: p, variant: undefined, price: effectivePrice(p), image: productImage(p), available: true })),
  ];

  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => setSelected(new Set(items.filter((i) => i.available).map((i) => i.key))), [product._id, variant?._id, addOns.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (addOns.length === 0) return null;

  const chosen = items.filter((i) => selected.has(i.key) && i.available);
  const total = chosen.reduce((s, i) => s + i.price, 0);

  const addAll = async () => {
    setAdding(true);
    try {
      for (const i of chosen) {
        await addToCart.mutateAsync({ product: i.product, variant: i.variant, productId: i.product._id, quantity: 1, variantId: i.variant?._id });
      }
      openCart(true);
    } catch {
      /* the add-to-cart hook already reports the error */
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="rounded-panel border border-border bg-surface p-5 sm:p-8">
      <p className="eyebrow">Complete the look</p>
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">Frequently Bought Together</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
        <ul className="flex flex-wrap items-center gap-3 sm:gap-4">
          {items.map((i, idx) => {
            const on = selected.has(i.key) && i.available;
            return (
              <li key={i.key} className="flex items-center gap-3 sm:gap-4">
                {idx > 0 && <Plus size={18} className="flex-none text-accent" />}
                <div className="w-28 sm:w-36">
                  <div className={cn("relative overflow-hidden rounded-2xl bg-surface-muted transition-opacity", !on && "opacity-45")}>
                    {i.image && <img src={i.image} alt={i.product.title} loading="lazy" className="aspect-square w-full object-cover" />}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      disabled={!i.available}
                      onClick={() =>
                        setSelected((s) => {
                          const n = new Set(s);
                          if (n.has(i.key)) n.delete(i.key);
                          else n.add(i.key);
                          return n;
                        })
                      }
                      aria-label={`${on ? "Remove" : "Include"} ${i.product.title}`}
                      className={cn(
                        "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                        on ? "border-primary bg-primary text-fg-inverse" : "border-fg-inverse bg-surface/80",
                      )}
                    >
                      {on && <Check size={13} strokeWidth={3} />}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-snug text-fg">
                    {idx === 0 ? (
                      <span className="font-semibold">This item: </span>
                    ) : null}
                    {idx === 0 ? (
                      i.product.title
                    ) : (
                      <Link to={`/products/${i.product.slug}`} className="hover:text-primary">
                        {i.product.title}
                      </Link>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-fg">{formatCurrency(i.price)}</p>
                  {idx === 0 && !i.available && <p className="text-label text-danger">{product.hasVariants ? "Choose an option above" : "Out of stock"}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="rounded-2xl bg-surface-muted p-5">
          <p className="text-sm text-fg-muted">
            Total for {chosen.length} item{chosen.length === 1 ? "" : "s"}
          </p>
          <p className="mt-1 font-display text-4xl font-semibold leading-none text-fg">{formatCurrency(total)}</p>
          <Button className="mt-4 w-full" disabled={chosen.length === 0} isLoading={adding} onClick={addAll}>
            Add {chosen.length > 1 ? `all ${chosen.length}` : ""} to bag
          </Button>
        </div>
      </div>
    </section>
  );
}
