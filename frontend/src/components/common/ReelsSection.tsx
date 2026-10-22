import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Reel } from "@/types";
import { SectionHeading } from "./SectionHeading";

interface ReelsSectionProps {
  title?: string;
  subtitle?: string;
  reels?: Reel[];
  videos?: { url: string; publicId?: string }[];
}

const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

/** Admin-managed shoppable reels (Admin > Homepage Builder > Reels). Renders nothing when empty. */
export function ReelsSection({ title = "Watch & Shop", subtitle, reels, videos }: ReelsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const items: Reel[] =
    reels && reels.length > 0
      ? [...reels].filter((r) => r.active !== false).sort((a, b) => a.order - b.order)
      : (videos || []).map((v, i) => ({
          _id: v.publicId || String(i),
          video: { url: v.url, publicId: v.publicId || "" },
          order: i,
          active: true,
        }));

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="In motion" title={title} description={subtitle} className="flex-1" />
          <div className="mb-10 hidden gap-2 lg:flex">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scrollBy(d)}
                aria-label={d < 0 ? "Scroll left" : "Scroll right"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-primary"
              >
                {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        </div>
        <div ref={trackRef} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:gap-4 sm:px-0">
          {items.map((reel) => {
            const content = (
              <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-primary">
                <video
                  src={reel.video.url}
                  poster={reel.thumbnail?.url || undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  onMouseEnter={(e) => canHover() && void e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    if (!canHover()) return;
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                  onClick={(e) => {
                    if (canHover()) return;
                    e.preventDefault();
                    const el = e.currentTarget;
                    if (el.paused) void el.play();
                    else el.pause();
                  }}
                />
                <span className="pointer-events-none absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-fg transition-opacity group-hover:opacity-0">
                  <Play size={13} className="ml-0.5" fill="currentColor" />
                </span>
                {reel.title && (
                  <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-fg/45 px-3 py-2.5 text-xs font-medium text-fg-inverse">{reel.title}</p>
                )}
              </div>
            );
            return (
              <div key={reel._id} className="w-[58%] flex-none snap-start sm:w-[34%] lg:w-[23%]">
                {reel.link ? (
                  /^https?:/i.test(reel.link) ? (
                    <a href={reel.link} className="block">
                      {content}
                    </a>
                  ) : (
                    <Link to={reel.link} className="block">
                      {content}
                    </Link>
                  )
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
