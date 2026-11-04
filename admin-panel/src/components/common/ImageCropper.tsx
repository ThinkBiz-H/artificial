import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ASPECTS = [
  { label: "4:5 (product)", value: 4 / 5 },
  { label: "1:1 (square)", value: 1 },
  { label: "16:9 (banner)", value: 16 / 9 },
  { label: "Original", value: 0 },
];

/**
 * Crops a photo before upload: pick an aspect ratio, zoom, and drag the
 * picture to frame it. Produces a new File (JPEG/WebP) at up to 2000px.
 */
export function ImageCropper({ file, open, onClose, onDone }: { file: File | null; open: boolean; onClose: () => void; onDone: (cropped: File) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState(4 / 5);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const VIEW_W = 360;

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = url;
    // oxlint-disable-next-line react/set-state-in-effect -- reset framing for a new file
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const ratio = aspect || (img ? img.width / img.height : 1);
  const viewH = Math.round(VIEW_W / ratio);
  // Scale so the image covers the frame at zoom 1.
  const cover = img ? Math.max(VIEW_W / img.width, viewH / img.height) : 1;
  const scale = cover * zoom;
  const drawW = img ? img.width * scale : 0;
  const drawH = img ? img.height * scale : 0;
  const clamp = (o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(VIEW_W - drawW, o.x)),
    y: Math.min(0, Math.max(viewH - drawH, o.y)),
  });
  // Centre on first render / when the frame or zoom changes.
  const pos = clamp(offset.x === 0 && offset.y === 0 ? { x: (VIEW_W - drawW) / 2, y: (viewH - drawH) / 2 } : offset);

  const save = async () => {
    if (!img || !file) return;
    // Source rectangle in original pixels.
    const sx = -pos.x / scale;
    const sy = -pos.y / scale;
    const sw = VIEW_W / scale;
    const sh = viewH / scale;
    const outW = Math.min(2000, Math.round(sw));
    const outH = Math.round(outW / ratio);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    const type = canvas.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.9));
    if (!blob) return;
    onDone(new File([blob], file.name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? ".webp" : ".jpg"), { type }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Crop photo" className="max-w-md">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                setAspect(a.value);
                setOffset({ x: 0, y: 0 });
              }}
              className={cn("rounded-full border px-3 py-1 text-xs", aspect === a.value ? "border-brand bg-brand text-white" : "border-border hover:border-brand")}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div
          className="relative mx-auto cursor-move touch-none overflow-hidden rounded-lg bg-surface"
          style={{ width: VIEW_W, height: viewH }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setOffset(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }));
          }}
          onPointerUp={() => (drag.current = null)}
        >
          {img && <img src={img.src} alt="" draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left: pos.x, top: pos.y, width: drawW, height: drawH }} />}
          <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/60" />
        </div>
        <label className="block text-xs text-muted">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value));
              setOffset(clamp(pos));
            }}
            className="mt-1 w-full accent-[var(--color-brand)]"
          />
        </label>
        <p className="text-xs text-muted">Drag the photo to frame the piece.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={save} disabled={!img}>
            Apply crop
          </Button>
        </div>
      </div>
    </Modal>
  );
}
