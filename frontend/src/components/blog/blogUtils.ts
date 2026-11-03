import type { Blog } from "@/types";

export const blogCategory = (blog: Blog) => (typeof blog.category === "object" && blog.category ? blog.category : null);
export const blogAuthor = (blog: Blog) => (typeof blog.author === "object" && blog.author ? blog.author : null);

/** "5 min read" — server value, or estimated from the content when present. */
export function readingTimeLabel(blog: Pick<Blog, "readingTime" | "content">) {
  let minutes = blog.readingTime ?? null;
  if (!minutes && blog.content) {
    const words = blog.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    minutes = Math.max(1, Math.round(words / 200));
  }
  return minutes ? `${minutes} min read` : "";
}

/** 1.2k style compact counts. */
export const compactNumber = (n: number | undefined) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

const isCloudinary = (url: string) => /res\.cloudinary\.com\/.+\/upload\//.test(url);

/** Resized, auto-format Cloudinary URL (other hosts are returned unchanged). */
export const sizedImage = (url: string | undefined, width: number) =>
  url && isCloudinary(url) ? url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`) : url || "";

/** Tiny blurred version used as a placeholder while the real image loads. */
export const blurImage = (url: string | undefined) =>
  url && isCloudinary(url) ? url.replace("/upload/", "/upload/f_auto,q_10,w_40,e_blur:800/") : "";

// ---------------------------------------------------------------- sharing

export function shareLinks(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

export const articleUrl = (slug: string) => `${window.location.origin}/blog/${slug}`;

// ---------------------------------------------------------------- per-browser lists (bookmarks, likes, recently viewed)

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("journal-storage", { detail: key }));
  } catch {
    // Private mode / storage full — the feature simply doesn't persist.
  }
};

export interface SavedPost {
  slug: string;
  title: string;
  image?: string;
  readingTime?: number | null;
}

export const STORAGE_KEYS = { bookmarks: "journal:bookmarks", liked: "journal:liked", recent: "journal:recent" } as const;

export const getBookmarks = () => read<SavedPost[]>(STORAGE_KEYS.bookmarks, []);
export const isBookmarked = (slug: string) => getBookmarks().some((p) => p.slug === slug);
export function toggleBookmark(post: SavedPost) {
  const list = getBookmarks();
  const next = list.some((p) => p.slug === post.slug) ? list.filter((p) => p.slug !== post.slug) : [post, ...list].slice(0, 50);
  write(STORAGE_KEYS.bookmarks, next);
  return next.some((p) => p.slug === post.slug);
}

export const getLiked = () => read<string[]>(STORAGE_KEYS.liked, []);
export const setLiked = (slug: string, liked: boolean) =>
  write(STORAGE_KEYS.liked, liked ? [...new Set([slug, ...getLiked()])].slice(0, 500) : getLiked().filter((s) => s !== slug));

export const getRecentlyViewed = () => read<SavedPost[]>(STORAGE_KEYS.recent, []);
export const rememberViewed = (post: SavedPost) =>
  write(STORAGE_KEYS.recent, [post, ...getRecentlyViewed().filter((p) => p.slug !== post.slug)].slice(0, 8));

export const toSavedPost = (blog: Blog): SavedPost => ({
  slug: blog.slug,
  title: blog.title,
  image: blog.featuredImage?.url,
  readingTime: blog.readingTime,
});
