import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa6";
import type { Product } from "@/types";
import { RevealImage } from "@/components/common/Reveal";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { cn, productImage, socialUrl } from "@/lib/utils";
import type { HomeSectionData } from "./homeData";

interface Tile {
  src: string;
  alt: string;
  href?: string;
}

/**
 * "Styled by you" lookbook grid. Uses the admin's Instagram Gallery images
 * when configured; otherwise real product photography from the catalogue.
 */
export function Lookbook({ section, products }: { section?: HomeSectionData; products?: Product[] }) {
  const { social } = useStoreInfo();
  const instagram = socialUrl("instagram", social.instagram);
  const handle = social.instagram && !/^https?:/i.test(social.instagram) ? `@${social.instagram.replace(/^@/, "")}` : undefined;

  const adminTiles: Tile[] = (section?.gallery ?? []).filter((g) => g.url).map((g, i) => ({ src: g.url, alt: `Lookbook image ${i + 1}`, href: instagram || undefined }));
  const productTiles: Tile[] = (products ?? [])
    .map((p) => ({ src: p.images?.[1]?.url || productImage(p) || "", alt: p.title, href: `/products/${p.slug}` }))
    .filter((t) => t.src);
  const tiles = (adminTiles.length >= 4 ? adminTiles : productTiles).slice(0, 6);

  if (tiles.length < 4) return null;

  const layout = ["lg:col-span-2 lg:row-span-2", "", "", "lg:row-span-2", "", ""];

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="eyebrow">{section?.subtitle || "Jewellery inspiration"}</p>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-display text-fg sm:text-5xl">{section?.title || "Styled by You"}</h2>
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              <FaInstagram size={16} /> {handle || "Follow us on Instagram"}
            </a>
          )}
        </div>
        <div className="grid auto-rows-[160px] grid-cols-2 gap-2 sm:auto-rows-[220px] sm:gap-3 lg:grid-cols-5 lg:auto-rows-[200px]">
          {tiles.map((t, i) => {
            const inner = (
              <>
                <RevealImage src={t.src} alt={t.alt} className="absolute inset-0" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-fg/0 text-fg-inverse opacity-0 transition-all duration-300 group-hover:bg-fg/30 group-hover:opacity-100">
                  <FaInstagram size={22} />
                </span>
              </>
            );
            const cls = cn("group relative block overflow-hidden rounded-2xl bg-surface-muted", layout[i], i === 0 && "col-span-2 row-span-2", i === 5 && "hidden lg:block");
            if (t.href?.startsWith("/")) {
              return (
                <Link key={`${t.src}-${i}`} to={t.href} className={cls} aria-label={t.alt}>
                  {inner}
                </Link>
              );
            }
            return t.href ? (
              <a key={`${t.src}-${i}`} href={t.href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={t.alt}>
                {inner}
              </a>
            ) : (
              <div key={`${t.src}-${i}`} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
