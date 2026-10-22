import { Link } from "react-router-dom";
import { useBrands } from "@/hooks/useCatalog";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";

/** Admin brands (Admin > Brands) as a logo wall. Hidden until the store has at least two active brands. */
export function FeaturedBrands() {
  const { data: brands } = useBrands();
  const active = (brands ?? []).filter((b) => b.status !== "inactive").slice(0, 10);
  if (active.length < 2) return null;

  return (
    <section className="py-16 sm:py-24" aria-labelledby="brands-heading">
      <div className="container-x">
        <SectionHeading id="brands-heading" eyebrow="Makers we love" title="Featured Brands" viewAllTo="/brands" viewAllLabel="All brands" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {active.map((brand, i) => (
            <li key={brand._id}>
              <Reveal delay={(i % 5) * 0.05}>
                <Link
                  to={`/brands/${brand.slug}`}
                  className="gold-shine group flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-card border border-border bg-surface px-5 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-accent-soft hover:shadow-soft"
                >
                  {brand.logo?.url ? (
                    <>
                      <img
                        src={brand.logo.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="max-h-12 max-w-[75%] object-contain opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                      />
                      <span className="text-label font-medium uppercase tracking-label text-fg-muted">{brand.name}</span>
                    </>
                  ) : (
                    <span className="font-display text-2xl font-semibold text-fg">{brand.name}</span>
                  )}
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
