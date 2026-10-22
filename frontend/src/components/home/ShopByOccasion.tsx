import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal, RevealImage } from "@/components/common/Reveal";

/** Occasion → keywords matched against admin category names/slugs. */
const OCCASIONS: { label: string; keywords: string[] }[] = [
  { label: "Wedding", keywords: ["bridal", "wedding", "dulhan"] },
  { label: "Festive", keywords: ["festive", "festival", "diwali", "navratri", "puja", "pooja", "ethnic", "traditional"] },
  { label: "Party", keywords: ["party", "cocktail", "evening", "statement"] },
  { label: "Haldi & Mehendi", keywords: ["haldi", "mehendi", "mehndi", "sangeet", "floral"] },
  { label: "Office", keywords: ["office", "work", "minimal", "western"] },
  { label: "Everyday", keywords: ["everyday", "daily", "casual", "lightweight"] },
  { label: "Gifting", keywords: ["gift", "combo", "hamper"] },
];

/**
 * Resolves each occasion to a real admin category (first keyword match with
 * an image wins). Each category is used once, so overlapping keywords don't
 * produce duplicate tiles.
 */
function pickOccasions(categories: Category[], max = 6) {
  const used = new Set<string>();
  const out: { label: string; category: Category }[] = [];
  for (const occasion of OCCASIONS) {
    const match = categories.find(
      (c) =>
        c.status === "active" &&
        c.image?.url &&
        !used.has(c._id) &&
        occasion.keywords.some((k) => `${c.name} ${c.slug}`.toLowerCase().includes(k)),
    );
    if (!match) continue;
    used.add(match._id);
    out.push({ label: occasion.label, category: match });
    if (out.length === max) break;
  }
  return out;
}

/** "Shop by Occasion" — arch-framed tiles linking to the matching admin categories. Hidden with fewer than three matches. */
export function ShopByOccasion({ categories }: { categories: Category[] }) {
  const occasions = pickOccasions(categories);
  if (occasions.length < 3) return null;

  return (
    <section className="bg-surface-muted py-16 sm:py-24" aria-labelledby="occasion-heading">
      <div className="container-x">
        <SectionHeading id="occasion-heading" eyebrow="Dressed for the moment" title="Shop by Occasion" description="From the first ritual to the last dance — find the piece made for it." align="center" />
        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {occasions.map(({ label, category }, i) => (
            <li key={category._id} className="w-[44%] flex-none snap-start sm:w-auto">
              <Reveal delay={i * 0.06}>
                <Link to={`/categories/${category.slug}`} className="group block text-center">
                  <div className="relative overflow-hidden rounded-t-full rounded-b-image bg-surface p-1.5 shadow-soft transition-transform duration-500 group-hover:-translate-y-1.5">
                    <RevealImage
                      src={category.image!.url}
                      alt=""
                      className="aspect-[3/4] rounded-t-full rounded-b-[16px] bg-surface-muted"
                      imgClassName="transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold leading-tight text-fg">{label}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-label font-semibold uppercase tracking-label text-accent">
                    {category.name}
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
