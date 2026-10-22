import { useRef, useState } from "react";
import { Plus, Trash2, FolderPlus, ImageIcon, Copy } from "lucide-react";
import { useMediaFolders, useMediaList, useCreateFolder, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MediaLibraryPage() {
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders } = useMediaFolders();
  const { data, isLoading } = useMediaList({ folderId, page, limit: 24 });
  const createFolder = useCreateFolder();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadMedia.mutate({ files: Array.from(files), folderId });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <div>
      <PageHeader
        title="Media library"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFolderModalOpen(true)}><FolderPlus size={15} /> New folder</Button>
            <Button onClick={() => fileInputRef.current?.click()} isLoading={uploadMedia.isPending}><Plus size={15} /> Upload</Button>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => { setFolderId(undefined); setPage(1); }} className={cn("rounded-lg border px-3 py-1.5 text-sm", !folderId ? "border-ink bg-ink text-white" : "border-border")}>
          All files
        </button>
        {folders?.map((f) => (
          <button key={f._id} onClick={() => { setFolderId(f._id); setPage(1); }} className={cn("rounded-lg border px-3 py-1.5 text-sm", folderId === f._id ? "border-ink bg-ink text-white" : "border-border")}>
            {f.name}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
          </div>
        ) : !data || data.media.length === 0 ? (
          <EmptyState icon={<ImageIcon size={18} />} title="No media files yet" description="Upload images to use across products, categories, and content." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
              {data.media.map((m) => (
                <div key={m._id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
                  <img src={m.url} alt={m.originalName} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => copyUrl(m.url)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink" aria-label="Copy URL"><Copy size={13} /></button>
                    <button onClick={() => setDeleteId(m._id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-danger" aria-label="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={folderModalOpen} onClose={() => setFolderModalOpen(false)} title="New folder">
        <form onSubmit={(e) => { e.preventDefault(); createFolder.mutate({ name: newFolderName }, { onSuccess: () => { setFolderModalOpen(false); setNewFolderName(""); } }); }} className="space-y-4">
          <Input label="Folder name" required value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          <Button type="submit" className="w-full" isLoading={createFolder.isPending}>Create folder</Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMedia.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} title="Delete file" confirmLabel="Delete" danger isLoading={deleteMedia.isPending} />
    </div>
  );
}
