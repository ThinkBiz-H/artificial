import { useRef, useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const files = Array.isArray(value) ? value : value ? [value] : [];
    const urls = files.map((f) => URL.createObjectURL(f));
// oxlint-disable-next-line react/set-state-in-effect -- syncing fetched entity into local editable state
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [value]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (multiple) {
      const existing = Array.isArray(value) ? value : [];
      onChange([...existing, ...files]);
    } else {
      onChange(files[0] || null);
    }
  };

  const removeAt = (idx: number) => {
    if (Array.isArray(value)) onChange(value.filter((_, i) => i !== idx));
    else onChange(null);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
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
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
            <img src={url} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Remove"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-muted hover:border-ink hover:text-ink"
        >
          <ImagePlus size={18} />
          <span className="text-[10px]">Upload</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
