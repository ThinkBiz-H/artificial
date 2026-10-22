import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Reorder } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Megaphone } from "lucide-react";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useReorderAnnouncements,
  useDeleteAnnouncement,
} from "@/hooks/useCms";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { Announcement } from "@/types";

const emptyForm = { text: "", scrollSpeed: 40, repeat: true, isActive: true };

export function AnnouncementBarPage() {
  const navigate = useNavigate();
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const reorderAnnouncements = useReorderAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [items, setItems] = useState<Announcement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Keep the locally-reorderable list in sync with the server, but don't
  // clobber an in-flight drag with a stale refetch.
  useEffect(() => {
    if (announcements) setItems(announcements);
  }, [announcements]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ text: a.text, scrollSpeed: a.scrollSpeed, repeat: a.repeat, isActive: a.isActive });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateAnnouncement.mutate({ id: editing._id, values: form }, { onSuccess: () => setModalOpen(false) });
    } else {
      createAnnouncement.mutate(form, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleReorder = (newOrder: Announcement[]) => {
    setItems(newOrder);
    reorderAnnouncements.mutate(newOrder.map((a) => a._id));
  };

  return (
    <div>
      <PageHeader
        title="Announcement bar"
        description="The scrolling marquee shown at the very top of the storefront."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/cms/pages" })}>
              <ArrowLeft size={14} /> Back
            </Button>
            <Button onClick={openAdd}>
              <Plus size={15} /> Add announcement
            </Button>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Megaphone size={18} />} title="No announcements yet" description="Add one to start the marquee." />
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="divide-y divide-border">
            {items.map((a) => (
              <Reorder.Item key={a._id} value={a} className="flex items-center justify-between gap-4 bg-white p-4">
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="cursor-grab text-muted active:cursor-grabbing" />
                  <div>
                    <p className="text-sm font-medium text-ink">{a.text}</p>
                    <p className="text-xs text-muted">
                      {a.scrollSpeed}s loop {a.repeat ? "· repeats" : "· plays once"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.isActive ? "success" : "neutral"}>{a.isActive ? "Active" : "Inactive"}</Badge>
                  <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(a._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit announcement" : "Add announcement"}>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Announcement text"
            required
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Complimentary shipping on orders over ₹2,999"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scroll speed (seconds per loop)"
              type="number"
              min={5}
              value={form.scrollSpeed}
              onChange={(e) => setForm((f) => ({ ...f, scrollSpeed: Number(e.target.value) }))}
            />
            <div className="flex flex-col justify-end gap-2 pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.repeat} onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.checked }))} />
                Repeat automatically
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={createAnnouncement.isPending || updateAnnouncement.isPending}>
            Save announcement
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteAnnouncement.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete announcement"
        confirmLabel="Delete"
        danger
        isLoading={deleteAnnouncement.isPending}
      />
    </div>
  );
}
