import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "./ProductCard";

/** Card widths: one-and-a-bit on phones, two on tablets, three wide cards on desktop. */
const ITEM = "w-[78%] flex-none snap-start sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-64px)/3)]";

/**
 * Horizontal product carousel with an editorial heading. Renders nothing
 * once loaded with no products, so callers can list rails freely.
 */
export const ProductRail = memo(function ProductRail({
  eyebrow,
  title,
  description,
  products,
  isLoading,
  viewAllTo,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products?: Product[];
  isLoading?: boolean;
  viewAllTo?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, products?.length]);

  if (!isLoading && (!products || products.length === 0)) return null;

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors duration-300 hover:border-fg hover:bg-fg hover:text-fg-inverse disabled:pointer-events-none disabled:opacity-35";

  return (
    <section className={cn("py-16 sm:py-24", className)} aria-label={title}>
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} viewAllTo={viewAllTo} className="mb-0 flex-1 sm:mb-0" />
          {!isLoading && (products?.length ?? 0) > 1 && (
            <div className="hidden flex-none gap-2 pb-2 sm:flex">
              <button type="button" className={navBtn} onClick={() => scroll(-1)} disabled={edges.start} aria-label={`Previous — ${title}`}>
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button type="button" className={navBtn} onClick={() => scroll(1)} disabled={edges.end} aria-label={`Next — ${title}`}>
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          )}
        </div>

        <ul ref={trackRef} onScroll={measure} className="no-scrollbar -mx-4 mt-9 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-2 sm:mx-0 sm:mt-12 sm:scroll-px-0 sm:px-0 lg:gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className={ITEM}>
                  <ProductCardSkeleton />
                </li>
              ))
            : products!.map((p, i) => (
                <li key={p._id} className={ITEM}>
                  <ProductCard product={p} priority={i < 3} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
});
