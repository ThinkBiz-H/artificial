import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Loader2, Newspaper, Search, TrendingUp, X } from "lucide-react";
import type { Blog } from "@/types";
import { useBlogCategories, useBlogHighlights, useInfiniteBlogs } from "@/hooks/useBlog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/common/Pagination";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { BlogCard } from "@/components/blog/BlogCard";
import { FeaturedSlider } from "@/components/blog/FeaturedSlider";
import { InstagramBand, NewsletterBand, PopularTags, RecentlyViewedBlogs, ShopCtaBanner } from "@/components/blog/JournalSections";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full rounded-card" />
      <Skeleton className="mt-5 h-3 w-32" />
      <Skeleton className="mt-3 h-6 w-full" />
      <Skeleton className="mt-2 h-6 w-2/3" />
      <Skeleton className="mt-4 h-3 w-40" />
    </div>
  );
}

function SectionHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-eyebrow text-accent">
        {icon}
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-4xl font-semibold text-fg sm:text-5xl">{title}</h2>
    </div>
  );
}

/** Numbered list of trending posts beside the latest grid. */
function TrendingList({ blogs }: { blogs: Blog[] }) {
  return (
    <ol className="space-y-6">
      {blogs.slice(0, 5).map((blog, i) => (
        <li key={blog._id} className="flex gap-4">
          <span className="w-8 flex-none font-display text-3xl font-semibold leading-none text-accent/60">{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0 flex-1">
            <BlogCard blog={blog} compact />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function BlogListPage() {
  const reduce = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q")?.trim() || undefined;
  const tag = searchParams.get("tag") || undefined;
  const filtered = !!(category || q || tag);

  // The search box follows the URL (back/forward, "Clear filters").
  const [draft, setDraft] = useState(q ?? "");
  const [syncedQ, setSyncedQ] = useState(q);
  if (syncedQ !== q) {
    setSyncedQ(q);
    setDraft(q ?? "");
  }

  const { data: categories } = useBlogCategories();
  const { data: highlights } = useBlogHighlights();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBlogs({
    keyword: q,
    category,
    tag,
    limit: PAGE_SIZE,
    startPage: page,
  });

  const activeCategories = (categories ?? []).filter((c) => c.status !== "inactive");
  const counts = highlights?.categoryCounts ?? {};
  const blogs = useMemo(() => {
    const seen = new Set<string>();
    return (data?.pages ?? []).flatMap((p) => p.data.blogs).filter((b) => (seen.has(b._id) ? false : (seen.add(b._id), true)));
  }, [data]);
  const lastPage = data?.pages[data.pages.length - 1]?.data;
  const total = data?.pages[0]?.data.total ?? 0;

  const featured = highlights?.featured ?? [];
  const trending = highlights?.trending?.length ? highlights.trending : (highlights?.popular ?? []);
  const popular = highlights?.popular ?? [];
  const showHighlights = !filtered && page === 1;
  const imagePool = [...featured, ...popular, ...blogs].map((b) => b.featuredImage?.url).filter((u): u is string => !!u);
  const images = [...new Set(imagePool)];

  // Updates filters; any filter change goes back to the first page.
  const update = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!("page" in next)) params.delete("page");
    setSearchParams(params);
  };
  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : undefined });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const crumbs = [{ name: "Home", path: "/" }, { name: "Journal", path: "/blog" }];
  // A category filter uses that category's own SEO (Admin > Blog categories).
  const selected = category ? activeCategories.find((c) => c._id === category) : undefined;
  const catSeo = selected?.seo;

  const heading = q ? `Results for “${q}”` : tag ? `#${tag}` : selected ? selected.name : "Latest stories";

  return (
    <>
      <Seo
        title={catSeo?.title || (selected ? `${selected.name} · Journal` : "Journal")}
        description={catSeo?.description || selected?.description || "Styling guides, jewellery care tips and stories behind our collections."}
        keywords={catSeo?.keywords || undefined}
        canonicalUrl={catSeo?.canonicalUrl || undefined}
        canonicalPath={selected ? `/blog?category=${selected._id}` : "/blog"}
        ogImage={catSeo?.ogImage || undefined}
        robots={q || tag ? "noindex, follow" : undefined}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-muted/70 to-canvas">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-accent-light/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="container-x relative pb-10 pt-8 sm:pb-14 sm:pt-12">
          <Breadcrumbs items={crumbs} />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-3xl text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">The journal</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-display text-fg sm:text-7xl">
              Stories <span className="italic text-primary">&amp;</span> Styling
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-fg-muted">Styling guides, jewellery care and the stories behind our collections.</p>

            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                update({ q: draft.trim() || undefined });
              }}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface p-1.5 pl-5 shadow-soft transition-shadow focus-within:border-accent focus-within:shadow-lift"
            >
              <Search size={18} className="flex-none text-fg-muted" />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search styling tips, care guides…"
                aria-label="Search the journal"
                className="search-input min-w-0 flex-1 bg-transparent py-2 text-sm text-fg placeholder:text-fg-muted"
              />
              <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-fg-inverse transition-colors hover:bg-primary/90">
                Search
              </button>
            </form>
          </motion.div>

          {activeCategories.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
              {[{ _id: "", name: "All" }, ...activeCategories].map((c) => {
                const active = (category ?? "") === c._id;
                const count = c._id ? counts[c._id] : undefined;
                return (
                  <button
                    key={c._id || "all"}
                    type="button"
                    onClick={() => update({ category: c._id || undefined })}
                    aria-pressed={active}
                    className={cn(
                      "flex-none rounded-full border px-4 py-2 text-sm transition-all",
                      active ? "border-primary bg-primary text-fg-inverse shadow-soft" : "border-border bg-surface/80 text-fg backdrop-blur hover:border-accent hover:text-accent",
                    )}
                  >
                    {c.name}
                    {count ? <span className={cn("ml-1.5 text-xs", active ? "text-fg-inverse/70" : "text-fg-muted")}>{count}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="container-x space-y-20 py-10 sm:space-y-28 sm:py-14">
        {showHighlights && featured.length > 0 && <FeaturedSlider blogs={featured} />}

        {showHighlights && popular.length > 2 && (
          <section>
            <SectionHeading eyebrow="Most read" title="Popular this season" icon={<Flame size={13} />} />
            <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {popular.slice(0, 3).map((b, i) => (
                <div key={b._id} className="w-[80%] flex-none snap-start sm:w-auto">
                  <BlogCard blog={b} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Latest + sidebar */}
        <section id="latest" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow={filtered ? `${total} ${total === 1 ? "story" : "stories"}` : "Fresh from the journal"} title={heading} />
            {filtered && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg-soft transition-colors hover:border-primary hover:text-primary"
              >
                <X size={13} /> Clear filters
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_300px] lg:gap-12">
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
              ) : blogs.length === 0 ? (
                <EmptyState
                  icon={<Newspaper className="h-7 w-7" strokeWidth={1.25} />}
                  title={filtered ? "No stories match" : "No stories yet"}
                  description={filtered ? "Try another search, category or tag." : "New articles are on their way — check back soon."}
                  action={
                    filtered ? (
                      <button type="button" onClick={() => setSearchParams({})} className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-fg-inverse">
                        View all stories
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                    {blogs.map((blog, i) => (
                      <BlogCard key={blog._id} blog={blog} index={i % PAGE_SIZE} />
                    ))}
                    {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={`more-${i}`} />)}
                  </div>
                  {hasNextPage && (
                    <div className="mt-14 flex justify-center">
                      <button
                        type="button"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-fg-inverse disabled:opacity-60"
                      >
                        {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
                        {isFetchingNextPage ? "Loading" : "Load more stories"}
                      </button>
                    </div>
                  )}
                  {/* Page links stay for crawlers and deep links (?page=). */}
                  {lastPage && lastPage.totalPages > 1 && (
                    <Pagination page={lastPage.page} totalPages={lastPage.totalPages} onChange={goToPage} />
                  )}
                </>
              )}
            </div>

            <aside className="space-y-12 lg:sticky lg:top-28 lg:self-start">
              {trending.length > 0 && (
                <div>
                  <p className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-eyebrow text-accent">
                    <TrendingUp size={13} /> Trending now
                  </p>
                  <TrendingList blogs={trending} />
                </div>
              )}
              {(highlights?.tags?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Popular tags</p>
                  <PopularTags tags={highlights!.tags} active={tag} onSelect={(t) => update({ tag: t })} />
                </div>
              )}
              <RecentlyViewedBlogs />
              {filtered && <NewsletterBand compact />}
            </aside>
          </div>
        </section>

        <ShopCtaBanner image={featured[0]?.featuredImage?.url || images[0]} />
        <InstagramBand images={images} />
        {!filtered && <NewsletterBand />}
      </div>
    </>
  );
}
