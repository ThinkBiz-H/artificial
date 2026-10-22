import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/common/Reveal";
import type { Product } from "@/types";

export function BestSellers({
  products,
  isLoading,
  viewAllTo = "/shop",
}: {
  products?: Product[];
  isLoading?: boolean;
  viewAllTo?: string;
}) {
  const [activeTab, setActiveTab] = useState<"best" | "featured" | "new">(
    "best",
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    switch (activeTab) {
      case "featured":
        return products.filter((p) => p.featured);

      case "new":
        return [...products].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );

      default:
        return [...products].sort(
          (a, b) => (b.salesCount || 0) - (a.salesCount || 0),
        );
    }
  }, [products, activeTab]);

  // Hooks above must run on every render — only bail out after them.
  if (!isLoading && (!products || products.length === 0)) return null;

  // agar featured empty hai to sab dikha do
  const items =
    filteredProducts.length > 0
      ? filteredProducts.slice(0, 10)
      : (products ?? []).slice(0, 10);

  return (
    <section className="bg-[#FAF7F2] py-20">
      <div className="container-x">
        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="eyebrow tracking-[0.35em] uppercase">THE EDIT</p>

          <h2 className="mt-3 font-display text-4xl font-light md:text-6xl">
            Most coveted pieces
          </h2>

          {/* Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex overflow-hidden border border-[#ddd]">
              <button
                onClick={() => setActiveTab("best")}
                className={`px-8 py-3 text-xs uppercase tracking-[0.3em] transition ${
                  activeTab === "best"
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Best Sellers
              </button>

              <button
                onClick={() => setActiveTab("featured")}
                className={`px-8 py-3 text-xs uppercase tracking-[0.3em] transition ${
                  activeTab === "featured"
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Featured
              </button>

              <button
                onClick={() => setActiveTab("new")}
                className={`px-8 py-3 text-xs uppercase tracking-[0.3em] transition ${
                  activeTab === "new"
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                New In
              </button>
            </div>
          </div>
        </div>

        {/* Products */}

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : items.map((product, index) => (
                <Reveal key={product._id} delay={(index % 5) * 0.08}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>

        {/* View All */}

        <div className="mt-14 flex justify-center">
          <Link
            to={viewAllTo}
            className="border border-black px-12 py-4 text-xs uppercase tracking-[0.35em] transition-all duration-300 hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
