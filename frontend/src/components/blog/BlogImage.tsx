import { useState } from "react";
import { cn } from "@/lib/utils";
import { blurImage, sizedImage } from "./blogUtils";

/**
 * Blog image with a blurred placeholder (Cloudinary), lazy loading and a
 * responsive srcset. Fills its (sized) parent.
 */
export function BlogImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  if (!src) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-muted to-accent-light/40", className)}>
        <span className="font-display text-4xl italic text-accent/50" aria-hidden>
          A
        </span>
      </div>
    );
  }
  const blur = blurImage(src);
  const srcSet = [480, 800, 1200, 1600].map((w) => `${sizedImage(src, w)} ${w}w`).join(", ");
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-muted", className)}>
      {blur && (
        <img src={blur} alt="" aria-hidden className={cn("absolute inset-0 h-full w-full scale-110 object-cover blur-lg transition-opacity duration-700", loaded && "opacity-0")} />
      )}
      <img
        src={sizedImage(src, 1200)}
        srcSet={sizedImage(src, 480) !== src ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn("relative h-full w-full object-cover transition-[opacity,transform] duration-700", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
