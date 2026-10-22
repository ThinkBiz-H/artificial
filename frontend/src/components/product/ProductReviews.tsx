import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BadgeCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { useAddReview, useProductReviews } from "@/hooks/useProducts";
import { useAuthStore } from "@/stores/auth.store";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const addReview = useAddReview(productId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please choose a star rating");
    addReview.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-sm font-semibold text-fg">Your rating</p>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`}>
            <Star size={26} strokeWidth={1.25} className={cn("transition-colors", i <= (hover || rating) ? "fill-accent-soft text-accent-soft" : "text-border-strong")} />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-4"
        placeholder="How did it look and feel? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        aria-label="Review"
      />
      <Button type="submit" size="sm" className="mt-4" isLoading={addReview.isPending}>
        Submit review
      </Button>
    </form>
  );
}

export function ProductReviews({ productId, rating, numReviews }: { productId: string; rating: number; numReviews: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const { data, isLoading } = useProductReviews(productId);
  const [formOpen, setFormOpen] = useState(false);
  const reviews = data?.reviews ?? [];
  const distribution = data?.distribution ?? [];
  const avg = data?.rating ?? rating;
  const count = data?.numReviews ?? numReviews;

  return (
    <section id="reviews" className="scroll-mt-40 border-t border-border py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-fg">Customer Reviews</h2>
          {count > 0 ? (
            <>
              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-6xl font-semibold leading-none text-fg">{avg.toFixed(1)}</span>
                <div className="pb-1">
                  <RatingStars rating={avg} size={15} />
                  <p className="mt-1 text-xs text-fg-muted">
                    Based on {count} review{count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              {distribution.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {[...distribution]
                    .sort((a, b) => b.star - a.star)
                    .map((d) => (
                      <li key={d.star} className="flex items-center gap-3 text-xs text-fg-muted">
                        <span className="w-6 tabular-nums">{d.star}★</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <span className="block h-full rounded-full bg-accent-soft" style={{ width: `${d.percentage}%` }} />
                        </span>
                        <span className="w-6 text-right tabular-nums">{d.count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-fg-muted">No reviews yet — be the first to share your thoughts.</p>
          )}
          <div className="mt-7">
            {isAuthenticated ? (
              !formOpen && (
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  Write a review
                </Button>
              )
            ) : (
              <Link to="/login" state={{ from: location.pathname }} className={buttonClasses({ variant: "outline" })}>
                Log in to review
              </Link>
            )}
          </div>
        </div>

        <div>
          {formOpen && isAuthenticated && (
            <div className="mb-8">
              <ReviewForm productId={productId} onDone={() => setFormOpen(false)} />
            </div>
          )}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <ul className="divide-y divide-border border-y border-border">
              {reviews.map((review) => {
                const name = typeof review.user === "object" ? review.user?.name : undefined;
                return (
                  <li key={review._id} className="py-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <RatingStars rating={review.rating} size={13} />
                      <span className="text-xs text-fg-muted">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment && <p className="mt-3 text-base leading-relaxed text-fg">{review.comment}</p>}
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {review.images.map((img) => (
                          <img key={img.url} src={img.url} alt="Customer photo" loading="lazy" className="h-16 w-16 rounded-2xl object-cover" />
                        ))}
                      </div>
                    )}
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-fg-soft">
                      {name || "Customer"}
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-success">
                          <BadgeCheck size={13} /> Verified buyer
                        </span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl bg-surface-muted/50 p-8 text-center text-sm text-fg-muted">
              Reviews from customers will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
