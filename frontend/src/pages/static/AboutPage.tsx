import { Link } from "react-router-dom";
import { Gem, HeartHandshake, Sparkles } from "lucide-react";
import { useCategoryTree } from "@/hooks/useCatalog";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { stripHtml, truncate } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { CmsHtml, useFirstCmsPage } from "@/components/common/CmsContent";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Reveal, RevealImage } from "@/components/common/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { flattenCategories } from "@/components/home/homeData";

const VALUES = [
  { Icon: Gem, title: "Design first", text: "Every piece is chosen for its detail, finish and the way it frames your look." },
  { Icon: Sparkles, title: "Made to be worn", text: "Comfortable, lightweight jewellery you'll reach for again and again." },
  { Icon: HeartHandshake, title: "Care in every order", text: "Thoughtful packaging, honest policies and real people behind every reply." },
];

/** About — the admin's "about" CMS page when published, otherwise a brand overview. */
export function AboutPage() {
  const { siteName } = useStoreInfo();
  const { page, isLoading } = useFirstCmsPage(["about", "about-us"]);
  const { data: tree = [] } = useCategoryTree();
  const images = flattenCategories(tree.filter((c) => c.status === "active"))
    .filter((c) => c.image?.url)
    .slice(0, 3);
  const crumbs = [{ name: "Home", path: "/" }, { name: "About us", path: "/about" }];

  return (
    <>
      <Seo
        title={page?.seo?.title || `About ${siteName}`}
        description={page?.seo?.description || truncate(stripHtml(page?.excerpt) || `${siteName} — premium artificial jewellery for weddings, celebrations and everyday elegance.`)}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <PageHeader eyebrow="Our story" title={page?.title || `About ${siteName}`} description={page?.excerpt} crumbs={crumbs} />

      {isLoading ? (
        <div className="container-x py-16">
          <Skeleton className="mx-auto h-64 max-w-3xl" />
        </div>
      ) : page?.content ? (
        <div className="container-x py-12 sm:py-16">
          <article className="mx-auto max-w-3xl">
            {page.featuredImage?.url && (
              <div className="mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-muted">
                <img src={page.featuredImage.url} alt={page.title} className="h-full w-full object-cover" />
              </div>
            )}
            <CmsHtml html={page.content} />
          </article>
        </div>
      ) : (
        <>
          <section className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20">
            <div className="grid grid-cols-[1.3fr_1fr] gap-4">
              {images[0] ? (
                <RevealImage src={images[0].image!.url} alt={images[0].name} className="aspect-[3/4] rounded-t-panel" />
              ) : (
                <div className="aspect-[3/4] rounded-t-panel bg-surface-muted" />
              )}
              <div className="flex flex-col gap-4 pt-14">
                {images.slice(1).map((c) => (
                  <RevealImage key={c._id} src={c.image!.url} alt={c.name} className="aspect-[4/5]" />
                ))}
              </div>
            </div>
            <Reveal>
              <p className="eyebrow">Who we are</p>
              <h2 className="mt-3 font-display text-5xl font-semibold leading-display text-fg sm:text-5xl">Jewellery for every chapter of your story</h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-fg-soft">
                <p>
                  {siteName} was created for women who love the drama of traditional Indian jewellery and the ease of modern style — and who
                  shouldn't have to choose between the two.
                </p>
                <p>
                  Our collections span bridal sets, festive statement pieces and everyday favourites, each selected for its craftsmanship, finish and
                  comfort, so you can celebrate every occasion beautifully.
                </p>
              </div>
              <Link to="/categories" className={buttonClasses({ size: "lg", className: "mt-8" })}>
                Explore the collections
              </Link>
            </Reveal>
          </section>

          <section className="bg-primary py-16 text-fg-inverse sm:py-24">
            <div className="container-x grid gap-10 md:grid-cols-3">
              {VALUES.map(({ Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 0.08} className="text-center">
                  <Icon size={30} strokeWidth={1} className="mx-auto text-accent-light" />
                  <p className="mt-4 font-display text-2xl font-semibold">{title}</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-fg-inverse/70">{text}</p>
                </Reveal>
              ))}
            </div>
          </section>

          <WhyChooseUs />
        </>
      )}
    </>
  );
}
