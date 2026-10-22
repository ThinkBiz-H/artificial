import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  A11y,
  Autoplay,
  EffectFade,
  Keyboard,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { ArrowRight, Gem, RotateCcw, ShieldCheck } from "lucide-react";
import type { HeroSlide, Product } from "@/types";
import { buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SmartLink } from "@/components/common/SmartLink";
import { SHOP_LINKS } from "@/components/layout/nav";
import { cn, productImage } from "@/lib/utils";
import type { HomeSectionData } from "./homeData";

const HEADLINE = "Discover Timeless Elegance";
const SUBHEAD =
  "Handcrafted artificial jewellery designed to make every moment unforgettable.";

/** The hero sits under the transparent sticky header (see Header's --header-h). */
const UNDER_HEADER = "-mt-[var(--header-h,0px)] pt-[var(--header-h,0px)]";
const FULL_HEIGHT = "lg:min-h-[calc(100svh-36px)]";
/** Fixed frame per breakpoint so the slider never shifts layout while images load. */
const SLIDE_FRAME = "h-[92vh] w-full min-h-[720px]";
const ease = [0.22, 1, 0.36, 1] as const;

function TrustRow() {
  return (
    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-muted">
      {[
        { Icon: Gem, label: "Premium finish" },
        { Icon: ShieldCheck, label: "Secure payments" },
        { Icon: RotateCcw, label: "Easy returns" },
      ].map(({ Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon
            size={14}
            strokeWidth={1.5}
            className="text-accent"
            aria-hidden
          />{" "}
          {label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Editorial split hero — the fallback when the admin hasn't uploaded hero
 * slides: brand headline beside real product photography.
 */
function EditorialHero({
  products,
  isLoading,
}: {
  products?: Product[];
  isLoading?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduce ? "0%" : "12%"],
  );

  const productImages = (products ?? [])
    .map((p) => ({ src: productImage(p), alt: p.title, slug: p.slug }))
    .filter((p) => p.src);
  const [mainImage, accentImage] = productImages;

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden bg-canvas ${UNDER_HEADER}`}
    >
      <div
        className={`container-x grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-12 ${FULL_HEIGHT}`}
      >
        <motion.div
          className="order-2 lg:order-1"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
        >
          <p className="ornament eyebrow">The new collection</p>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-display text-fg sm:text-7xl xl:text-8xl">
            {HEADLINE}
          </h1>
          <p className="mt-6 max-w-md font-sub text-lg leading-relaxed text-fg-soft">
            {SUBHEAD}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/products" className={buttonClasses({ size: "lg" })}>
              Shop collection
            </Link>
            <Link
              to={SHOP_LINKS.newArrivals}
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Explore new arrivals <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <TrustRow />
        </motion.div>

        <motion.div
          className="relative order-1 lg:order-2"
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease }}
        >
          {isLoading && !mainImage ? (
            <Skeleton className="aspect-[4/5] w-full rounded-panel lg:aspect-auto lg:h-[calc(100svh-var(--header-h,89px)-110px)]" />
          ) : mainImage ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-panel bg-surface-muted shadow-lift lg:aspect-auto lg:h-[calc(100svh-var(--header-h,89px)-110px)] lg:min-h-[520px]">
              <motion.img
                src={mainImage.src}
                alt={mainImage.alt}
                fetchPriority="high"
                style={{ y }}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                className="absolute inset-0 h-[112%] w-full object-cover"
              />
              <Link
                to={`/products/${mainImage.slug}`}
                className="absolute inset-0"
                aria-label={mainImage.alt}
              />
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-panel bg-surface-muted lg:aspect-auto lg:h-[calc(100svh-var(--header-h,89px)-110px)]">
              <span
                className="font-display text-8xl italic leading-none text-accent/50"
                aria-hidden
              >
                S
              </span>
            </div>
          )}
          {accentImage && (
            <Link
              to={`/products/${accentImage.slug}`}
              className="absolute -bottom-6 -left-6 hidden aspect-[3/4] w-40 overflow-hidden rounded-image border-[6px] border-canvas bg-surface-muted shadow-soft transition-transform duration-500 hover:-translate-y-1 xl:block"
              aria-label={accentImage.alt}
            >
              <img
                src={accentImage.src}
                alt=""
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                className="h-full w-full object-cover"
              />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/** Copy card over a titled slide — a frosted ivory panel keeps admin text legible on any artwork. */
function SlideCopy({
  slide,
  secondary,
  isFirst,
}: {
  slide: HeroSlide;
  secondary?: { label?: string; link?: string };
  isFirst: boolean;
}) {
  const Title = isFirst ? "h1" : "h2";
  return (
    <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-10 sm:left-10 sm:max-w-lg lg:bottom-14 lg:left-14 lg:max-w-xl">
      <div className="hero-copy max-w-xl">
        {slide.subtitle && <p className="ornament eyebrow">{slide.subtitle}</p>}
        <Title
          className="mt-3 font-display text-4xl font-semibold leading-display text-fg sm:text-5xl lg:text-[5rem]
leading-[0.95]
font-light"
        >
          {slide.title}
        </Title>
        {slide.description && (
          <p className="mt-3 line-clamp-3 font-sub text-base leading-relaxed text-fg-soft sm:text-lg">
            {slide.description}
          </p>
        )}
        {(slide.buttonLink || secondary?.link) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {slide.buttonLink && (
              <SmartLink
                to={slide.buttonLink}
                className={buttonClasses({ size: "lg" })}
              >
                {slide.buttonText || "Shop now"}
              </SmartLink>
            )}
            {secondary?.label && secondary.link && (
              <SmartLink
                to={secondary.link}
                className={buttonClasses({ variant: "outline", size: "lg" })}
              >
                {secondary.label} <ArrowRight size={15} aria-hidden />
              </SmartLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Luxury hero slider for the admin's hero slides. Slides with a title get an
 * overlaid copy card; artwork-only slides (copy baked into the image) stay
 * clean and link through as a whole. Slides advance automatically and
 * continuously — there are no manual prev/next or pause controls.
 */
function LuxurySlider({
  slides,
  secondary,
}: {
  slides: HeroSlide[];
  secondary?: { label?: string; link?: string };
}) {
  const multiple = slides.length > 1;
  const hasTitledFirst = !!slides[0]?.title;

  return (
    <section
      className={`hero-slides relative bg-canvas ${UNDER_HEADER}`}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {!hasTitledFirst && <h1 className="sr-only">{HEADLINE}</h1>}
      <div className="w-full">
        <div className="relative overflow-hidden">
          <Swiper
            modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={900}
            keyboard={{ enabled: true, onlyInViewport: true }}
            a11y={{
              prevSlideMessage: "Previous slide",
              nextSlideMessage: "Next slide",
              slideLabelMessage: "Slide {{index}} of {{slidesLength}}",
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            loop={true}
            navigation={false}
            pagination={multiple ? { clickable: true } : false}
          >
            {slides.map((slide, i) => {
              const image = (
                <picture>
                  {slide.mobileImage?.url && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.mobileImage.url}
                    />
                  )}
                  <img
                    src={slide.desktopImage.url}
                    alt={slide.title ? "" : "Jewellery collection"}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding={i === 0 ? "sync" : "async"}
                    className="hero-img absolute inset-0 h-full w-full object-cover object-center"
                  />
                </picture>
              );
              return (
                <SwiperSlide key={slide._id}>
                  <section className="relative h-[65vh] sm:h-[70vh] lg:h-[76vh] min-h-[560px] w-full overflow-hidden bg-[#F8F4EE]">
                    {/* Background Image */}
                    <picture className="absolute inset-0">
                      {slide.mobileImage?.url && (
                        <source
                          media="(max-width:767px)"
                          srcSet={slide.mobileImage.url}
                        />
                      )}

                      <img
                        src={slide.desktopImage.url}
                        alt={slide.title || "Jewellery"}
                        className="absolute inset-0 h-full w-full object-cover hero-img"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </picture>

                    {/* Left Soft Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F8F4EE]/95 via-[#F8F4EE]/55 to-transparent"></div>

                    {/* Content */}
                    <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-12">
                      <div className="max-w-xl">
                        {slide.subtitle && (
                          <p className="mb-6 uppercase tracking-[0.35em] text-[12px] text-[#A7864A]">
                            {slide.subtitle}
                          </p>
                        )}

                        {i === 0 ? (
                          <h1 className="font-display text-[72px] leading-[0.95] text-[#231F20]">
                            {slide.title}
                          </h1>
                        ) : (
                          <h2 className="font-display text-[72px] leading-[0.95] text-[#231F20]">
                            {slide.title}
                          </h2>
                        )}

                        {slide.description && (
                          <p className="mt-8 max-w-md text-[18px] leading-8 text-[#5B524C]">
                            {slide.description}
                          </p>
                        )}

                        <div className="mt-10 flex gap-4">
                          {slide.buttonLink && (
                            <SmartLink
                              to={slide.buttonLink}
                              className="bg-black px-10 py-4 uppercase tracking-[0.2em] text-xs text-white transition hover:bg-[#222]"
                            >
                              {slide.buttonText || "SHOP THE COLLECTION"}
                            </SmartLink>
                          )}

                          {secondary?.link && (
                            <SmartLink
                              to={secondary.link}
                              className="border border-black px-10 py-4 uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition"
                            >
                              {secondary.label || "DISCOVER"}
                            </SmartLink>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scroll Text */}
                    <div className="absolute bottom-8 right-10 hidden items-center gap-3 lg:flex">
                      <div className="h-px w-12 bg-[#8C7A67]"></div>

                      <span className="uppercase tracking-[0.35em] text-[10px] text-[#8C7A67]">
                        Scroll to Explore
                      </span>
                    </div>
                  </section>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
      <style>{`

.hero-img{
    transform:scale(1.08);
    transition:transform 7s linear;
}

.swiper-slide-active .hero-img{
    transform:scale(1);
}

.swiper-pagination{
    bottom:35px !important;
}

.swiper-pagination-bullet{
    width:24px;
    height:3px;
    border-radius:999px;
    background:white;
    opacity:.5;
}

.swiper-pagination-bullet-active{
    width:46px;
    background:#C7A15A;
    opacity:1;
}

`}</style>
    </section>
  );
}

export function HeroBanner({
  section,
  products,
  isLoading,
  sectionsLoading,
}: {
  section?: HomeSectionData;
  products?: Product[];
  isLoading?: boolean;
  /** While admin sections load we don't yet know which hero to show. */
  sectionsLoading?: boolean;
}) {
  if (sectionsLoading) {
    return (
      <div className={`${UNDER_HEADER} bg-canvas`}>
        <div className="relative w-full">
          <Skeleton className={cn("w-full rounded-panel", SLIDE_FRAME)} />
        </div>
      </div>
    );
  }

  const slides = (section?.slides ?? [])
    .filter((s) => s.active !== false && s.desktopImage?.url)
    .sort((a, b) => a.order - b.order);
  if (slides.length)
    return (
      <LuxurySlider
        slides={slides}
        secondary={section?.config?.secondaryButton}
      />
    );
  return <EditorialHero products={products} isLoading={isLoading} />;
}
