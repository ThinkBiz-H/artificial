import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStoreInfo } from "@/hooks/useStoreInfo";

interface SeoProps {
  /** Page-specific title; the brand name is appended automatically. */
  title?: string;
  description?: string;
  image?: string;
  /** Override the canonical path (defaults to the current pathname, no query string). */
  canonicalPath?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
  /** Comma-separated meta keywords. */
  keywords?: string;
  /** Explicit robots directive (e.g. "noindex, follow"); overrides noindex. */
  robots?: string;
  /** Absolute canonical URL; overrides canonicalPath. */
  canonicalUrl?: string;
  /** Open Graph overrides (default to the page title / description / image). */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** One or more schema.org objects rendered as JSON-LD. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Per-page head tags. Managed imperatively (rather than React 19 hoisting)
 * so there is always exactly one <title>/description/canonical in <head>.
 */
export function Seo({
  title,
  description,
  image,
  canonicalPath,
  type = "website",
  noindex,
  keywords,
  robots,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  jsonLd,
}: SeoProps) {
  const { siteName } = useStoreInfo();
  const { pathname } = useLocation();

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Premium Artificial Jewellery Online`;
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = fullTitle;
    const url = canonicalUrl || `${window.location.origin}${canonicalPath ?? pathname}`;
    const shareImage = ogImage || image;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", robots || (noindex ? "noindex, nofollow" : undefined));
    upsertMeta("property", "og:title", ogTitle || fullTitle);
    upsertMeta("property", "og:description", ogDescription || description);
    upsertMeta("property", "og:image", shareImage);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("name", "twitter:card", shareImage ? "summary_large_image" : "summary");
    upsertCanonical(url);
  }, [fullTitle, description, image, canonicalPath, pathname, type, noindex, siteName, keywords, robots, canonicalUrl, ogTitle, ogDescription, ogImage]);

  useEffect(() => {
    if (!jsonLdString) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seo = "page";
    script.text = jsonLdString;
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLdString]);

  return null;
}

/** schema.org BreadcrumbList from a list of { name, path } crumbs. */
export function breadcrumbJsonLd(crumbs: { name: string; path?: string }[]) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${origin}${c.path}` } : {}),
    })),
  };
}
