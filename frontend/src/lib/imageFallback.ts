/**
 * App-wide safety net for broken images: any <img> that fails to load is
 * swapped (once) for a neutral inline placeholder, so a deleted or moved
 * file never shows the browser's broken-image icon. Alt text and layout are
 * kept. Components' own onError handlers still run as before.
 */
const PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50"><rect width="40" height="50" fill="#f5eee8"/><path d="M20 19l5 5-5 7-5-7z" fill="none" stroke="#c79a74" stroke-width="1"/></svg>',
  );

export function installImageFallback() {
  if (typeof window === "undefined") return;
  window.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.fallback === "1") return;
      img.dataset.fallback = "1"; // never loop if the placeholder itself fails
      img.srcset = "";
      img.src = PLACEHOLDER;
    },
    true, // image errors don't bubble — listen in the capture phase
  );
}
