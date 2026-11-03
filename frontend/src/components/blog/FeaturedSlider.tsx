import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Blog } from "@/types";
import { cn } from "@/lib/utils";
import { BlogImage } from "./BlogImage";
import { BlogByline, BlogStats, blogCategoryName } from "./BlogCard";

/** Full-width editorial slider for the admin's featured posts. */
export function FeaturedSlider({ blogs }: { blogs: Blog[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = blogs.length;

  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count, paused, reduce]);

  if (!count) return null;
  const blog = blogs[index % count];
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const category = blogCategoryName(blog);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured stories"
      className="relative overflow-hidden rounded-panel bg-surface-dark shadow-lift"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={blog._id}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <BlogImage src={blog.featuredImage?.url} alt={blog.title} priority={index === 0} sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-surface-dark/40 to-transparent sm:bg-gradient-to-r sm:from-surface-dark/85 sm:via-surface-dark/45 sm:to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:inset-y-0 sm:right-auto sm:flex sm:max-w-xl sm:flex-col sm:justify-center sm:p-12">
          <motion.div key={`copy-${blog._id}`} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent-light">Featured{category ? ` · ${category}` : ""}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-5xl">{blog.title}</h2>
            {blog.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/75 sm:text-base">{blog.excerpt}</p>}
            <BlogStats blog={blog} light className="mt-4" />
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <Link
                to={`/blog/${blog.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-accent-soft px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-surface-dark shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Read the story <ArrowRight size={14} />
              </Link>
              <div className="hidden sm:block">
                <BlogByline blog={blog} light />
              </div>
            </div>
          </motion.div>
        </div>

        {count > 1 && (
          <>
            <div className="absolute bottom-5 right-5 hidden gap-2 sm:flex">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(d)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                  aria-label={d < 0 ? "Previous story" : "Next story"}
                >
                  {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              ))}
            </div>
            <div className="absolute right-6 top-6 flex gap-1.5 sm:left-12 sm:right-auto sm:top-auto sm:bottom-8">
              {blogs.map((b, i) => (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn("h-1 rounded-full transition-all", i === index ? "w-8 bg-gold" : "w-4 bg-white/40 hover:bg-white/70")}
                  aria-label={`Show story ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
