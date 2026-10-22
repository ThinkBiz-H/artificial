import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, Play, Rotate3d, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOverlay } from "@/components/ui/Modal";

type Img = { url: string; publicId?: string };
type Mode = "image" | "video" | "spin";

/** YouTube / Vimeo links become privacy-friendly embeds; anything else plays as a file. */
function toEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`;
  return null;
}

function ProductVideo({ url, title }: { url: string; title: string }) {
  const embed = toEmbed(url);
  return embed ? (
    <iframe src={embed} title={`${title} video`} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" />
  ) : (
    <video src={url} controls playsInline preload="metadata" className="h-full w-full object-cover" aria-label={`${title} video`} />
  );
}

/**
 * 360° viewer: drag (or use the arrow keys) to rotate through an ordered set
 * of frames. Activates only when the gallery receives `spinFrames`.
 */
function Spin360({ frames, alt }: { frames: string[]; alt: string }) {
  const [frame, setFrame] = useState(0);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const step = (d: number) => setFrame((f) => (f + d + frames.length) % frames.length);

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`${alt} — 360° view. Use left and right arrow keys to rotate.`}
      aria-valuemin={1}
      aria-valuemax={frames.length}
      aria-valuenow={frame + 1}
      className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, start: frame };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const delta = Math.round((e.clientX - drag.current.x) / 12);
        setFrame((((drag.current.start - delta) % frames.length) + frames.length) % frames.length);
      }}
      onPointerUp={() => (drag.current = null)}
    >
      {frames.map((src, i) => (
        <img key={src} src={src} alt={i === 0 ? alt : ""} draggable={false} loading={i < 2 ? "eager" : "lazy"} className={cn("absolute inset-0 h-full w-full object-cover", i !== frame && "invisible")} />
      ))}
      <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-label font-semibold uppercase tracking-label text-fg shadow-sm">
        <Rotate3d size={14} aria-hidden /> Drag to rotate
      </span>
    </div>
  );
}

function Lightbox({ images, index, onIndex, onClose, alt }: { images: Img[]; index: number; onIndex: (i: number) => void; onClose: () => void; alt: string }) {
  useOverlay(true, onClose);
  const go = (d: number) => onIndex((index + d + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div className="fixed inset-0 z-[1400] flex flex-col bg-canvas" role="dialog" aria-modal="true" aria-label={`${alt} images`}>
      <div className="flex flex-none items-center justify-between px-4 py-3">
        <span className="text-xs tabular-nums text-fg-muted">
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-muted">
          <X size={20} aria-hidden />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        <img src={images[index].url} alt={alt} className="max-h-full max-w-full rounded-image object-contain" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-soft">
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-soft">
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex flex-none justify-center gap-2 overflow-x-auto px-4 pb-5">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={cn("h-16 w-16 flex-none overflow-hidden rounded-xl border-2", i === index ? "border-primary" : "border-transparent opacity-60")}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

const thumbBase = "relative aspect-[4/5] w-full flex-none overflow-hidden rounded-xl border transition-all";

/**
 * Product media — desktop: vertical thumbnails + hover-zoom main image;
 * mobile: swipeable carousel with dots. Images open a full-screen lightbox.
 * Optional product video (Product.videoUrl) and 360° frames join the set.
 */
export function ProductGallery({
  images: allImages,
  alt,
  badge,
  fallback,
  videoUrl,
  spinFrames,
}: {
  images: Img[];
  alt: string;
  badge?: React.ReactNode;
  fallback?: Img[];
  videoUrl?: string;
  /** Ordered 360° frames; the 360° view appears only when at least 8 are supplied. */
  spinFrames?: string[];
}) {
  // Drop images whose URL fails to load (e.g. deleted from the media store); fall back to `fallback` if none survive.
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const markFailed = (url: string) => setFailed((s) => (s.has(url) ? s : new Set(s).add(url)));
  const ok = allImages.filter((i) => !failed.has(i.url));
  const images = ok.length ? ok : (fallback ?? []).filter((i) => !failed.has(i.url));
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("image");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const hasVideo = !!videoUrl?.trim();
  const hasSpin = (spinFrames?.length ?? 0) >= 8;

  // Reset when the image set changes (e.g. variant switch).
  const key = images.map((i) => i.url).join("|");
  useEffect(() => {
    setActive(0);
    setMode("image");
    trackRef.current?.scrollTo({ left: 0 });
  }, [key]);

  if (images.length === 0 && !hasVideo) {
    return <div className="flex aspect-[4/5] items-center justify-center rounded-image bg-surface-muted font-display text-xl text-fg-muted">No image available</div>;
  }

  const current = images[Math.min(active, Math.max(images.length - 1, 0))];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const mobileSlides = images.length + (hasVideo ? 1 : 0) + (hasSpin ? 1 : 0);
  const mediaThumb = (m: Mode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-label={label}
      aria-current={mode === m}
      className={cn(thumbBase, "flex flex-col items-center justify-center gap-1 bg-surface-muted text-fg", mode === m ? "border-primary" : "border-border hover:border-primary")}
    >
      {icon}
      <span className="text-2xs font-semibold uppercase tracking-label">{m === "video" ? "Video" : "360°"}</span>
    </button>
  );

  return (
    <div>
      {/* Mobile carousel */}
      <div className="relative -mx-4 sm:mx-0 lg:hidden">
        <div ref={trackRef} onScroll={onTrackScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-image">
          {images.map((img, i) => (
            <button key={img.url + i} type="button" onClick={() => setLightbox(true)} className="aspect-[4/5] w-full flex-none snap-center bg-surface-muted" aria-label={`View image ${i + 1} full screen`}>
              <img src={img.url} alt={i === 0 ? alt : ""} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} onError={() => markFailed(img.url)} className="h-full w-full object-cover" />
            </button>
          ))}
          {hasVideo && (
            <div className="aspect-[4/5] w-full flex-none snap-center bg-surface-dark">
              <ProductVideo url={videoUrl!} title={alt} />
            </div>
          )}
          {hasSpin && (
            <div className="aspect-[4/5] w-full flex-none snap-center bg-surface-muted">
              <Spin360 frames={spinFrames!} alt={alt} />
            </div>
          )}
        </div>
        {badge && <div className="pointer-events-none absolute left-4 top-4">{badge}</div>}
        {mobileSlides > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: mobileSlides }).map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-primary" : "w-1.5 bg-fg/30")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 lg:flex">
        {mobileSlides > 1 && (
          <div className="no-scrollbar flex max-h-[680px] w-[80px] flex-none flex-col gap-3 overflow-y-auto">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => {
                  setMode("image");
                  setActive(i);
                }}
                onMouseEnter={() => {
                  setMode("image");
                  setActive(i);
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={mode === "image" && i === active}
                className={cn(thumbBase, mode === "image" && i === active ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}
              >
                <img src={img.url} alt="" onError={() => markFailed(img.url)} className="h-full w-full object-cover" />
              </button>
            ))}
            {hasVideo && mediaThumb("video", "Play product video", <Play size={18} aria-hidden />)}
            {hasSpin && mediaThumb("spin", "View in 360 degrees", <Rotate3d size={18} aria-hidden />)}
          </div>
        )}
        {mode === "video" && hasVideo ? (
          <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-image bg-surface-dark">
            <ProductVideo url={videoUrl!} title={alt} />
          </div>
        ) : mode === "spin" && hasSpin ? (
          <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-image bg-surface-muted">
            <Spin360 frames={spinFrames!} alt={alt} />
          </div>
        ) : current ? (
          <div
            className="group relative aspect-[4/5] min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-image bg-surface-muted"
            onMouseMove={onMove}
            onMouseLeave={() => setZoom(null)}
            onClick={() => setLightbox(true)}
          >
            <img src={current.url} alt={alt} fetchPriority="high" onError={() => markFailed(current.url)} className={cn("h-full w-full object-cover transition-opacity duration-200", zoom && "opacity-0")} />
            {zoom && (
              <div
                aria-hidden
                className="absolute inset-0 bg-no-repeat"
                style={{ backgroundImage: `url(${current.url})`, backgroundSize: "220%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }}
              />
            )}
            {badge && <div className="pointer-events-none absolute left-4 top-4">{badge}</div>}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(true);
              }}
              aria-label="View images full screen"
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-fg opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Expand size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-image bg-surface-dark">
            <ProductVideo url={videoUrl!} title={alt} />
          </div>
        )}
      </div>

      {lightbox && images.length > 0 && <Lightbox images={images} index={Math.min(active, images.length - 1)} onIndex={setActive} onClose={() => setLightbox(false)} alt={alt} />}
    </div>
  );
}
