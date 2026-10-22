import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { buttonClasses } from "@/components/ui/Button";
import { SmartLink } from "@/components/common/SmartLink";
import { Reveal } from "@/components/common/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { productImage } from "@/lib/utils";
import type { HomeSectionData } from "./homeData";

/** Wine-and-gold editorial campaign built from real product photography (used when the admin has no CTA campaign). */
function FallbackCampaign({ products }: { products: Product[] }) {
  const imgs = products.map((p) => ({ src: productImage(p), title: p.title, slug: p.slug })).filter((p) => p.src).slice(0, 3);
  if (imgs.length === 0) return null;
  return (
    <section className="py-6 sm:py-10">
      <div className="container-x">
        <div className="relative grid overflow-hidden rounded-panel bg-primary text-fg-inverse lg:grid-cols-[1fr_1.1fr]">
          <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-accent-light/25" aria-hidden />
          <span className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-accent-light/15" aria-hidden />
          <Reveal className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="ornament text-label font-semibold uppercase tracking-eyebrow text-accent-light">The signature edit</p>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-display sm:text-6xl">Elegance, Crafted For You</h2>
            <p className="mt-5 max-w-md font-sub text-base italic leading-relaxed text-fg-inverse/75">
              Statement pieces and everyday treasures, chosen to make every moment shine.
            </p>
            <Link to="/products" className={buttonClasses({ variant: "light", size: "lg", className: "mt-9 self-start" })}>
              Shop the collection <ArrowRight size={15} />
            </Link>
          </Reveal>
          <div className="relative grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6 lg:p-8">
            {imgs.map((img, i) => (
              <Link
                key={img.slug}
                to={`/products/${img.slug}`}
                aria-label={img.title}
                className={`group overflow-hidden rounded-2xl bg-surface-dark ${i === 0 ? "row-span-2 aspect-[3/4] sm:aspect-auto" : "aspect-square"} ${imgs.length === 1 ? "col-span-2" : ""}`}
              >
                <img src={img.src} alt={img.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Full-width campaign — from the admin's "CTA" or "Video Banner" home section. Renders nothing if neither is configured. */
export function CampaignBanner({ section, fallbackProducts }: { section?: HomeSectionData; fallbackProducts?: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  const video = section?.videos?.[0]?.url;
  const image = section?.image?.url;
  if (!section || (!video && !image)) return fallbackProducts?.length ? <FallbackCampaign products={fallbackProducts} /> : null;

  const title = section.title || "Elegance Crafted For You";
  const button = section.button?.label && section.button?.link ? section.button : { label: "Shop the collection", link: "/products" };
  const secondary = section.config?.secondaryButton;

  return (
    <section ref={ref} className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-primary sm:min-h-[620px]">
      {video ? (
        <video src={video} poster={image} autoPlay muted loop playsInline className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : (
        <motion.img src={image} alt="" loading="lazy" style={{ y }} className="absolute inset-[-9%_0] -z-10 h-[118%] w-full object-cover" />
      )}
      <span className="absolute inset-0 -z-10 bg-fg/40" aria-hidden />
      <Reveal className="container-x text-center text-fg-inverse">
        {section.subtitle && <p className="text-label font-semibold uppercase tracking-eyebrow text-fg-inverse/85">{section.subtitle}</p>}
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-5xl font-semibold leading-display sm:text-6xl lg:text-7xl">{title}</h2>
        {section.content && <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-inverse/85">{section.content}</p>}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <SmartLink to={button.link!} className={buttonClasses({ variant: "light", size: "lg", className: "hover:bg-accent hover:text-fg-inverse" })}>
            {button.label}
          </SmartLink>
          {secondary?.label && secondary.link && (
            <SmartLink
              to={secondary.link}
              className={buttonClasses({ variant: "outline", size: "lg", className: "border-fg-inverse bg-transparent text-fg-inverse hover:bg-surface hover:text-primary" })}
            >
              {secondary.label}
            </SmartLink>
          )}
        </div>
      </Reveal>
    </section>
  );
}
