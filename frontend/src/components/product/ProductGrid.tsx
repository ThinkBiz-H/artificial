import { Fragment } from "react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { Gem } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

/** Wide cards: 1 column on phones, 2 on tablets, 3 on desktop — 32px column / 48px row gaps. */
const GRID = "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12";

export function ProductGrid({
  products,
  isLoading,
  skeletonCount = 9,
  emptyTitle = "No pieces found",
  emptyDescription = "Try adjusting your filters or explore our other collections.",
  emptyAction,
  insertAfter,
  insert,
  spacious = false,
}: {
  products?: Product[];
  isLoading?: boolean;
  /** Kept for existing callers; every grid now uses the same 1 → 2 → 3 column layout. */
  columns?: 3 | 4;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Render `insert` as a full-width row after this many products (editorial break). */
  insertAfter?: number;
  insert?: React.ReactNode;
  /** Shop pages: cards fade up as they enter the viewport. */
  spacious?: boolean;
}) {
  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<Gem className="h-7 w-7" strokeWidth={1.25} />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={GRID}>
      {products.map((p, i) => (
        <Fragment key={p._id}>
          {spacious ? (
            <Reveal delay={(i % 3) * 0.06} className="h-full">
              <ProductCard product={p} priority={i < 3} />
            </Reveal>
          ) : (
            <ProductCard product={p} priority={i < 3} />
          )}
          {insert && insertAfter && i + 1 === insertAfter && products.length > insertAfter && (
            <div className="col-span-full">{insert}</div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
