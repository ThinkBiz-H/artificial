import { Link } from "react-router-dom";
import type { Blog } from "@/types";
import { cn, formatDate } from "@/lib/utils";

export function blogCategoryName(blog: Blog) {
  return typeof blog.category === "object" ? blog.category?.name : undefined;
}

export function BlogCard({ blog, large }: { blog: Blog; large?: boolean }) {
  const category = blogCategoryName(blog);
  return (
    <Link to={`/blog/${blog.slug}`} className={cn("group block", large && "grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12")}>
      <div className={cn("overflow-hidden rounded-2xl bg-surface-muted", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
        {blog.featuredImage?.url && (
          <img src={blog.featuredImage.url} alt={blog.title} loading={large ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        )}
      </div>
      <div className={large ? "" : "mt-4"}>
        <p className="text-label font-semibold uppercase tracking-eyebrow text-accent">
          {[category, formatDate(blog.publishedAt || blog.createdAt)].filter(Boolean).join(" · ")}
        </p>
        <h2 className={cn("mt-2 font-display font-semibold leading-snug text-fg transition-colors group-hover:text-accent", large ? "text-4xl sm:text-5xl sm:leading-display" : "line-clamp-2 text-2xl")}>
          {blog.title}
        </h2>
        {blog.excerpt && <p className={cn("mt-2 text-sm leading-relaxed text-fg-muted", large ? "line-clamp-3 text-base" : "line-clamp-2")}>{blog.excerpt}</p>}
        {large && <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-eyebrow text-fg underline underline-offset-8">Read the story</span>}
      </div>
    </Link>
  );
}
