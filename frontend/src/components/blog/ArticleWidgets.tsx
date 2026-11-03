import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ListOrdered } from "lucide-react";
import type { Blog } from "@/types";
import type { BlogNav } from "@/api/blog";
import type { TocItem } from "@/lib/blogHtml";
import { usePrefetchBlog } from "@/hooks/useBlog";
import { cn } from "@/lib/utils";
import { BlogImage } from "./BlogImage";
import { blogAuthor } from "./blogUtils";

/** Thin gold bar across the top showing how far through the article you are. */
export function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-accent to-gold print:hidden" style={{ scaleX }} />;
}

/** Highlights the heading currently being read. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const jumpTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
};

/** Auto-generated table of contents: sticky list on desktop, collapsible on mobile. */
export function TableOfContents({ items, variant = "sidebar" }: { items: TocItem[]; variant?: "sidebar" | "inline" }) {
  const active = useActiveHeading(items.map((i) => i.id));
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;

  const list = (
    <ol className="space-y-1 border-l border-border">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              jumpTo(item.id);
              setOpen(false);
            }}
            className={cn(
              "-ml-px block border-l-2 py-1.5 text-sm leading-snug transition-colors",
              item.level === 3 ? "pl-7" : "pl-4",
              active === item.id ? "border-primary font-medium text-primary" : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <div className="rounded-card border border-border bg-surface/70 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-fg" aria-expanded={open}>
          <span className="flex items-center gap-2">
            <ListOrdered size={16} className="text-accent" /> In this article
          </span>
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-4">
              {list}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-accent">In this article</p>
      {list}
    </nav>
  );
}

/** Author card at the end of the article. */
export function AuthorCard({ blog, siteName }: { blog: Blog; siteName: string }) {
  const author = blogAuthor(blog);
  if (!author) return null;
  return (
    <div className="flex items-center gap-5 rounded-card border border-border bg-gradient-to-br from-surface to-surface-muted/60 p-6">
      {author.profileImage?.url ? (
        <img src={author.profileImage.url} alt={author.name} className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-accent/30" loading="lazy" />
      ) : (
        <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-primary font-display text-2xl text-fg-inverse ring-2 ring-accent/30">{author.name.charAt(0)}</span>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Written by</p>
        <p className="mt-1 font-display text-2xl font-semibold text-fg">{author.name}</p>
        <p className="mt-1 text-sm text-fg-muted">Jewellery stylist at {siteName} — styling guides, care tips and the stories behind our collections.</p>
      </div>
    </div>
  );
}

/** FAQ accordion (the page also emits FAQPage structured data). */
export function BlogFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;
  return (
    <section aria-labelledby="blog-faq">
      <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-accent">Good to know</p>
      <h2 id="blog-faq" className="mt-2 font-display text-3xl font-semibold text-fg">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-border rounded-card border border-border bg-surface">
        {faqs.map((f, i) => (
          <div key={f.question}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open === i}>
              <span className="font-medium text-fg">{f.question}</span>
              <ChevronDown size={18} className={cn("flex-none text-accent transition-transform", open === i && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-fg-soft">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Floating "back to top" once you've scrolled a screen down. */
export function BackToTop() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-fg-inverse shadow-lift transition-transform hover:-translate-y-0.5 print:hidden sm:bottom-8"
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Previous / next article — the next one is prefetched when it scrolls into view. */
export function PrevNextNav({ prev, next }: { prev?: BlogNav; next?: BlogNav }) {
  const prefetch = usePrefetchBlog();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!next || !ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        prefetch(next.slug);
        observer.disconnect();
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [next, prefetch]);

  if (!prev && !next) return null;
  const item = (post: NonNullable<BlogNav>, dir: "prev" | "next") => (
    <Link
      to={`/blog/${post.slug}`}
      onMouseEnter={() => prefetch(post.slug)}
      className={cn("group flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft", dir === "next" && "flex-row-reverse text-right")}
    >
      <div className="h-16 w-20 flex-none overflow-hidden rounded-xl">
        <BlogImage src={post.featuredImage?.url} alt="" sizes="80px" />
      </div>
      <div className="min-w-0">
        <p className={cn("flex items-center gap-1 text-[11px] font-semibold uppercase tracking-eyebrow text-accent", dir === "next" && "justify-end")}>
          {dir === "prev" ? <ArrowLeft size={12} /> : null}
          {dir === "prev" ? "Previous" : "Next"}
          {dir === "next" ? <ArrowRight size={12} /> : null}
        </p>
        <p className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-snug text-fg group-hover:text-primary">{post.title}</p>
      </div>
    </Link>
  );
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2">
      <div>{prev && item(prev, "prev")}</div>
      <div>{next && item(next, "next")}</div>
    </div>
  );
}
