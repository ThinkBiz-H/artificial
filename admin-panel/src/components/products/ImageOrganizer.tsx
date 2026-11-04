import { useState } from "react";
import { GripVertical, Star, X } from "lucide-react";
import type { ImageRef } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Saved product photos: drag to reorder, star to pick the cover (thumbnail),
 * × to remove. Order and cover are saved with the product.
 */
export function ImageOrganizer({
  images,
  coverUrl,
  onReorder,
  onCover,
  onRemove,
}: {
  images: ImageRef[];
  coverUrl?: string;
  onReorder: (next: ImageRef[]) => void;
  onCover: (url: string) => void;
  onRemove: (img: ImageRef) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  if (!images.length) return null;

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  return (
    <div className="mb-4">
      <ul className="flex flex-wrap gap-3">
        {images.map((img, i) => {
          const isCover = coverUrl ? img.url === coverUrl : i === 0;
          return (
            <li
              key={img.url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "group relative h-24 w-24 cursor-grab overflow-hidden rounded-lg border bg-surface active:cursor-grabbing",
                isCover ? "border-brand ring-2 ring-brand/30" : "border-border",
                overIndex === i && dragIndex !== i && "ring-2 ring-info",
                dragIndex === i && "opacity-40",
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" draggable={false} />
              <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/50 text-white opacity-0 group-hover:opacity-100" aria-hidden>
                <GripVertical size={12} />
              </span>
              <button
                type="button"
                onClick={() => onRemove(img)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                <X size={11} />
              </button>
              <button
                type="button"
                onClick={() => onCover(img.url)}
                className={cn(
                  "absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded py-0.5 text-[10px] font-semibold",
                  isCover ? "bg-brand text-white" : "bg-white/90 text-ink opacity-0 group-hover:opacity-100",
                )}
                aria-label={isCover ? "Cover image" : "Set as cover image"}
              >
                <Star size={10} className={isCover ? "fill-current" : ""} /> {isCover ? "Cover" : "Set cover"}
              </button>
              {/* Keyboard reordering */}
              <span className="sr-only">
                <button type="button" onClick={() => i > 0 && move(i, i - 1)}>
                  Move earlier
                </button>
                <button type="button" onClick={() => i < images.length - 1 && move(i, i + 1)}>
                  Move later
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted">Drag to reorder · the cover is the first photo buyers see.</p>
    </div>
  );
}
