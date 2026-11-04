/**
 * Shrinks a photo in the browser before upload: longest side ≤ maxSide,
 * re-encoded as JPEG (WebP when the browser supports it). Files that are
 * already small, or that the browser can't decode, are returned unchanged.
 */
export async function compressImage(file: File, { maxSide = 2000, quality = 0.85, skipBelowBytes = 400_000 } = {}): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < skipBelowBytes) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const type = canvas.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? ".webp" : ".jpg");
    return new File([blob], name, { type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export const compressImages = (files: File[]) => Promise.all(files.map((f) => compressImage(f)));
