import { useRef, useState, useEffect } from "react";
import { Crop, ImagePlus, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageCropper } from "./ImageCropper";

/**
 * Image picker used across the admin: click or drag & drop (many files at
 * once when `multiple`), previews, remove, and crop for each new photo.
 */
export function ImageUpload({
  value,
  onChange,
  existingUrl,
  onRemoveExisting,
  label,
  multiple,
  className,
}: {
  value: File[] | File | null;
  onChange: (files: File[] | File | null) => void;
  existingUrl?: string;
  onRemoveExisting?: () => void;
  label?: string;
  multiple?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const files = Array.isArray(value) ? value : value ? [value] : [];

  useEffect(() => {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    const urls = list.map((f) => URL.createObjectURL(f));
    // oxlint-disable-next-line react/set-state-in-effect -- syncing fetched entity into local editable state
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [value]);

  const handleFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    if (multiple) onChange([...(Array.isArray(value) ? value : []), ...picked]);
    else onChange(picked[0] || null);
  };

  const removeAt = (idx: number) => {
    if (Array.isArray(value)) onChange(value.filter((_, i) => i !== idx));
    else onChange(null);
  };

  const replaceAt = (idx: number, file: File) => {
    if (Array.isArray(value)) onChange(value.map((f, i) => (i === idx ? file : f)));
    else onChange(file);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn("rounded-xl border border-dashed p-3 transition-colors", dragging ? "border-brand bg-info-bg" : "border-border-strong/70")}
      >
        <div className="flex flex-wrap gap-3">
          {existingUrl && !previews.length && (
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              <img src={existingUrl} alt="Current" className="h-full w-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={onRemoveExisting}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="Remove image"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          )}
          {previews.map((url, i) => (
            <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              <img src={url} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove"
              >
                <X size={11} />
              </button>
              <button
                type="button"
                onClick={() => setCropIndex(i)}
                className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded bg-white/90 py-0.5 text-[10px] font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                aria-label="Crop photo"
              >
                <Crop size={10} /> Crop
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 min-w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong px-3 text-muted hover:border-brand hover:text-brand"
          >
            {multiple ? <UploadCloud size={18} /> : <ImagePlus size={18} />}
            <span className="text-[10px]">{multiple ? "Add photos" : "Upload"}</span>
          </button>
        </div>
        {multiple && <p className="mt-2 text-[11px] text-muted">Drag & drop several photos here, or click to choose. Hover a new photo to crop it.</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <ImageCropper
        file={cropIndex !== null ? (files[cropIndex] ?? null) : null}
        open={cropIndex !== null}
        onClose={() => setCropIndex(null)}
        onDone={(cropped) => {
          if (cropIndex !== null) replaceAt(cropIndex, cropped);
          setCropIndex(null);
        }}
      />
    </div>
  );
}
