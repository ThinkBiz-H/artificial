import { useRef, useState, useEffect } from "react";
import { Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideoUpload({
  value,
  onChange,
  existingUrl,
  onRemoveExisting,
  label,
  className,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string;
  onRemoveExisting?: () => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const url = value ? URL.createObjectURL(value) : null;
// oxlint-disable-next-line react/set-state-in-effect -- syncing selected file into local preview state
    setPreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [value]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || !fileList[0]) return;
    onChange(fileList[0]);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {existingUrl && !preview && (
          <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-border">
            <video src={existingUrl} className="h-full w-full object-cover" muted />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={onRemoveExisting}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="Remove video"
              >
                <X size={11} />
              </button>
            )}
          </div>
        )}
        {preview && (
          <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-border">
            <video src={preview} className="h-full w-full object-cover" muted controls />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Remove"
            >
              <X size={11} />
            </button>
          </div>
        )}
        {!preview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-muted hover:border-ink hover:text-ink"
          >
            <Film size={18} />
            <span className="text-[10px]">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
