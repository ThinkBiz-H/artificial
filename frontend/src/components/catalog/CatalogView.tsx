import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import { useInfiniteProductList } from "@/hooks/useProducts";
import { useBrands, useCategoryTree } from "@/hooks/useCatalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs, type Crumb } from "@/components/common/Breadcrumbs";
import { Reveal } from "@/components/common/Reveal";
import { Drawer } from "@/components/ui/Drawer";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { flattenCategories } from "@/components/home/homeData";
import { cn, formatCurrency } from "@/lib/utils";
import { FilterPanel } from "./FilterPanel";
import { SORT_OPTIONS, countActiveFilters, readFilters, toApiParams } from "./catalogParams";

const PAGE_SIZE = 16;

/** Shop-page frame: wider than the site container, per the luxury listing layout. */
const FRAME = "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10";

/** Calls `onVisible` when the sentinel nears the viewport — drives infinite loading. */
function LoadMoreSentinel({ onVisible, disabled }: { onVisible: () => void; disabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onVisible);
  cb.current = onVisible;
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && cb.current(), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [disabled]);
  return <div ref={ref} aria-hidden className="h-px" />;
}

/** Full-width editorial break shown inside the product grid, promoting another collection. */
function EditorialInsert({ category }: { category: Category }) {
  return (
    <Link to={`/categories/${category.slug}`} className="group my-2 grid overflow-hidden rounded-image bg-cream sm:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-[16/9] overflow-hidden sm:aspect-auto sm:min-h-[280px]">
        <img
          src={category.image!.url}
          alt={category.name}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          className="absolute inset-0 h-full w-full object-cover transition duration-1000 ease-luxe group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <p className="eyebrow">You may also love</p>
        <p className="mt-3 font-display text-4xl font-semibold leading-tight text-fg sm:text-5xl">{category.name}</p>
        {(category.shortTitle || category.description) && <p className="mt-3 line-clamp-2 max-w-sm text-sm leading-relaxed text-fg-muted">{category.shortTitle || category.description}</p>}
        <span className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg">
          Explore the collection <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function CatalogView({
  title,
  eyebrow,
  description,
  crumbs,
  category,
  banner,
  emptyAction,
  preset,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  crumbs: Crumb[];
  /** Category pages pin the listing to this category. */
  category?: Category;
  /** Optional hero/banner above the toolbar (category banners). */
  banner?: React.ReactNode;
  emptyAction?: React.ReactNode;
  /** Default URL params for curated pages (e.g. { sort: "-createdAt" } or { sale: "1" }); params the shopper sets win. */
  preset?: Record<string, string>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const presetKey = JSON.stringify(preset ?? {});
  const effectiveParams = useMemo(() => {
    const merged = new URLSearchParams(searchParams);
    Object.entries(preset ?? {}).forEach(([k, v]) => !merged.has(k) && merged.set(k, v));
    return merged;
  }, [searchParams, presetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const filters = readFilters(effectiveParams);
  // Chips + the "clear" count reflect only what the shopper chose, not the page preset.
  const chosen = readFilters(searchParams);

  const { data: tree = [] } = useCategoryTree();
  const { data: brands } = useBrands();
  const allCategories = useMemo(() => flattenCategories(tree.filter((c) => c.status === "active")), [tree]);

  const params = useMemo(() => {
    // Pages come from the infinite query, not the URL.
    const { page: _page, ...rest } = toApiParams(filters, category?._id, PAGE_SIZE);
    return rest;
  }, [effectiveParams, category?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  const { data, isLoading, isError, refetch, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProductList(params);
  const products = useMemo(() => data?.pages.flatMap((p) => p.data.products) ?? [], [data]);
  const isRefiltering = isFetching && !isLoading && !isFetchingNextPage;
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setSearchParams(next);
  };
  const clearAll = () => {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    if (filters.sort) next.set("sort", filters.sort);
    setSearchParams(next);
  };

  const activeCount = countActiveFilters(chosen, !category);

  // Chips for every active filter, each removable.
  const chips: { label: string; clear: Record<string, undefined> }[] = [];
  if (!category && chosen.category) {
    const c = allCategories.find((x) => x._id === chosen.category);
    chips.push({ label: c?.name || "Category", clear: { category: undefined } });
  }
  if (chosen.minPrice || chosen.maxPrice) {
    const label =
      chosen.minPrice && chosen.maxPrice
        ? `${formatCurrency(+chosen.minPrice)} – ${formatCurrency(+chosen.maxPrice)}`
        : chosen.minPrice
          ? `Above ${formatCurrency(+chosen.minPrice)}`
          : `Under ${formatCurrency(+chosen.maxPrice)}`;
    chips.push({ label, clear: { minPrice: undefined, maxPrice: undefined } });
  }
  if (chosen.inStock) chips.push({ label: "In stock", clear: { inStock: undefined } });
  if (chosen.sale) chips.push({ label: "On sale", clear: { sale: undefined } });
  if (chosen.rating) chips.push({ label: `${chosen.rating}★ & above`, clear: { rating: undefined } });
  if (chosen.brand) chips.push({ label: brands?.find((b) => b._id === chosen.brand)?.name || "Brand", clear: { brand: undefined } });

  // Editorial break: another collection with an image (not the current one).
  const insertCategory = allCategories.find((c) => c.image?.url && c._id !== category?._id && c._id !== filters.category && c.parent !== category?._id);

  const total = data?.pages[0]?.data.pagination?.total;
  const panel = (
    <FilterPanel
      filters={filters}
      update={update}
      onClear={clearAll}
      activeCount={activeCount}
      categories={category ? undefined : tree.filter((c) => c.status === "active")}
      currentCategory={category}
      brands={brands}
    />
  );

  const sortSelect = (
    <label className="relative flex items-center gap-3">
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted sm:inline">Sort by</span>
      <select
        value={filters.sort || ""}
        onChange={(e) => update({ sort: e.target.value || undefined })}
        aria-label="Sort products"
        className="h-10 cursor-pointer appearance-none border-b border-fg/25 bg-transparent pr-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg outline-none transition-colors hover:border-gold-deep focus:border-gold-deep"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-0 text-fg-muted" aria-hidden />
    </label>
  );

  const countLabel =
    typeof total === "number" ? (
      <>
        Showing <span className="text-fg">{products.length}</span> of <span className="text-fg">{total}</span> {total === 1 ? "product" : "products"}
      </>
    ) : isLoading ? (
      "Loading pieces…"
    ) : null;

  return (
    <div>
      {banner}

      {/* Luxury page header */}
      <section className="relative overflow-hidden border-b border-border bg-cream">
        <div className="catalog-pattern pointer-events-none absolute inset-y-0 right-0 w-full sm:w-2/3" aria-hidden />
        <Reveal className={cn(FRAME, "relative py-12 sm:py-16 lg:py-20")}>
          <Breadcrumbs items={crumbs} className="text-[11px] uppercase tracking-[0.2em]" />
          {eyebrow && <p className="eyebrow ornament mt-8 sm:mt-10">{eyebrow}</p>}
          <h1 className="mt-4 max-w-4xl font-display text-[32px] font-semibold leading-[1.05] text-fg sm:text-[40px] lg:text-[60px]">{title}</h1>
          {description && <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted">{description}</p>}

          {category && (category.children?.length ?? 0) > 0 && (
            <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {category
                .children!.filter((c) => c.status === "active")
                .map((c) => (
                  <Link
                    key={c._id}
                    to={`/categories/${c.slug}`}
                    className="flex-none rounded-full border border-border bg-surface px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg transition-colors hover:border-gold-deep hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          )}
        </Reveal>
      </section>

      <div className={cn(FRAME, "grid gap-10 pb-20 pt-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:pt-14 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-16")}>
        {/* Sidebar — sticky on desktop; a left drawer on mobile */}
        <aside className="hidden lg:block" aria-label="Product filters">
          <Reveal className="sticky top-[calc(var(--header-h,89px)+32px)] max-h-[calc(100vh-var(--header-h,89px)-56px)] overflow-y-auto pb-8 pr-3" y={10}>
            {panel}
          </Reveal>
        </aside>

        <div className="min-w-0">
          {/* Toolbar — sticky under the header on mobile, inline above the grid on desktop */}
          <div className="sticky top-[var(--header-h,64px)] z-30 -mx-4 border-b border-border bg-canvas/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
            <div className="flex h-16 items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-11 items-center gap-2.5 rounded-pill border border-fg/80 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg transition-colors hover:border-primary hover:bg-primary hover:text-fg-inverse lg:hidden"
              >
                <SlidersHorizontal size={15} aria-hidden /> Filter
                {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-deep px-1 text-2xs tracking-normal text-fg-inverse">{activeCount}</span>}
              </button>
              <p className="hidden text-sm text-fg-muted lg:block" aria-live="polite">
                {isRefiltering ? "Updating…" : countLabel}
              </p>
              {sortSelect}
            </div>
          </div>

          {/* Active filters */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-5">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update(chip.clear)}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="flex items-center gap-1.5 rounded-full border border-gold-deep/40 bg-surface px-3.5 py-1.5 text-xs text-fg transition-colors hover:border-gold-deep hover:bg-cream"
                >
                  {chip.label} <X size={12} aria-hidden />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="px-2 text-xs text-fg-muted underline underline-offset-4 hover:text-fg">
                Clear all
              </button>
            </div>
          )}
          <p className="pt-4 text-xs text-fg-muted lg:hidden" aria-live="polite">
            {isRefiltering ? "Updating…" : countLabel}
          </p>

          <div className={cn("pt-6 transition-opacity duration-300 lg:pt-8", isRefiltering && "opacity-60")} aria-busy={isLoading || isRefiltering || undefined}>
            {isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (
              <ProductGrid
                spacious
                products={isLoading ? undefined : products}
                isLoading={isLoading}
                skeletonCount={9}
                insertAfter={9}
                insert={insertCategory ? <EditorialInsert category={insertCategory} /> : undefined}
                emptyTitle={activeCount > 0 ? "No matches for these filters" : "No pieces here yet"}
                emptyDescription={activeCount > 0 ? "Try removing a filter or widening the price range." : "New designs are added regularly — explore our other collections meanwhile."}
                emptyAction={
                  activeCount > 0 ? (
                    <Button variant="outline" onClick={clearAll}>
                      Clear filters
                    </Button>
                  ) : (
                    (emptyAction ?? (
                      <Link to="/categories" className={buttonClasses()}>
                        Browse collections
                      </Link>
                    ))
                  )
                }
              />
            )}

            {/* Progress + load more (infinite pagination) */}
            {!isError && products.length > 0 && typeof total === "number" && (
              <div className="mt-20 flex flex-col items-center gap-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">
                  {products.length} of {total} {total === 1 ? "piece" : "pieces"}
                </p>
                <div className="h-[2px] w-64 overflow-hidden rounded-full bg-border" aria-hidden>
                  <div
                    className="h-full rounded-full bg-gold-deep transition-[width] duration-700 ease-luxe"
                    style={{ width: `${Math.min(100, (products.length / Math.max(total, 1)) * 100)}%` }}
                  />
                </div>
                {hasNextPage && (
                  <>
                    <LoadMoreSentinel onVisible={loadMore} disabled={isFetchingNextPage} />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMore}
                      isLoading={isFetchingNextPage}
                      className="mt-2 border-gold-deep px-12 tracking-[0.2em] text-fg hover:border-gold-deep hover:bg-gold-deep hover:text-fg-inverse"
                    >
                      {isFetchingNextPage ? "Loading" : "Load more"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="left"
        title="Filter & sort"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clearAll} disabled={activeCount === 0}>
              Clear
            </Button>
            <Button className="flex-[2]" onClick={() => setFiltersOpen(false)}>
              Show {typeof total === "number" ? `${total} ` : ""}results
            </Button>
          </div>
        }
      >
        <div className="px-5 pb-6 pt-2">
          <div className="border-b border-border pb-5 pt-2">{sortSelect}</div>
          {panel}
        </div>
      </Drawer>
    </div>
  );
}
