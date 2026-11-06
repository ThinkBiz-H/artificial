import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { PLACEHOLDER } from "@/lib/imageFallback";
import { cn } from "@/lib/utils";

/**
 * Every active sub-category of a category (Admin > Categories, in the
 * admin's order) as a circular image card: 2 per row on mobile, 4 on
 * tablet, 6 on desktop. Each card opens that sub-category's listing.
 */
export function SubCategoryGrid({ categories, className }: { categories: Category[]; className?: string }) {
  const items = categories
    .filter((c) => c.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  if (items.length === 0) return null;

  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6", className)}>
      {items.map((c) => (
        <li key={c._id}>
          <Link to={`/categories/${c.slug}`} className="group flex flex-col items-center text-center">
            <span className="block aspect-square w-full max-w-[120px] overflow-hidden rounded-full border border-border bg-surface-muted shadow-soft transition-[border-color,box-shadow,transform] duration-500 ease-luxe group-hover:-translate-y-1 group-hover:border-gold-deep lg:w-[120px]">
              <img
                src={c.icon?.url || c.image?.url || PLACEHOLDER}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
              />
            </span>
            <span className="mt-3 line-clamp-2 font-sub text-sm font-medium leading-snug text-fg transition-colors group-hover:text-primary">
              {c.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
