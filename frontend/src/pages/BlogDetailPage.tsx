import { Link, useParams } from "react-router-dom";
import { useBlogList, useBlogPost } from "@/hooks/useBlog";
import { formatDate, stripHtml, truncate } from "@/lib/utils";
import { sanitizeBlogHtml } from "@/lib/blogHtml";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { BlogCard, blogCategoryName } from "@/components/blog/BlogCard";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useBlogPost(slug);
  const { data: recentData } = useBlogList({ page: 1, limit: 4 });
  const { siteName, logo } = useStoreInfo();

  if (isLoading)
    return (
      <div className="container-x py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="aspect-[16/9] w-full" />
        </div>
      </div>
    );
  if (isError || !data?.blog) return <ErrorState title="Article not found" description="This story may have moved." onRetry={() => refetch()} />;

  const { blog, related } = data;
  const authorName = typeof blog.author === "object" ? blog.author?.name : undefined;
  const category = blogCategoryName(blog);
  const recent = (recentData?.blogs ?? []).filter((b) => b._id !== blog._id).slice(0, 3);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` },
  ];
  const seo = blog.seo ?? {};
  const description = truncate(seo.metaDescription || blog.excerpt || stripHtml(blog.content));

  return (
    <>
      <Seo
        title={seo.metaTitle || blog.title}
        description={description}
        image={blog.featuredImage?.url}
        keywords={seo.metaKeywords || blog.tags?.join(", ") || undefined}
        robots={seo.robots || undefined}
        canonicalUrl={seo.canonicalUrl || undefined}
        canonicalPath={`/blog/${blog.slug}`}
        ogTitle={seo.ogTitle || undefined}
        ogDescription={seo.ogDescription || undefined}
        ogImage={seo.ogImage || undefined}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description,
            ...(blog.featuredImage?.url ? { image: [blog.featuredImage.url] } : {}),
            datePublished: blog.publishedAt || blog.createdAt,
            ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
            publisher: { "@type": "Organization", name: siteName, ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}) },
            mainEntityOfPage: `${window.location.origin}/blog/${blog.slug}`,
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />

      <article>
        <header className="container-x pt-8 sm:pt-12">
          <div className="mx-auto max-w-3xl">
            <Breadcrumbs items={crumbs} />
            <p className="mt-8 text-label font-semibold uppercase tracking-eyebrow text-accent">
              {[category, formatDate(blog.publishedAt || blog.createdAt)].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-display text-fg sm:text-6xl">{blog.title}</h1>
            {blog.excerpt && <p className="mt-5 text-lg leading-relaxed text-fg-muted">{blog.excerpt}</p>}
            {authorName && <p className="mt-5 text-sm text-fg-soft">By {authorName}</p>}
          </div>
        </header>

        {blog.featuredImage?.url && (
          <div className="container-x mt-10">
            <div className="mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl bg-surface-muted">
              <img src={blog.featuredImage.url} alt={blog.title} fetchPriority="high" className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <div className="container-x py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {blog.content && <div className="blog-content text-lg" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.content) }} />}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
                {blog.tags.map((tag) => (
                  <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full bg-surface-muted px-3.5 py-1.5 text-xs text-fg-soft hover:bg-border">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {(related?.length ? related : recent).length > 0 && (
        <section className="border-t border-border bg-surface py-14 sm:py-20">
          <div className="container-x">
            <p className="eyebrow">Keep reading</p>
            <h2 className="mt-2 font-display text-4xl font-semibold text-fg">{related?.length ? "Related Articles" : "Recent Stories"}</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {(related?.length ? related : recent).slice(0, 3).map((r) => (
                <BlogCard key={r._id} blog={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
