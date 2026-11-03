import DOMPurify from "dompurify";

// Sanitizes blog HTML before it is saved. Only semantic tags, tables,
// captioned images/galleries, YouTube/Vimeo embeds and the handful of inline
// styles the editor itself produces (colour, highlight, font size/family,
// alignment) survive — scripts, event handlers, other iframes, javascript:
// URLs and any other markup are stripped. The storefront runs the same rules
// again before rendering (frontend/src/lib/blogHtml.ts), so keep the two
// lists in sync.

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

// Style values may only be plain colours / sizes / font names — never url(),
// expression() or anything else that can load or run content.
const SAFE_STYLE_VALUE = /^[#\w\s,.'"%()-]+$/;
const UNSAFE_STYLE_VALUE = /url\s*\(|expression\s*\(|javascript:|@import|\\/i;

/** Classes that mean something to the storefront: code languages, galleries, video frames. */
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
    // Only classes the storefront styles are kept.
    if (data.attrName === "class") {
      const classes = data.attrValue.split(/\s+/).filter((c) => ALLOWED_CLASS.test(c));
      if (classes.length) data.attrValue = classes.join(" ");
      else data.keepAttr = false;
    }
  });

  // Links opening a new tab must not get access to window.opener.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

export function sanitizeBlogHtml(html: string): string {
  installHooks();
  // DOMPurify's built-in URL check already rejects javascript:/data: links.
  // Trailing empty paragraphs are editor artefacts (the cursor slot after a
  // final image/list), not content.
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ADD_ATTR: ["allowfullscreen"] }).replace(/(?:<p><\/p>)+$/, "");
}
