import { useState } from "react";
import { Bookmark, Check, Heart, Link2, MessageCircle, Printer, Share2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon, XIcon } from "./BrandIcons";
import { toast } from "sonner";
import { blogApi } from "@/api/blog";
import { useJournalStorage } from "@/hooks/useJournalStorage";
import { cn } from "@/lib/utils";
import { articleUrl, compactNumber, getBookmarks, getLiked, setLiked, shareLinks, toggleBookmark, type SavedPost } from "./blogUtils";

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 text-fg-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent";

/** Copies the article link. */
export function CopyLinkButton({ slug, className }: { slug: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl(slug));
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };
  return (
    <button type="button" onClick={copy} className={cn(iconBtn, className)} aria-label="Copy link">
      {copied ? <Check size={16} /> : <Link2 size={16} />}
    </button>
  );
}

/** WhatsApp, Facebook, X, LinkedIn, copy link and (optionally) print. */
export function ShareButtons({
  slug,
  title,
  vertical = false,
  showPrint = false,
  className,
}: {
  slug: string;
  title: string;
  vertical?: boolean;
  showPrint?: boolean;
  className?: string;
}) {
  const links = shareLinks(articleUrl(slug), title);
  const items: { label: string; href: string; icon: React.ReactNode }[] = [
    { label: "Share on WhatsApp", href: links.whatsapp, icon: <MessageCircle size={16} /> },
    { label: "Share on Facebook", href: links.facebook, icon: <FacebookIcon /> },
    { label: "Share on X", href: links.x, icon: <XIcon /> },
    { label: "Share on LinkedIn", href: links.linkedin, icon: <LinkedinIcon /> },
  ];
  return (
    <div className={cn("flex gap-2", vertical ? "flex-col" : "flex-wrap items-center", className)}>
      {items.map((i) => (
        <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label={i.label} title={i.label}>
          {i.icon}
        </a>
      ))}
      <CopyLinkButton slug={slug} />
      {showPrint && (
        <button type="button" onClick={() => window.print()} className={iconBtn} aria-label="Print article" title="Print article">
          <Printer size={16} />
        </button>
      )}
    </div>
  );
}

/** Native share sheet on phones, copy link elsewhere — for cards. */
export function QuickShareButton({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = articleUrl(slug);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // dismissed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };
  return (
    <button type="button" onClick={share} className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-fg shadow-sm backdrop-blur transition-colors hover:text-accent", className)} aria-label="Share">
      <Share2 size={15} />
    </button>
  );
}

/** Heart with count; remembered per browser, counted on the server. */
export function LikeButton({ slug, initialCount = 0, className }: { slug: string; initialCount?: number; className?: string }) {
  const likedSlugs = useJournalStorage(getLiked);
  const liked = likedSlugs.includes(slug);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(slug, next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const res = await blogApi.like(slug, next);
      setCount(res.data.likeCount);
    } catch {
      setLiked(slug, !next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error("Couldn't save your like — try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
        liked ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary hover:text-primary",
        className,
      )}
    >
      <Heart size={15} className={cn("transition-transform", liked && "scale-110 fill-current")} />
      {compactNumber(count)}
      <span className="sr-only">{liked ? "Unlike" : "Like"} this article</span>
    </button>
  );
}

/** Save for later (this browser). */
export function BookmarkButton({ post, className, compact = false }: { post: SavedPost; className?: string; compact?: boolean }) {
  const saved = useJournalStorage(getBookmarks).some((p) => p.slug === post.slug);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleBookmark(post);
    toast.success(now ? "Saved to your reading list" : "Removed from your reading list");
  };
  if (compact) {
    return (
      <button type="button" onClick={toggle} aria-pressed={saved} className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur transition-colors", saved ? "text-primary" : "text-fg hover:text-accent", className)} aria-label={saved ? "Remove bookmark" : "Bookmark"}>
        <Bookmark size={15} className={saved ? "fill-current" : ""} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
        saved ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-fg hover:border-accent hover:text-accent",
        className,
      )}
    >
      <Bookmark size={15} className={saved ? "fill-current" : ""} /> {saved ? "Saved" : "Save"}
    </button>
  );
}
