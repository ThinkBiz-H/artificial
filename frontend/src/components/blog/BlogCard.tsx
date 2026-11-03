import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Eye, Heart } from "lucide-react";
import type { Blog } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { BlogImage } from "./BlogImage";
import { BookmarkButton, QuickShareButton } from "./BlogActions";
import { blogAuthor, blogCategory, compactNumber, readingTimeLabel, toSavedPost } from "./blogUtils";

export function blogCategoryName(blog: Blog) {
  return blogCategory(blog)?.name;
}

/** Author initial / photo + name + date — shared by cards and the article header. */
export function BlogByline({ blog, light = false }: { blog: Blog; light?: boolean }) {
  const author = blogAuthor(blog);
  return (
    <div className={cn("flex items-center gap-2.5 text-xs", light ? "text-white/80" : "text-fg-muted")}>
      {author && (
        author.profileImage?.url ? (
          <img src={author.profileImage.url} alt="" className="h-7 w-7 rounded-full object-cover" loading="lazy" />
        ) : (
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full font-display text-sm", light ? "bg-white/20 text-white" : "bg-accent/15 text-accent")}>
            {author.name.charAt(0)}
          </span>
        )
      )}
      <span>
        {author && <span className={cn("font-medium", light ? "text-white" : "text-fg")}>{author.name}</span>}
        {author && " · "}
        {formatDate(blog.publishedAt || blog.createdAt)}
      </span>
    </div>
  );
}

/** Reading time · views · likes. */
export function BlogStats({ blog, light = false, className }: { blog: Blog; light?: boolean; className?: string }) {
  const reading = readingTimeLabel(blog);
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", light ? "text-white/75" : "text-fg-muted", className)}>
      {reading && (
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {reading}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Eye size={12} /> {compactNumber(blog.viewCount)}
      </span>
      <span className="inline-flex items-center gap-1">
        <Heart size={12} /> {compactNumber(blog.likeCount)}
      </span>
    </div>
  );
}

/**
 * Journal card. `large` is the editorial lead layout (image beside text);
 * `compact` is the small horizontal row used in sidebars and rails.
 */
export function BlogCard({ blog, large, compact, index = 0 }: { blog: Blog; large?: boolean; compact?: boolean; index?: number }) {
  const reduce = useReducedMotion();
  const category = blogCategoryName(blog);
  const href = `/blog/${blog.slug}`;

  if (compact) {
    return (
      <Link to={href} className="group flex gap-4">
        <div className="h-20 w-24 flex-none overflow-hidden rounded-xl">
          <BlogImage src={blog.featuredImage?.url} alt="" sizes="96px" className="transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="min-w-0">
          {category && <p className="text-[10px] font-semibold uppercase tracking-eyebrow text-accent">{category}</p>}
          <p className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-primary">{blog.title}</p>
          <p className="mt-1 text-xs text-fg-muted">{readingTimeLabel(blog) || formatDate(blog.publishedAt || blog.createdAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: Math.min(index, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative", large && "grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14")}
    >
      <Link to={href} className="block" aria-label={blog.title}>
        <div className={cn("relative overflow-hidden rounded-card shadow-soft transition-shadow duration-500 group-hover:shadow-lift", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
          <BlogImage
            src={blog.featuredImage?.url}
            alt={blog.title}
            priority={large}
            sizes={large ? "(min-width: 1024px) 55vw, 100vw" : undefined}
            className="transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {category && (
            <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-eyebrow text-primary backdrop-blur-md">
              {category}
            </span>
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <BookmarkButton post={toSavedPost(blog)} compact />
        <QuickShareButton slug={blog.slug} title={blog.title} />
      </div>

      <div className={large ? "" : "mt-5"}>
        <BlogStats blog={blog} />
        <Link to={href}>
          <h2 className={cn("mt-2 font-display font-semibold text-fg transition-colors group-hover:text-primary", large ? "text-4xl leading-tight sm:text-5xl sm:leading-display" : "line-clamp-2 text-2xl leading-snug")}>
            {blog.title}
          </h2>
        </Link>
        {blog.excerpt && <p className={cn("mt-3 leading-relaxed text-fg-muted", large ? "line-clamp-3 text-base" : "line-clamp-2 text-sm")}>{blog.excerpt}</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <BlogByline blog={blog} />
          {large && (
            <Link to={href} className="text-xs font-semibold uppercase tracking-eyebrow text-primary underline decoration-accent underline-offset-8">
              Read the story
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
