import { Link, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { useCmsPage } from "@/hooks/useCatalog";
import { PageHeader } from "@/components/common/PageHeader";
import { CmsHtml } from "@/components/common/CmsContent";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { stripHtml, truncate } from "@/lib/utils";

/** Any admin-published CMS page, by slug. */
export function CmsPageView({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data: page, isLoading, isError } = useCmsPage(slug);

  if (isLoading) {
    return (
      <div className="container-x py-16">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <>
        <Seo title="Page not found" noindex />
        <EmptyState
          icon={<FileText className="h-7 w-7" strokeWidth={1.25} />}
          title={fallbackTitle || "Page not found"}
          description="This page doesn't exist or hasn't been published yet."
          action={
            <Link to="/" className={buttonClasses()}>
              Back to home
            </Link>
          }
        />
      </>
    );
  }

  const crumbs = [{ name: "Home", path: "/" }, { name: page.title, path: `/${page.slug}` }];

  return (
    <>
      <Seo
        title={page.seo?.title || page.title}
        description={page.seo?.description || truncate(stripHtml(page.excerpt || page.content))}
        image={page.featuredImage?.url}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <PageHeader title={page.title || fallbackTitle} description={page.excerpt} crumbs={crumbs} />
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
    </>
  );
}

/** Dynamic route: /:slug */
export function CmsPage() {
  const { slug } = useParams();
  if (!slug) return null;
  return <CmsPageView slug={slug} fallbackTitle="" />;
}
