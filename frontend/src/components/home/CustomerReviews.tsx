import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BadgeCheck, Quote } from "lucide-react";
import { productsApi } from "@/api/products";
import { useTopRated } from "@/hooks/useProducts";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { formatDate, productImage } from "@/lib/utils";
import type { Product, Review } from "@/types";

interface ShowcaseReview {
  review: Review;
  product: Product;
}

export function ReviewCard({ review, product }: ShowcaseReview) {
  const name = typeof review.user === "object" ? review.user?.name : undefined;
  const img = productImage(product);
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-surface p-7 shadow-lift">
      <Quote size={26} strokeWidth={1} className="text-accent-soft" aria-hidden />
      <RatingStars className="mt-4" rating={review.rating} size={13} />
      <blockquote className="mt-4 flex-1 font-display text-xl italic leading-snug text-fg">“{review.comment}”</blockquote>
      <figcaption className="mt-6 border-t border-border pt-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
          {name || "Verified customer"}
          {review.isVerifiedPurchase && <BadgeCheck size={15} className="text-success" aria-label="Verified purchase" />}
        </p>
        <Link to={`/products/${product.slug}`} className="mt-3 flex items-center gap-3 text-xs text-fg-muted hover:text-fg">
          {img && <img src={img} alt="" loading="lazy" className="h-10 w-10 flex-none rounded-2xl object-cover" />}
          <span className="line-clamp-1">Purchased: {product.title}</span>
        </Link>
        <p className="mt-2 text-label text-fg-muted">{formatDate(review.createdAt)}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Real reviews from the store's top-rated products (existing
 * /products/top-rated + /products/:id/reviews APIs). Hidden when there are
 * no written 4★+ reviews yet.
 */
export function CustomerReviews() {
  const { data: topRated } = useTopRated(6);
  const candidates = (topRated ?? []).filter((p) => p.numReviews > 0).slice(0, 4);

  const results = useQueries({
    queries: candidates.map((p) => ({
      queryKey: ["product-reviews", p._id],
      queryFn: () => productsApi.getReviews(p._id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const reviews: ShowcaseReview[] = results
    .flatMap((r, i) =>
      (r.data?.data.reviews ?? [])
        .filter((rev) => rev.rating >= 4 && rev.comment && rev.comment.trim().length >= 12)
        .map((review) => ({ review, product: candidates[i] })),
    )
    .sort((a, b) => b.review.rating - a.review.rating || +new Date(b.review.createdAt) - +new Date(a.review.createdAt))
    .slice(0, 6);

  if (reviews.length === 0) return null;

  const avg = candidates.length ? candidates.reduce((s, p) => s + p.rating, 0) / candidates.length : 0;

  return (
    <section className="bg-surface-muted py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Kind words"
          title="Loved by Our Customers"
          description={avg ? `Rated ${avg.toFixed(1)} out of 5 on our most-loved pieces.` : undefined}
          align="center"
        />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {reviews.map((r, i) => (
            <Reveal key={r.review._id} delay={(i % 3) * 0.08} className="w-[84%] flex-none snap-start sm:w-[60%] md:w-auto">
              <ReviewCard {...r} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
