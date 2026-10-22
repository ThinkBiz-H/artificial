/** Best-effort browser + platform from a User-Agent string ("Chrome · Windows"). */
export function describeUserAgent(ua: string | undefined | null): { browser: string; platform: string } {
  const s = ua ?? "";
  const browser = /Edg\//.test(s)
    ? "Edge"
    : /OPR\/|Opera/.test(s)
      ? "Opera"
      : /SamsungBrowser/.test(s)
        ? "Samsung Internet"
        : /Chrome\//.test(s)
          ? "Chrome"
          : /Firefox\//.test(s)
            ? "Firefox"
            : /Safari\//.test(s)
              ? "Safari"
              : /Dart|dart:io|okhttp|SwastikalaApp/i.test(s)
                ? "Swastikala app"
                : "Unknown browser";
  const platform = /Android/.test(s)
    ? "Android"
    : /iPhone|iPad|iOS/.test(s)
      ? "iOS"
      : /Windows/.test(s)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(s)
          ? "macOS"
          : /Linux/.test(s)
            ? "Linux"
            : "Unknown platform";
  return { browser, platform };
}
