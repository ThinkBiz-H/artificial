import DOMPurify from "dompurify";

// Sanitizes blog post HTML right before it is rendered on the storefront,
// so nothing unsafe can execute even if unsafe markup ever reached the
// database. Mirrors admin-panel/src/lib/blogHtml.ts (the editor-side
// sanitizer) — keep the two lists in sync.

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del", "span", "mark", "code", "pre",
  "ul", "ol", "li", "blockquote", "a", "img",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "width", "height", "style", "class", "start"];

const ALLOWED_STYLES = new Set(["color", "background-color", "font-size", "font-family", "text-align"]);

const SAFE_STYLE_VALUE = /^[#\w\s,.'"%()-]+$/;
const UNSAFE_STYLE_VALUE = /url\s*\(|expression\s*\(|javascript:|@import|\\/i;

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

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
    if (data.attrName === "class" && !/^language-[\w-]+$/.test(data.attrValue)) {
      data.keepAttr = false;
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
    // Images below the fold shouldn't block the page load.
    if (node.tagName === "IMG") node.setAttribute("loading", "lazy");
  });
}

export function sanitizeBlogHtml(html: string): string {
  installHooks();
  // DOMPurify's built-in URL check already rejects javascript:/data: links.
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [...ALLOWED_ATTR, "loading"] });
}
