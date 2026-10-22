import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { useProductList } from "@/hooks/useProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal, RevealImage } from "@/components/common/Reveal";
import { cn, productImage } from "@/lib/utils";

/**
 * A featured admin category (e.g. Bridal, Everyday): its image as an
 * editorial panel beside four of its real products. Renders nothing when
 * the store has no matching category.
 */
export function CollectionFeature({
  category,
  eyebrow,
  fallbackTitle,
  fallbackText,
  reverse,
  tone = "ivory",
}: {
  category?: Category;
  eyebrow: string;
  fallbackTitle: string;
  fallbackText: string;
  reverse?: boolean;
  tone?: "ivory" | "beige";
}) {
  const { data, isLoading } = useProductList({ category: category?._id, page: 1, limit: 4 }, { enabled: !!category?._id });
  if (!category) return null;
  const products = data?.products ?? [];
  if (!isLoading && products.length === 0) return null;

  const image = category.image?.url || (products[0] ? productImage(products[0]) : undefined);
  const href = `/categories/${category.slug}`;
  const title = category.name.toLowerCase().includes("collection") ? category.name : `${category.name} Collection`;

  return (
    <section className={cn("py-16 sm:py-24", tone === "beige" ? "bg-surface-muted" : "bg-canvas")}>
      <div className={cn("container-x grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16", reverse && "lg:[&>*:first-child]:order-2")}>
        <Link to={href} className="group relative block overflow-hidden rounded-panel bg-surface-muted shadow-soft">
          {image ? (
            <RevealImage src={image} alt={title} className="aspect-[4/5] lg:aspect-[3/4]" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="aspect-[4/5]" />
          )}
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-surface/92 p-5 backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:p-6">
            <p className="text-2xs font-semibold uppercase tracking-eyebrow text-accent">{eyebrow}</p>
            <p className="mt-1.5 font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">{title}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-label text-primary">
              Discover <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <div>
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-display text-fg sm:text-6xl">{category.shortTitle || fallbackTitle}</h2>
            <p className="mt-4 max-w-lg font-sub text-base italic leading-relaxed text-fg-soft">{category.description || fallbackText}</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <Link to={href} className={buttonClasses({ variant: "outline", className: "mt-8" })}>
            Shop {category.name} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
