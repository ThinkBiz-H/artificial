import { useState } from "react";
import { Star, Trash2, Search } from "lucide-react";
import { useProductList } from "@/hooks/useProducts";
import { useProductReviews, useDeleteProductReview } from "@/hooks/useProducts";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate, cn } from "@/lib/utils";

export function ReviewsPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const { data: productData, isLoading: loadingProducts } = useProductList({ keyword: keyword || undefined, limit: 20, sort: "-numReviews" });
  const { data: reviewData, isLoading: loadingReviews } = useProductReviews(selectedProductId || undefined);
  const deleteReview = useDeleteProductReview(selectedProductId || "");

  return (
    <div>
      <PageHeader title="Reviews" description="Reviews are attached to individual products. Select a product to moderate its reviews." />

      <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted">
        This backend publishes reviews automatically for verified purchases and has no approve/reject workflow — moderation here is limited to removing reviews.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader title="Products" />
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-light" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-border bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-ink"
              />
            </div>
          </div>
          <CardBody className="max-h-[560px] overflow-y-auto p-0">
            {loadingProducts ? (
              <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <ul className="divide-y divide-border">
                {productData?.products.map((p) => (
                  <li key={p._id}>
                    <button
                      onClick={() => setSelectedProductId(p._id)}
                      className={cn("flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-surface", selectedProductId === p._id && "bg-surface")}
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="flex flex-none items-center gap-1 text-xs text-muted"><Star size={11} className="fill-ink text-ink" />{p.numReviews}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={selectedProductId ? "Reviews" : "Select a product"} />
          <CardBody>
            {!selectedProductId ? (
              <EmptyState title="No product selected" description="Choose a product from the list to view its reviews." />
            ) : loadingReviews ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : !reviewData || reviewData.reviews.length === 0 ? (
              <EmptyState title="No reviews for this product" />
            ) : (
              <div className="space-y-4">
                {reviewData.reviews.map((review) => {
                  const reviewer = typeof review.user === "object" ? review.user : null;
                  return (
                    <div key={review._id} className="flex items-start justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink">{reviewer?.name || "Verified buyer"}</p>
                          {review.isVerifiedPurchase && <span className="rounded bg-success-bg px-1.5 py-0.5 text-[10px] text-success">Verified</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={12} className={cn(i <= review.rating ? "fill-ink text-ink" : "text-border-strong")} />
                          ))}
                        </div>
                        {review.comment && <p className="mt-2 text-sm text-ink">{review.comment}</p>}
                        <p className="mt-1 text-xs text-muted">{formatDate(review.createdAt)}</p>
                      </div>
                      <button onClick={() => setDeleteReviewId(review._id)} className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete review">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={() => deleteReviewId && deleteReview.mutate(deleteReviewId, { onSuccess: () => setDeleteReviewId(null) })}
        title="Delete review"
        confirmLabel="Delete"
        danger
        isLoading={deleteReview.isPending}
      />
    </div>
  );
}
