import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { RevealImage } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";

const COLLECTION_KEYWORDS = ["kundan", "pearl", "american diamond", "american-diamond", "ad-", "temple", "oxidi", "polki", "western", "antique", "meenakari", "victorian"];

/**
 * Picks collection-style categories from the admin tree: keyword matches
 * (Kundan, Pearl, AD, Temple…) first, then subcategories, then anything
 * else with an image — skipping those already shown in "Shop by Category".
 */
export function pickCollections(all: (Category & { depth: number })[], exclude: Set<string>) {
  const withImage = all.filter((c) => c.image?.url && c.status === "active");
  const keyword = withImage.filter((c) => COLLECTION_KEYWORDS.some((k) => `${c.name} ${c.slug}`.toLowerCase().includes(k)));
  const sub = withImage.filter((c) => c.depth > 0 && !exclude.has(c._id));
  const rest = withImage.filter((c) => !exclude.has(c._id));
  // Every eligible category, in priority order — no fixed count.
  const seen = new Set<string>();
  return [...keyword, ...sub, ...rest].filter((c) => (seen.has(c._id) ? false : (seen.add(c._id), true)));
}

export function TrendingCollections({ collections }: { collections: Category[] }) {
  if (collections.length === 0) return null;
  const [lead, ...others] = collections;

  const tile = (c: Category, big = false) => (
    <Link key={c._id} to={`/categories/${c.slug}`} className="group relative block h-full overflow-hidden rounded-2xl bg-surface-muted">
      <RevealImage src={c.image!.url} alt={c.name} className="absolute inset-0" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
      <span className="absolute inset-0 bg-fg/20 transition-colors group-hover:bg-fg/30" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 text-fg-inverse sm:p-7">
        <p className={cn("font-display font-semibold leading-tight", big ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl")}>{c.name}</p>
        {big && c.shortTitle && <p className="mt-1 max-w-xs text-sm text-fg-inverse/85">{c.shortTitle}</p>}
        <span className="mt-3 inline-flex items-center gap-1.5 text-label font-semibold uppercase tracking-eyebrow">
          Discover <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Curated edits" title="Featured Collections" viewAllTo="/collections" viewAllLabel="All collections" />
        {/* Lead tile spans 2×2; every other collection flows into the grid, however many there are. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[330px] lg:grid-cols-4">
          <div className={cn("col-span-2 aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto", others.length > 0 && "lg:row-span-2")}>{tile(lead, true)}</div>
          {others.map((c) => (
            <div key={c._id} className="aspect-[3/4] lg:aspect-auto">
              {tile(c)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
