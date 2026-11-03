import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useBlogList, useBlogPost } from "@/hooks/useBlog";
import { formatDate, stripHtml, truncate } from "@/lib/utils";
import { prepareArticleHtml } from "@/lib/blogHtml";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { BlogByline, BlogCard, BlogStats, blogCategoryName } from "@/components/blog/BlogCard";
import { BlogImage } from "@/components/blog/BlogImage";
import { BookmarkButton, LikeButton, ShareButtons } from "@/components/blog/BlogActions";
import { AuthorCard, BackToTop, BlogFaq, PrevNextNav, ReadingProgress, TableOfContents } from "@/components/blog/ArticleWidgets";
import { NewsletterBand, RecentlyViewedBlogs, RelatedProducts } from "@/components/blog/JournalSections";
import { blogAuthor, blogCategory, rememberViewed, toSavedPost } from "@/components/blog/blogUtils";

function DetailSkeleton() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="mx-auto mt-10 aspect-[16/9] max-w-5xl rounded-panel" />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={i % 4 === 3 ? "h-4 w-2/3" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const reduce = useReducedMotion();
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useBlogPost(slug);
  const { data: recentData } = useBlogList({ page: 1, limit: 4 });
  const { siteName, logo } = useStoreInfo();
  const articleRef = useRef<HTMLElement>(null);

  const blog = data?.blog;
  const article = useMemo(() => prepareArticleHtml(blog?.content ?? ""), [blog?.content]);

  useEffect(() => {
    if (blog) rememberViewed(toSavedPost(blog));
  }, [blog]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !blog) return <ErrorState title="Article not found" description="This story may have moved." onRetry={() => refetch()} />;

  const { related, prev, next } = data;
  const authorName = blogAuthor(blog)?.name;
  const category = blogCategoryName(blog);
  const categoryId = blogCategory(blog)?._id;
  const recent = (recentData?.blogs ?? []).filter((b) => b._id !== blog._id).slice(0, 3);
  const keepReading = related?.length ? related : recent;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Journal", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` },
  ];
  const seo = blog.seo ?? {};
  const plain = stripHtml(blog.content || "");
  const description = truncate(seo.metaDescription || blog.excerpt || plain);
  const faqs = (blog.faqs ?? []).filter((f) => f.question && f.answer);
  const url = `${window.location.origin}/blog/${blog.slug}`;

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
            ...(blog.updatedAt ? { dateModified: blog.updatedAt } : {}),
            ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
            ...(category ? { articleSection: category } : {}),
            ...(blog.tags?.length ? { keywords: blog.tags.join(", ") } : {}),
            ...(plain ? { wordCount: plain.split(/\s+/).filter(Boolean).length } : {}),
            publisher: { "@type": "Organization", name: siteName, ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}) },
            mainEntityOfPage: url,
          },
          breadcrumbJsonLd(crumbs),
          ...(faqs.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
                },
              ]
            : []),
        ]}
      />
      <ReadingProgress target={articleRef} />

      <article ref={articleRef}>
        <header className="relative overflow-hidden bg-gradient-to-b from-surface-muted/70 to-canvas">
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-[26rem] w-[26rem] rounded-full bg-accent-light/40 blur-3xl print:hidden" />
          <div className="container-x relative pt-8 sm:pt-12">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-3xl"
            >
              <Breadcrumbs items={crumbs} className="print:hidden" />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {category && (
                  <Link
                    to={categoryId ? `/blog?category=${categoryId}` : "/blog"}
                    className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-eyebrow text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    {category}
                  </Link>
                )}
                <span className="text-xs text-fg-muted">{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-fg sm:text-6xl sm:leading-display">{blog.title}</h1>
              {blog.excerpt && <p className="mt-5 text-lg leading-relaxed text-fg-muted">{blog.excerpt}</p>}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                <BlogByline blog={blog} />
                <BlogStats blog={blog} />
              </div>
            </motion.div>
          </div>
        </header>

        {blog.featuredImage?.url && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="container-x mt-10"
          >
            <div className="mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-panel shadow-lift">
              <BlogImage src={blog.featuredImage.url} alt={blog.title} priority sizes="(min-width: 1024px) 1024px, 100vw" />
            </div>
          </motion.div>
        )}

        <div className="container-x py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[64px_minmax(0,1fr)_240px] lg:gap-12">
            {/* Sticky share rail (desktop) */}
            <aside className="hidden print:hidden lg:block">
              <div className="sticky top-28">
                <ShareButtons slug={blog.slug} title={blog.title} vertical />
              </div>
            </aside>

            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-8 print:hidden">
                <TableOfContents items={article.toc} variant="inline" />
              </div>
              {article.html && <div className="blog-content text-lg" dangerouslySetInnerHTML={{ __html: article.html }} />}

              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-fg-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface/70 p-4 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <LikeButton key={blog.slug} slug={blog.slug} initialCount={blog.likeCount ?? 0} />
                  <BookmarkButton post={toSavedPost(blog)} />
                </div>
                <ShareButtons slug={blog.slug} title={blog.title} showPrint />
              </div>

              <div className="mt-10 space-y-12">
                <AuthorCard blog={blog} siteName={siteName} />
                {faqs.length > 0 && <BlogFaq faqs={faqs} />}
                <div className="print:hidden">
                  <PrevNextNav prev={prev} next={next} />
                </div>
              </div>
            </div>

            {/* Sticky table of contents (desktop) */}
            <aside className="hidden print:hidden lg:block">
              <div className="sticky top-28 space-y-10">
                <TableOfContents items={article.toc} />
                <RecentlyViewedBlogs exclude={blog.slug} />
              </div>
            </aside>
          </div>
        </div>
      </article>

      <div className="print:hidden">
        {keepReading.length > 0 && (
          <section className="border-t border-border bg-surface py-14 sm:py-20">
            <div className="container-x">
              <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Keep reading</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-fg">{related?.length ? "Related Articles" : "Recent Stories"}</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {keepReading.slice(0, 3).map((r, i) => (
                  <BlogCard key={r._id} blog={r} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="container-x space-y-20 py-14 sm:py-20">
          <RelatedProducts blog={blog} />
          <RecentlyViewedBlogs exclude={blog.slug} className="lg:hidden" />
          <NewsletterBand />
        </div>
        <BackToTop />
      </div>
    </>
  );
}
