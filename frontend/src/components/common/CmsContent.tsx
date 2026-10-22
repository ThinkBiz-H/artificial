import { useQueries } from "@tanstack/react-query";
import { pagesApi } from "@/api/catalog";
import { sanitizeBlogHtml } from "@/lib/blogHtml";
import type { CmsPage } from "@/types";

/**
 * Looks up the first published admin CMS page among candidate slugs
 * (e.g. "refund-policy" or "return-policy"). Shares the ["page", slug]
 * cache with useCmsPage.
 */
export function useFirstCmsPage(slugs: string[]) {
  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["page", slug],
      queryFn: () => pagesApi.bySlug(slug),
      retry: false,
      staleTime: 5 * 60 * 1000,
    })),
  });
  const page = results.map((r) => r.data?.data.page).find((p): p is CmsPage => !!p && p.status !== "draft" && p.status !== "unpublished");
  const isLoading = !page && results.some((r) => r.isLoading);
  return { page, isLoading };
}

/** Admin rich-text HTML, sanitized before rendering. */
export function CmsHtml({ html, className = "rich-content" }: { html?: string; className?: string }) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }} />;
}
