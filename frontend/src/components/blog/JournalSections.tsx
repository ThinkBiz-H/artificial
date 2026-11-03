import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { InstagramIcon } from "./BrandIcons";
import type { Blog } from "@/types";
import { productsApi } from "@/api/products";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useJournalStorage } from "@/hooks/useJournalStorage";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { BlogImage } from "./BlogImage";
import { getRecentlyViewed, sizedImage } from "./blogUtils";

const fadeUp = (reduce: boolean | null) => ({
  initial: reduce ? false : { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

/** Wine panel with the newsletter form. */
export function NewsletterBand({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      {...fadeUp(reduce)}
      className={cn(
        "relative overflow-hidden rounded-panel bg-primary text-fg-inverse shadow-lift",
        compact ? "p-6" : "px-6 py-12 sm:px-12 sm:py-16",
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-accent-soft/20 blur-3xl" />
      <div className={cn("relative", compact ? "" : "mx-auto max-w-2xl text-center")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-light">The journal, in your inbox</p>
        <h2 className={cn("mt-3 font-display font-semibold", compact ? "text-2xl" : "text-4xl sm:text-5xl")}>Styling notes, new drops & care guides</h2>
        {!compact && <p className="mt-3 text-sm text-fg-inverse/70">One thoughtful email a fortnight. Unsubscribe any time.</p>}
        <NewsletterForm tone="dark" className={cn("mt-6", !compact && "mx-auto max-w-md")} />
      </div>
    </motion.section>
  );
}

/** Instagram teaser — journal imagery linking to the brand's profile (Brand Management). */
export function InstagramBand({ images }: { images: string[] }) {
  const reduce = useReducedMotion();
  const { social } = useStoreInfo();
  const href = social?.instagram;
  const tiles = images.filter(Boolean).slice(0, 6);
  if (!href || tiles.length < 3) return null;
  const handle = href.replace(/\/+$/, "").split("/").pop();
  return (
    <motion.section {...fadeUp(reduce)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Follow along</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-fg">{handle ? `@${handle}` : "On Instagram"}</h2>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-fg-inverse">
          <InstagramIcon size={14} /> Follow us
        </a>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {tiles.map((src, i) => (
          <a key={`${src}-${i}`} href={href} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-xl" aria-label="Open Instagram">
            <img src={sizedImage(src, 400)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 flex items-center justify-center bg-primary/0 text-white opacity-0 transition-all group-hover:bg-primary/40 group-hover:opacity-100">
              <InstagramIcon size={22} />
            </span>
          </a>
        ))}
      </div>
    </motion.section>
  );
}

/** Shop call-to-action between journal sections. */
export function ShopCtaBanner({ image }: { image?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.section {...fadeUp(reduce)} className="relative overflow-hidden rounded-panel bg-surface-dark">
      <div className="absolute inset-0 opacity-50">
        <BlogImage src={image} alt="" sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/80 to-transparent" />
      <div className="relative max-w-xl px-6 py-14 sm:px-12 sm:py-20">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-light">
          <Sparkles size={13} /> From the story to your jewellery box
        </p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">Wear what inspires you</h2>
        <p className="mt-3 text-sm text-white/70">Explore handcrafted pieces styled in our journal — made for every celebration.</p>
        <Link to="/products" className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-accent-soft px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-surface-dark shadow-lg transition-transform hover:-translate-y-0.5">
          Shop the collection <ArrowRight size={14} />
        </Link>
      </div>
    </motion.section>
  );
}

/** Posts this browser read recently (excluding `exclude`). */
export function RecentlyViewedBlogs({ exclude, className }: { exclude?: string; className?: string }) {
  const recent = useJournalStorage(getRecentlyViewed).filter((p) => p.slug !== exclude).slice(0, 4);
  if (!recent.length) return null;
  return (
    <div className={className}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Recently viewed</p>
      <div className="space-y-4">
        {recent.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex items-center gap-3">
            <div className="h-14 w-16 flex-none overflow-hidden rounded-lg">
              <BlogImage src={p.image} alt="" sizes="64px" />
            </div>
            <p className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-primary">{p.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Tag chips with counts. */
export function PopularTags({ tags, active, onSelect }: { tags: { tag: string; count: number }[]; active?: string; onSelect: (tag?: string) => void }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const on = active?.toLowerCase() === t.tag.toLowerCase();
        return (
          <button
            key={t.tag}
            type="button"
            onClick={() => onSelect(on ? undefined : t.tag)}
            className={cn("rounded-full border px-3.5 py-1.5 text-xs transition-colors", on ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg-soft hover:border-accent hover:text-accent")}
          >
            #{t.tag} <span className="opacity-60">{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Products related to a post — matched by its tags, then its category name. */
export function RelatedProducts({ blog }: { blog: Blog }) {
  const reduce = useReducedMotion();
  const category = typeof blog.category === "object" ? blog.category?.name : undefined;
  const terms = [...(blog.tags ?? []), ...(category ? [category] : [])].filter(Boolean).slice(0, 3);
  const { data: products } = useQuery({
    queryKey: ["blog-related-products", blog._id, terms],
    enabled: terms.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      // First term that finds products wins.
      for (const keyword of terms) {
        // eslint-disable-next-line no-await-in-loop
        const res = await productsApi.list({ keyword, limit: 4 });
        if (res.data.products.length) return res.data.products;
      }
      const latest = await productsApi.list({ limit: 4 });
      return latest.data.products;
    },
  });
  if (!products?.length) return null;
  return (
    <motion.section {...fadeUp(reduce)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Shop the story</p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-fg">Pieces from this article</h2>
        </div>
        <Link to="/products" className="text-xs font-semibold uppercase tracking-eyebrow text-primary underline decoration-accent underline-offset-8">
          View all
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </motion.section>
  );
}
