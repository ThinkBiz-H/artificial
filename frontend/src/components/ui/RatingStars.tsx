import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  showCount,
  count,
  className,
}: {
  rating: number;
  size?: number;
  showCount?: boolean;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={cn(i <= Math.round(rating) ? "fill-accent-soft text-accent-soft" : "fill-transparent text-border-strong")}
          />
        ))}
      </div>
      {showCount && <span className="text-label text-fg-muted">({count ?? 0})</span>}
    </div>
  );
}
