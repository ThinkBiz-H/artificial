import { Link } from "react-router-dom";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/categories/${category.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[180px] bg-[#F8F4EE]">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            className="h-full w-full object-cover transition duration-[1400ms] group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-serif text-[#b68b40]">
            {category.name.charAt(0)}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </div>

      <div className="mt-5 text-center">
        <h3 className="font-display text-2xl transition group-hover:text-[#B68B40]">
          {category.name}
        </h3>

        {category.shortTitle && (
          <p className="mt-2 text-xs text-neutral-500">{category.shortTitle}</p>
        )}
      </div>
    </Link>
  );
}
