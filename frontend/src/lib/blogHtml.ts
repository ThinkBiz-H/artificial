import DOMPurify from "dompurify";

// Sanitizes blog post HTML right before it is rendered on the storefront,
// so nothing unsafe can execute even if unsafe markup ever reached the
// database. Mirrors admin-panel/src/lib/blogHtml.ts (the editor-side
// sanitizer) — keep the two lists in sync.

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del", "span", "mark", "code", "pre",
  "ul", "ol", "li", "blockquote", "a", "img",
  // Tables, captioned images / galleries and video embeds.
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "figure", "figcaption", "div", "iframe",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "title", "width", "height", "style", "class", "start",
  "colspan", "rowspan", "scope", "allowfullscreen",
];

const ALLOWED_STYLES = new Set(["color", "background-color", "font-size", "font-family", "text-align"]);

const SAFE_STYLE_VALUE = /^[#\w\s,.'"%()-]+$/;
const UNSAFE_STYLE_VALUE = /url\s*\(|expression\s*\(|javascript:|@import|\\/i;

/** Classes that mean something to the stylesheet: code languages, galleries, video frames. */
const ALLOWED_CLASS = /^(language-[\w-]+|gallery|gallery-2|gallery-3|video)$/;

/** Only these players may be embedded. */
const EMBED_SRC = /^https:\/\/(www\.youtube\.com\/embed\/|www\.youtube-nocookie\.com\/embed\/|youtube\.com\/embed\/|player\.vimeo\.com\/video\/)[\w\-/?=&.%]+$/i;

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  // Drop any iframe that isn't a YouTube / Vimeo player.
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe" && !EMBED_SRC.test((node as Element).getAttribute?.("src") || "")) {
      node.parentNode?.removeChild(node);
    }
  });

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "style") {
      const kept = data.attrValue
        .split(";")
        .map((decl) => decl.trim())
        .filter(Boolean)
        .filter((decl) => {
          const [prop, ...rest] = decl.split(":");
          const value = rest.join(":").trim();
          return (
            ALLOWED_STYLES.has(prop.trim().toLowerCase()) &&
            SAFE_STYLE_VALUE.test(value) &&
            !UNSAFE_STYLE_VALUE.test(value)
          );
        });
      if (kept.length) data.attrValue = `${kept.join("; ")};`;
      else data.keepAttr = false;
    }
    if (data.attrName === "class") {
      const classes = data.attrValue.split(/\s+/).filter((c) => ALLOWED_CLASS.test(c));
      if (classes.length) data.attrValue = classes.join(" ");
      else data.keepAttr = false;
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
    // Images and embeds below the fold shouldn't block the page load.
    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("decoding", "async");
    }
    if (node.tagName === "IFRAME") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("allow", "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen");
      node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      node.setAttribute("allowfullscreen", "");
    }
  });
}

export function sanitizeBlogHtml(html: string): string {
  installHooks();
  // DOMPurify's built-in URL check already rejects javascript:/data: links.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [...ALLOWED_ATTR, "loading", "decoding", "allow", "referrerpolicy"],
    ADD_ATTR: ["allowfullscreen"],
  });
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "section";

/**
 * Sanitizes, then gives every h2/h3 a stable id and returns the table of
 * contents built from them (for the sticky TOC and #anchor links).
 */
export function prepareArticleHtml(html: string): { html: string; toc: TocItem[] } {
  const clean = sanitizeBlogHtml(html);
  if (typeof window === "undefined") return { html: clean, toc: [] };
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, "text/html");
  const root = doc.body.firstElementChild as HTMLElement;
  const used = new Map<string, number>();
  const toc: TocItem[] = [];
  root.querySelectorAll("h2, h3").forEach((h) => {
    const text = (h.textContent || "").trim();
    if (!text) return;
    const base = slugifyHeading(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    h.setAttribute("id", id);
    toc.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
  });
  // Wide tables scroll inside their own box instead of the page.
  root.querySelectorAll("table").forEach((t) => {
    if (t.parentElement?.classList.contains("table-wrap")) return;
    const wrap = doc.createElement("div");
    wrap.className = "table-wrap";
    t.replaceWith(wrap);
    wrap.appendChild(t);
  });
  return { html: root.innerHTML, toc };
}
