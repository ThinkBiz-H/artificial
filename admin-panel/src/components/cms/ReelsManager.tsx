import { useState } from "react";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import type { HomeSection, Reel } from "@/types";
import { useAddReel, useUpdateReel, useDeleteReel, useReorderReels } from "@/hooks/useReels";
import { SortableList } from "@/components/common/SortableList";
import { ImageUpload } from "@/components/common/ImageUpload";
import { VideoUpload } from "@/components/common/VideoUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

const emptyForm = {
  title: "",
  link: "",
  active: true,
};

export function ReelsManager({ section }: { section: HomeSection }) {
  const addReel = useAddReel(section._id);
  const updateReel = useUpdateReel(section._id);
  const deleteReel = useDeleteReel(section._id);
  const reorderReels = useReorderReels(section._id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const reels = [...(section.reels || [])].sort((a, b) => a.order - b.order);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setVideo(null);
    setThumbnail(null);
    setModalOpen(true);
  };

  const openEdit = (reel: Reel) => {
    setEditing(reel);
    setForm({ title: reel.title || "", link: reel.link || "", active: reel.active });
    setVideo(null);
    setThumbnail(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !video) return;

    const values = { ...form, video: video || undefined, thumbnail: thumbnail || undefined };

    if (editing) {
      updateReel.mutate({ reelId: editing._id, values }, { onSuccess: closeModal });
    } else {
      addReel.mutate(values, { onSuccess: closeModal });
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Reels ({reels.length})</p>
        <Button type="button" size="sm" onClick={openAdd}>
          <Plus size={14} /> Add Reel
        </Button>
      </div>

      {reels.length === 0 ? (
        <EmptyState icon={<Play size={18} />} title="No reels yet" />
      ) : (
        <SortableList
          items={reels}
          onReorder={(order) => reorderReels.mutate(order)}
          renderItem={(reel, dragHandle) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3">
              <div className="flex items-center gap-3">
                {dragHandle}
                <div className="flex h-12 w-16 flex-none items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                  {reel.thumbnail?.url ? (
                    <img src={reel.thumbnail.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Play size={16} className="text-muted" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{reel.title || "Untitled reel"}</p>
                  <p className="text-xs text-muted">order {reel.order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={reel.active ? "success" : "neutral"}>{reel.active ? "Active" : "Inactive"}</Badge>
                <button type="button" onClick={() => openEdit(reel)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => setDeleteId(reel._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit reel" : "Add reel"}>
        <form onSubmit={submit} className="space-y-4">
          <VideoUpload value={video} onChange={setVideo} existingUrl={editing?.video?.url} label="Video (required)" />
          <ImageUpload
            value={thumbnail}
            onChange={(v) => setThumbnail(v as File | null)}
            existingUrl={editing?.thumbnail?.url}
            label="Thumbnail (optional)"
          />
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Link" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            Active
          </label>
          {!editing && !video && <p className="text-xs text-danger">Video is required.</p>}
          <Button type="submit" className="w-full" isLoading={addReel.isPending || updateReel.isPending}>
            {editing ? "Save reel" : "Add reel"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteReel.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete reel"
        confirmLabel="Delete"
        danger
        isLoading={deleteReel.isPending}
      />
    </div>
  );
}
