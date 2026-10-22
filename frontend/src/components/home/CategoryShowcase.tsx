import { CategoryCard } from "./CategoryCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Category } from "@/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CategoryShowcase({
  categories,
  isLoading,
}: {
  categories: Category[];
  isLoading?: boolean;
}) {
  if (!isLoading && categories.length === 0) return null;

  const items = categories.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
      {/* Heading */}

      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="uppercase tracking-[0.35em] text-xs text-[#B68B40]">
            Shop by Category
          </p>

          <h2 className="mt-3 font-display text-5xl">Find your signature</h2>
        </div>

        <Link
          to="/products"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.28em]"
        >
          Shop all jewellery
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Categories */}

      <div className="no-scrollbar -mx-5 flex snap-x gap-5 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:px-0 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-t-[180px]" />
                <Skeleton className="mx-auto mt-5 h-6 w-24" />
              </div>
            ))
          : items.map((category) => (
              <div
                key={category._id}
                className="w-[42vw] shrink-0 snap-start md:w-auto"
              >
                <CategoryCard category={category} />
              </div>
            ))}
      </div>
    </section>
  );
}
