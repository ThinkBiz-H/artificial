import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductPrice } from "@/components/product/ProductCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { RevealImage, Reveal } from "@/components/common/Reveal";
import { useAddToCart } from "@/hooks/useCart";
import { useUiStore } from "@/stores/ui.store";
import { effectivePrice, productImage } from "@/lib/utils";

/** One hero product (admin "featured" flag) plus four supporting featured pieces. */
export function FeaturedSpotlight({
  products,
  isLoading,
  eyebrow = "Hand-picked",
  title = "Featured Jewellery",
  viewAllTo = "/products?sort=-featured,-createdAt",
}: {
  products?: Product[];
  isLoading?: boolean;
  eyebrow?: string;
  title?: string;
  viewAllTo?: string;
}) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const openCart = useUiStore((s) => s.setCartDrawerOpen);

  if (!isLoading && (!products || products.length === 0)) return null;
  const [hero, ...rest] = products ?? [];
  const heroImage = hero ? productImage(hero) : undefined;
  const inStock = hero && (hero.hasVariants || hero.stock > 0);

  const buy = () => {
    if (!hero) return;
    if (hero.hasVariants) return navigate(`/products/${hero.slug}`);
    addToCart.mutate({ product: hero, productId: hero._id, quantity: 1 }, { onSuccess: () => openCart(true) });
  };

  return (
    <section className="bg-surface-muted py-16 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-14">
        {isLoading || !hero ? (
          <Skeleton className="aspect-[4/5] w-full" />
        ) : (
          <div className="flex flex-col">
            <Link to={`/products/${hero.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-panel bg-surface-muted shadow-soft">
              {heroImage && (
                <RevealImage src={heroImage} alt={hero.title} className="absolute inset-0" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
              )}
              <span className="absolute left-4 top-4 rounded-2xl bg-surface px-3 py-1.5 text-2xs font-semibold uppercase tracking-eyebrow text-fg">
                Spotlight
              </span>
            </Link>
            <Reveal className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-display text-3xl font-semibold leading-tight text-fg">
                  <Link to={`/products/${hero.slug}`} className="hover:text-accent">
                    {hero.title}
                  </Link>
                </h3>
                {hero.numReviews > 0 && <RatingStars className="mt-2" rating={hero.rating} showCount count={hero.numReviews} />}
                <ProductPrice className="mt-2" price={effectivePrice(hero)} mrp={hero.price} />
              </div>
              <Button className="flex-none" disabled={!inStock} isLoading={addToCart.isPending} onClick={buy}>
                {!inStock ? "Sold out" : hero.hasVariants ? "Choose options" : "Add to bag"}
              </Button>
            </Reveal>
          </div>
        )}

        <div>
          <p className="eyebrow">{eyebrow}</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h2 className="font-display text-5xl font-semibold leading-display text-fg sm:text-5xl">{title}</h2>
            <Link
              to={viewAllTo}
              className="hidden flex-none items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-label text-accent hover:text-fg sm:inline-flex"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : rest.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
