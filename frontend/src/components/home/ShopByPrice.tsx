import { Link } from "react-router-dom";
import { Reveal } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { Category } from "@/types";

export function ShopByCategory({
  categories,
  isLoading,
}: {
  categories: Category[];
  isLoading?: boolean;
}) {
  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="py-20 bg-[#FAF7F2]">
      <div className="container-x">
        <SectionHeading
          eyebrow="SHOP BY CATEGORY"
          title="Find Your Style"
          description="Browse our premium jewellery collection by category."
          align="center"
        />

        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category, index) => (
            <Reveal key={category._id} delay={index * 0.05}>
              <Link
                to={`/products?category=${category.slug}`}
                className="group block text-center"
              >
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm transition duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
                  <img
                    src={category.image?.url}
                    alt={category.name}
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>

                <h3 className="mt-5 font-display text-2xl">{category.name}</h3>

                {category.shortTitle && (
                  <p className="mt-1 text-sm text-gray-500">
                    {category.shortTitle}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
