import DOMPurify from "dompurify";

// Sanitizes blog HTML produced by the Blog rich text editor before it is
// saved. Only semantic tags plus the handful of inline styles the editor
// itself produces (colour, highlight, font size/family, alignment) survive —
// scripts, event handlers, iframes, javascript: URLs and any other markup are
// stripped. The storefront runs the same rules again before rendering
// (frontend/src/lib/blogHtml.ts), so keep the two lists in sync.

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del", "span", "mark", "code", "pre",
  "ul", "ol", "li", "blockquote", "a", "img",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "title", "width", "height", "style", "class", "start"];

const ALLOWED_STYLES = new Set(["color", "background-color", "font-size", "font-family", "text-align"]);

// Style values may only be plain colours / sizes / font names — never url(),
// expression() or anything else that can load or run content.
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
    // Only code-block language classes are meaningful; drop everything else.
    if (data.attrName === "class" && !/^language-[\w-]+$/.test(data.attrValue)) {
      data.keepAttr = false;
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
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR }).replace(/(?:<p><\/p>)+$/, "");
}
