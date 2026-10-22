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
export function pickCollections(all: (Category & { depth: number })[], exclude: Set<string>, max = 5) {
  const withImage = all.filter((c) => c.image?.url && c.status === "active");
  const keyword = withImage.filter((c) => COLLECTION_KEYWORDS.some((k) => `${c.name} ${c.slug}`.toLowerCase().includes(k)));
  const sub = withImage.filter((c) => c.depth > 0 && !exclude.has(c._id));
  const rest = withImage.filter((c) => !exclude.has(c._id));
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const c of [...keyword, ...sub, ...rest, ...withImage]) {
    if (seen.has(c._id)) continue;
    seen.add(c._id);
    out.push(c);
    if (out.length === max) break;
  }
  return out;
}

export function TrendingCollections({ collections }: { collections: Category[] }) {
  if (collections.length < 3) return null;
  const [lead, ...rest] = collections;
  // The 2×2 slot area beside the lead tile fits either four tiles or two tall ones.
  const others = rest.slice(0, rest.length >= 4 ? 4 : 2);

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
        <SectionHeading eyebrow="Curated edits" title="Featured Collections" viewAllTo="/categories" viewAllLabel="All collections" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:h-[680px] lg:grid-cols-4 lg:grid-rows-2">
          <div className="col-span-2 aspect-[4/5] sm:aspect-[16/10] lg:row-span-2 lg:aspect-auto">{tile(lead, true)}</div>
          {others.map((c) => (
            <div key={c._id} className={cn("aspect-[3/4] lg:aspect-auto", others.length === 2 && "lg:row-span-2")}>
              {tile(c)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
