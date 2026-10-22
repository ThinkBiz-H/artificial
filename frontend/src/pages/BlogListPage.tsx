import { useSearchParams } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { useBlogList, useBlogCategories } from "@/hooks/useBlog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { BlogCard } from "@/components/blog/BlogCard";
import { cn } from "@/lib/utils";

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || undefined;

  const { data, isLoading, isError, refetch } = useBlogList({ page, limit: 10, category });
  const { data: categories } = useBlogCategories();
  const activeCategories = (categories ?? []).filter((c) => c.status !== "inactive");
  const blogs = data?.blogs ?? [];
  const showLead = page === 1 && !category && blogs.length > 0;
  const [lead, ...rest] = showLead ? blogs : [undefined, ...blogs];
  const crumbs = [{ name: "Home", path: "/" }, { name: "Journal", path: "/blog" }];
  // A category filter uses that category's own SEO (Admin > Blog categories).
  const selected = category ? activeCategories.find((c) => c._id === category) : undefined;
  const catSeo = selected?.seo;

  return (
    <>
      <Seo
        title={catSeo?.title || (selected ? `${selected.name} · Journal` : "Journal")}
        description={catSeo?.description || selected?.description || "Styling guides, jewellery care tips and stories behind our collections."}
        keywords={catSeo?.keywords || undefined}
        canonicalUrl={catSeo?.canonicalUrl || undefined}
        canonicalPath={selected ? `/blog?category=${selected._id}` : "/blog"}
        ogImage={catSeo?.ogImage || undefined}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <PageHeader eyebrow="The journal" title="Stories & Styling" description="Styling guides, jewellery care and the stories behind our collections." crumbs={crumbs} />

      <div className="container-x py-10 sm:py-14">
        {activeCategories.length > 0 && (
          <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {[{ _id: "", name: "All" }, ...activeCategories].map((c) => {
              const active = (category ?? "") === c._id;
              return (
                <button
                  key={c._id || "all"}
                  type="button"
                  onClick={() => setSearchParams(c._id ? { category: c._id } : {})}
                  className={cn("flex-none rounded-full border px-4 py-1.5 text-sm", active ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary")}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : blogs.length === 0 ? (
          <EmptyState icon={<Newspaper className="h-7 w-7" strokeWidth={1.25} />} title="No stories yet" description="New articles are on their way — check back soon." />
        ) : (
          <>
            {lead && (
              <div className="mb-14 border-b border-border pb-14">
                <BlogCard blog={lead} large />
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.filter(Boolean).map((blog) => (
                <BlogCard key={blog!._id} blog={blog!} />
              ))}
            </div>
            {data && data.totalPages > 1 && (
              <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => setSearchParams({ page: String(p), ...(category ? { category } : {}) })} />
            )}
          </>
        )}
      </div>
    </>
  );
}
