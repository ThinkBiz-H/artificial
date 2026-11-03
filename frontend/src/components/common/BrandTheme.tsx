import { useEffect } from "react";
import { usePublicSettings } from "@/hooks/useCatalog";
import type { BrandTheme as Theme } from "@/types";

/** Built-in fonts (linked in index.html) — anything else is loaded from Google Fonts on demand. */
const BUNDLED_FONTS = new Set(["Cormorant Garamond", "Playfair Display", "Inter"]);
const SERIF = new Set(["Cormorant Garamond", "Playfair Display", "Lora", "Marcellus", "Cinzel", "Libre Baskerville"]);

/** Mixes a hex colour toward white (amount 0–1) — derives hover shades. */
const lighten = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const loadFont = (family: string) => {
  if (BUNDLED_FONTS.has(family)) return;
  const id = `brand-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

const fontStack = (family: string, fallback: string) => `"${family}", ${SERIF.has(family) ? `ui-serif, Georgia, serif` : `ui-sans-serif, system-ui, sans-serif`}, ${fallback}`;

/** CSS variables driven by Brand Management. Values equal to the stylesheet defaults are left alone. */
const themeVars = (t: Theme): Record<string, string> => ({
  "--color-primary": t.primary,
  "--color-info": t.primary,
  "--color-primary-hover": t.secondary,
  "--color-accent": t.accent,
  "--color-button": t.button,
  "--color-button-hover": t.button.toLowerCase() === "#5a1e36" ? "#7b2749" : lighten(t.button, 0.18),
  "--color-header": t.navbar,
  "--color-surface-dark": t.footer,
  "--color-canvas": t.background,
  "--color-fg": t.text,
  "--color-fg-muted": t.textMuted,
  "--radius-card": `${t.radius}px`,
  "--font-display": fontStack(t.headingFont, "serif"),
  "--font-sans": fontStack(t.bodyFont, "sans-serif"),
});

/**
 * Applies the admin's Brand Management theme and favicon to the live site.
 * Settings refresh in realtime (Socket.IO), so saving in the admin restyles
 * open pages without a reload. Renders nothing.
 */
export function BrandTheme() {
  const { data: settings } = usePublicSettings();
  const theme = settings?.brand?.theme;
  const favicon = settings?.brand?.logos?.favicon || settings?.brand?.logos?.browserIcon;
  const touchIcon = settings?.brand?.logos?.browserIcon || favicon;

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement.style;
    const vars = themeVars(theme);
    Object.entries(vars).forEach(([name, value]) => root.setProperty(name, value));
    loadFont(theme.headingFont);
    loadFont(theme.bodyFont);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme.primary;
  }, [theme]);

  useEffect(() => {
    if (!favicon) return;
    const set = (rel: string, href: string) => {
      const link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`) ?? Object.assign(document.createElement("link"), { rel });
      link.removeAttribute("type"); // the admin may upload PNG, SVG or ICO
      link.href = href;
      if (!link.parentNode) document.head.appendChild(link);
    };
    set("icon", favicon);
    if (touchIcon) set("apple-touch-icon", touchIcon);
  }, [favicon, touchIcon]);

  return null;
}
