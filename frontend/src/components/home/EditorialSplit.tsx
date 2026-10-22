import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { SmartLink } from "@/components/common/SmartLink";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";

/**
 * Magazine-style image + copy block with a light parallax on the image.
 * Used for the editorial collection banner and the brand story.
 */
export function EditorialSplit({
  image,
  imageAlt,
  secondaryImage,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaTo,
  reverse,
  tone = "beige",
}: {
  image?: string;
  imageAlt: string;
  secondaryImage?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaTo?: string;
  reverse?: boolean;
  tone?: "beige" | "ivory" | "dark";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  const dark = tone === "dark";

  return (
    <section ref={ref} className={cn(tone === "beige" && "bg-surface-muted", tone === "ivory" && "bg-canvas", dark && "bg-primary text-fg-inverse")}>
      <div className={cn("grid items-stretch lg:grid-cols-2", reverse && "lg:[&>*:first-child]:order-2")}>
        <div className="relative m-4 min-h-[420px] overflow-hidden rounded-panel sm:m-6 sm:min-h-[520px] lg:m-8 lg:min-h-[600px]">
          {image ? (
            <motion.img
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              style={{ y }}
              className="absolute inset-[-7%_0] h-[114%] w-full object-cover"
            />
          ) : (
            <div className={cn("absolute inset-0", dark ? "bg-fg-soft" : "bg-surface-muted")} />
          )}
          {secondaryImage && (
            <div className="absolute bottom-8 right-8 hidden aspect-[3/4] w-40 overflow-hidden border-[6px] border-canvas shadow-soft xl:block">
              <img src={secondaryImage} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        <div className="flex items-center">
          <Reveal className="w-full px-6 py-14 sm:px-12 sm:py-20 lg:px-16 xl:px-24">
            {eyebrow && <p className={cn("eyebrow", dark && "text-accent-light")}>{eyebrow}</p>}
            <h2 className={cn("mt-4 font-display text-5xl font-semibold leading-display sm:text-5xl xl:text-6xl", dark ? "text-fg-inverse" : "text-fg")}>
              {title}
            </h2>
            <span className={cn("mt-6 block h-px w-16", dark ? "bg-accent-light/60" : "bg-accent-soft")} aria-hidden />
            {body && (
              <p className={cn("mt-6 max-w-md whitespace-pre-line text-base leading-relaxed", dark ? "text-fg-inverse/75" : "text-fg-soft")}>{body}</p>
            )}
            {ctaLabel && ctaTo && (
              <SmartLink
                to={ctaTo}
                className={buttonClasses({
                  variant: dark ? "light" : "primary",
                  size: "lg",
                  className: cn("mt-9", dark && "hover:bg-accent hover:text-fg-inverse"),
                })}
              >
                {ctaLabel} <ArrowRight size={15} />
              </SmartLink>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
