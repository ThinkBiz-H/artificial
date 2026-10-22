import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus, Plus, Star } from "lucide-react";
import type { Brand, Category } from "@/types";
import { cn } from "@/lib/utils";
import { PRICE_RANGES, type CatalogFilters } from "./catalogParams";

type Update = (patch: Record<string, string | undefined>) => void;

/** Collapsible sidebar section: uppercase label, generous spacing, hairline divider. */
function FilterSection({ title, defaultOpen = true, count = 0, children }: { title: string; defaultOpen?: boolean; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-b border-border py-6">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="group flex w-full items-center justify-between gap-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-fg"
        >
          <span className="flex items-center gap-2">
            {title}
            {count > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-deep px-1 text-[10px] tracking-normal text-fg-inverse">{count}</span>
            )}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-fg-muted transition-colors group-hover:bg-surface-muted group-hover:text-fg" aria-hidden>
            {open ? <Minus size={13} /> : <Plus size={13} />}
          </span>
        </button>
      </h3>
      {open && (
        <div id={id} className="animate-fade-up pt-4">
          {children}
        </div>
      )}
    </section>
  );
}

/** Custom radio / checkbox row with an antique-gold checked state. */
function OptionRow({
  checked,
  onClick,
  children,
  type = "radio",
}: {
  checked: boolean;
  onClick: () => void;
  children: React.ReactNode;
  type?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={checked}
      onClick={onClick}
      className="group flex w-full items-center gap-3 py-2 text-left text-sm text-fg-soft transition-colors hover:text-fg"
    >
      <span
        className={cn(
          "flex h-[18px] w-[18px] flex-none items-center justify-center border transition-[background-color,border-color,transform] duration-300 group-hover:scale-105",
          type === "radio" ? "rounded-full" : "rounded-[4px]",
          checked ? "border-gold-deep bg-gold-deep text-fg-inverse" : "border-border-strong bg-surface group-hover:border-gold-deep",
        )}
        aria-hidden
      >
        {checked && (type === "radio" ? <span className="h-1.5 w-1.5 rounded-full bg-surface" /> : <Check size={12} strokeWidth={3} />)}
      </span>
      <span className={cn("transition-transform duration-300 group-hover:translate-x-0.5", checked && "font-medium text-fg")}>{children}</span>
    </button>
  );
}

function PriceFilter({ min, max, onApply }: { min: string; max: string; onApply: (min?: string, max?: string) => void }) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => {
    setLo(min);
    setHi(max);
  }, [min, max]);

  const field =
    "h-11 w-full min-w-0 rounded-input border border-border bg-surface px-3.5 text-sm text-fg outline-none transition-colors placeholder:text-placeholder focus:border-gold-deep";

  return (
    <div>
      <div>
        {PRICE_RANGES.map((r) => {
          const active = min === r.min && max === r.max;
          return (
            <OptionRow key={r.label} checked={active} onClick={() => (active ? onApply() : onApply(r.min || undefined, r.max || undefined))}>
              {r.label}
            </OptionRow>
          );
        })}
      </div>
      <form
        className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(lo || undefined, hi || undefined);
        }}
      >
        <input type="number" min={0} inputMode="numeric" placeholder="₹ Min" aria-label="Minimum price" value={lo} onChange={(e) => setLo(e.target.value)} className={field} />
        <span className="text-fg-muted" aria-hidden>
          –
        </span>
        <input type="number" min={0} inputMode="numeric" placeholder="₹ Max" aria-label="Maximum price" value={hi} onChange={(e) => setHi(e.target.value)} className={field} />
        <button
          type="submit"
          className="col-span-3 mt-1 h-10 rounded-pill border border-fg text-[11px] font-semibold uppercase tracking-[0.2em] text-fg transition-colors hover:border-primary hover:bg-primary hover:text-fg-inverse"
        >
          Apply price
        </button>
      </form>
    </div>
  );
}

export function FilterPanel({
  filters,
  update,
  onClear,
  activeCount,
  categories,
  currentCategory,
  brands,
}: {
  filters: CatalogFilters;
  update: Update;
  onClear: () => void;
  activeCount: number;
  /** Category tree for the "Category" filter (listing/search pages). */
  categories?: Category[];
  /** On a category page: show its subcategories as navigation instead. */
  currentCategory?: Category;
  brands?: Brand[];
}) {
  const subcategories = currentCategory?.children?.filter((c) => c.status === "active") ?? [];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 pb-2">
        <p className="font-display text-3xl font-semibold leading-none text-fg">Refine</p>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent underline-offset-4 hover:text-primary hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>
      <div className="gold-rule" aria-hidden />

      {currentCategory
        ? subcategories.length > 0 && (
            <FilterSection title="Category">
              <ul className="space-y-1">
                {subcategories.map((c) => (
                  <li key={c._id}>
                    <Link to={`/categories/${c.slug}`} className="group flex items-center justify-between py-1.5 text-sm text-fg-soft transition-colors hover:text-primary">
                      {c.name}
                      <span className="text-fg-muted transition-transform group-hover:translate-x-0.5" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterSection>
          )
        : categories &&
          categories.length > 0 && (
            <FilterSection title="Category" count={filters.category ? 1 : 0}>
              <div className="max-h-72 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <div key={c._id}>
                    <OptionRow checked={filters.category === c._id} onClick={() => update({ category: filters.category === c._id ? undefined : c._id })}>
                      {c.name}
                    </OptionRow>
                    {c.children
                      ?.filter((ch) => ch.status === "active")
                      .map((ch) => (
                        <div key={ch._id} className="pl-6">
                          <OptionRow checked={filters.category === ch._id} onClick={() => update({ category: filters.category === ch._id ? undefined : ch._id })}>
                            {ch.name}
                          </OptionRow>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </FilterSection>
          )}

      <FilterSection title="Price" count={filters.minPrice || filters.maxPrice ? 1 : 0}>
        <PriceFilter min={filters.minPrice} max={filters.maxPrice} onApply={(min, max) => update({ minPrice: min, maxPrice: max })} />
      </FilterSection>

      <FilterSection title="Availability" count={(filters.inStock ? 1 : 0) + (filters.sale ? 1 : 0)}>
        <OptionRow type="checkbox" checked={filters.inStock} onClick={() => update({ inStock: filters.inStock ? undefined : "1" })}>
          In stock only
        </OptionRow>
        <OptionRow type="checkbox" checked={filters.sale} onClick={() => update({ sale: filters.sale ? undefined : "1" })}>
          On sale
        </OptionRow>
      </FilterSection>

      <FilterSection title="Rating" defaultOpen={!!filters.rating} count={filters.rating ? 1 : 0}>
        {["4", "3"].map((r) => (
          <OptionRow key={r} checked={filters.rating === r} onClick={() => update({ rating: filters.rating === r ? undefined : r })}>
            <span className="inline-flex items-center gap-1">
              {r}
              <Star size={12} className="fill-accent-soft text-accent-soft" aria-hidden /> & above
            </span>
          </OptionRow>
        ))}
      </FilterSection>

      {brands && brands.length > 1 && (
        <FilterSection title="Brand" defaultOpen={!!filters.brand} count={filters.brand ? 1 : 0}>
          <div className="max-h-56 overflow-y-auto pr-1">
            {brands.map((b) => (
              <OptionRow key={b._id} checked={filters.brand === b._id} onClick={() => update({ brand: filters.brand === b._id ? undefined : b._id })}>
                {b.name}
              </OptionRow>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}
