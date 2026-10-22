import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Clock, Loader2, Search as SearchIcon, TrendingUp, X } from "lucide-react";
import { useBestSellers, useProductSearch, useTrendingProducts } from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCatalog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFocusTrap, useOverlay } from "@/components/ui/Modal";
import { flattenCategories } from "@/components/home/homeData";
import { useRecentSearchesStore } from "@/stores/recentSearches.store";
import { cn, effectivePrice, formatCurrency, productImage } from "@/lib/utils";
import type { Category, Product } from "@/types";

const searchHref = (q: string) => `/search?q=${encodeURIComponent(q)}`;

function GroupLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-label font-semibold uppercase tracking-eyebrow text-accent">
      {icon}
      {children}
    </p>
  );
}

function ProductRow({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const img = productImage(product);
  const category = typeof product.category === "object" ? product.category?.name : undefined;
  return (
    <Link to={`/products/${product.slug}`} onClick={onNavigate} className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas">
      <div className="h-14 w-14 flex-none overflow-hidden rounded-xl bg-surface-muted">
        {img && <img src={img} alt="" loading="lazy" width={56} height={56} onError={(e) => (e.currentTarget.style.visibility = "hidden")} className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold text-fg">{product.title}</p>
        {category && <p className="mt-0.5 text-label uppercase tracking-label text-fg-muted">{category}</p>}
      </div>
      <p className="flex-none text-sm font-semibold text-fg">{formatCurrency(effectivePrice(product))}</p>
    </Link>
  );
}

/**
 * Trending terms from live catalogue data: the categories and tags of the
 * store's trending / best-selling products (there is no search-analytics API).
 */
function useTrendingTerms(products: Product[]) {
  return useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (t?: string) => {
      const term = t?.trim();
      if (!term || term.length < 3) return;
      const key = term.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    };
    products.forEach((p) => {
      bump(typeof p.category === "object" ? p.category?.name : undefined);
      p.tags?.slice(0, 3).forEach(bump);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([t]) => t.replace(/\b\w/g, (c) => c.toUpperCase()));
  }, [products]);
}

/** Shown before the shopper types: recent searches, trending terms, categories and popular pieces. */
function SearchDiscovery({ onNavigate, onPick, compact }: { onNavigate: () => void; onPick: (q: string) => void; compact?: boolean }) {
  const recent = useRecentSearchesStore((s) => s.items);
  const removeRecent = useRecentSearchesStore((s) => s.remove);
  const clearRecent = useRecentSearchesStore((s) => s.clear);
  const { data: trending } = useTrendingProducts(8);
  const { data: best } = useBestSellers(8);
  const { data: tree = [] } = useCategoryTree();

  const popular = (trending?.length ? trending : best ?? []).slice(0, 4);
  const terms = useTrendingTerms([...(trending ?? []), ...(best ?? [])]);
  const categories = tree.filter((c) => c.status === "active").slice(0, 8);

  const chip = "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-primary hover:text-primary";

  return (
    <div className={cn("grid gap-8 p-5", !compact && "sm:grid-cols-[1fr_1.1fr] sm:p-7")}>
      <div className="space-y-7">
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <GroupLabel icon={<Clock size={12} aria-hidden />}>Recent searches</GroupLabel>
              <button type="button" onClick={clearRecent} className="text-xs text-fg-muted underline-offset-4 hover:text-fg hover:underline">
                Clear
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {recent.map((q) => (
                <li key={q} className="inline-flex items-center rounded-full border border-border bg-surface">
                  <button type="button" onClick={() => onPick(q)} className="py-1.5 pl-3.5 pr-1 text-sm text-fg hover:text-primary">
                    {q}
                  </button>
                  <button type="button" onClick={() => removeRecent(q)} aria-label={`Remove “${q}” from recent searches`} className="flex h-7 w-7 items-center justify-center text-fg-muted hover:text-fg">
                    <X size={12} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {terms.length > 0 && (
          <section>
            <GroupLabel icon={<TrendingUp size={12} aria-hidden />}>Trending searches</GroupLabel>
            <ul className="mt-3 flex flex-wrap gap-2">
              {terms.map((t) => (
                <li key={t}>
                  <button type="button" onClick={() => onPick(t)} className={chip}>
                    {t} <ArrowUpRight size={12} className="text-fg-muted" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {categories.length > 0 && (
          <section>
            <GroupLabel>Shop by category</GroupLabel>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link to={`/categories/${c.slug}`} onClick={onNavigate} className={chip}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {popular.length > 0 && (
        <section>
          <GroupLabel>Popular right now</GroupLabel>
          <ul className="mt-2 -mx-3">
            {popular.map((p) => (
              <li key={p._id}>
                <ProductRow product={p} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Live suggestions for a query: matching categories (client-side) + products (existing /products?keyword= API). */
function SearchResults({ query, onNavigate, onSubmitAll }: { query: string; onNavigate: () => void; onSubmitAll: (q: string) => void }) {
  const debounced = useDebouncedValue(query.trim(), 250);
  const { data, isFetching, isError } = useProductSearch(debounced, { enabled: debounced.length >= 2 });
  const { data: tree = [] } = useCategoryTree();
  const products: Product[] = data?.products ?? [];

  const categoryMatches: Category[] = useMemo(() => {
    const q = debounced.toLowerCase();
    if (q.length < 2) return [];
    return flattenCategories(tree.filter((c) => c.status === "active"))
      .filter((c) => c.status === "active" && c.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [tree, debounced]);

  if (debounced.length < 2) return null;

  if (isFetching && products.length === 0 && categoryMatches.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-fg-muted" role="status">
        <Loader2 size={16} className="animate-spin" aria-hidden /> Searching…
      </div>
    );
  }
  if (isError) return <p className="py-10 text-center text-sm text-fg-muted">Search is unavailable right now. Please try again.</p>;
  if (products.length === 0 && categoryMatches.length === 0) {
    return (
      <div className="py-10 text-center" role="status">
        <p className="font-display text-2xl text-fg">No matches for “{debounced}”</p>
        <p className="mt-1 font-sub text-sm text-fg-muted">Try a different word, like “jhumka” or “necklace”.</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <p className="sr-only" role="status">
        {data?.pagination?.total ?? products.length} products found
      </p>
      {categoryMatches.length > 0 && (
        <section className="px-3 pb-3 pt-2">
          <GroupLabel>Categories</GroupLabel>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {categoryMatches.map((c) => (
              <li key={c._id}>
                <Link
                  to={`/categories/${c.slug}`}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3.5 py-1.5 text-sm text-fg transition-colors hover:bg-primary hover:text-fg-inverse"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {products.length > 0 && (
        <section>
          <div className="px-3 pt-2">
            <GroupLabel>Products</GroupLabel>
          </div>
          <ul className="mt-1">
            {products.slice(0, 6).map((p) => (
              <li key={p._id}>
                <ProductRow product={p} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        type="button"
        onClick={() => onSubmitAll(debounced)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-t border-border py-3.5 text-xs font-semibold uppercase tracking-label text-primary hover:bg-canvas"
      >
        {products.length > 0 ? `View all ${data?.pagination?.total ?? ""} results for “${debounced}”` : `Search all jewellery for “${debounced}”`} <ArrowRight size={13} aria-hidden />
      </button>
    </div>
  );
}

/** Shared submit: remembers the term, then opens the full results page. */
function useSubmitSearch(after: () => void) {
  const navigate = useNavigate();
  const addRecent = useRecentSearchesStore((s) => s.add);
  return (q: string) => {
    const term = q.trim();
    if (!term) return;
    addRecent(term);
    navigate(searchHref(term));
    after();
  };
}

/**
 * Luxury search drawer — slides down from the top on every screen size:
 * large input, live suggestions while typing, and recent / trending /
 * category / popular-product discovery before the shopper types.
 */
export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  useOverlay(open, onClose);
  const panelRef = useFocusTrap(open);
  const submitSearch = useSubmitSearch(onClose);
  const resultsId = useId();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1250]" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" aria-label="Close search" tabIndex={-1} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-surface-dark/45 backdrop-blur-[2px] animate-[fade-in_300ms_ease-out_both]" />
      <div
        ref={panelRef}
        className="search-drawer relative flex max-h-full flex-col overflow-hidden bg-canvas shadow-lift sm:max-h-[86vh] sm:rounded-b-panel"
      >
        <div className="gold-rule" aria-hidden />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(query);
          }}
          role="search"
          className="mx-auto flex w-full max-w-[1100px] flex-none items-center gap-3 border-b border-border transition-colors focus-within:border-primary px-4 py-4 sm:px-8 sm:py-7"
        >
          <SearchIcon size={22} strokeWidth={1.25} className="flex-none text-accent" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search earrings, necklaces, bridal sets…"
            aria-label="Search products"
            aria-controls={resultsId}
            enterKeyHint="search"
            className="search-input h-12 min-w-0 flex-1 bg-transparent font-display text-2xl font-medium text-fg outline-none placeholder:text-placeholder sm:text-4xl"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="hidden flex-none text-xs font-semibold uppercase tracking-label text-fg-muted hover:text-fg sm:block">
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-border text-fg transition-[color,border-color,transform] duration-300 hover:rotate-90 hover:border-primary hover:text-primary"
          >
            <X size={18} aria-hidden />
          </button>
        </form>
        <div id={resultsId} className="mx-auto w-full max-w-[1100px] flex-1 overflow-y-auto">
          {query.trim().length >= 2 ? (
            <SearchResults query={query} onNavigate={onClose} onSubmitAll={submitSearch} />
          ) : (
            <SearchDiscovery onNavigate={onClose} onPick={submitSearch} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
