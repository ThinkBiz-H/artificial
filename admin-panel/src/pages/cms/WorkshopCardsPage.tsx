import { useState } from "react";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import {
  useWorkshopCards,
  useCreateWorkshopCard,
  useUpdateWorkshopCard,
  useDeleteWorkshopCard,
  useReorderWorkshopCards,
} from "@/hooks/useWorkshopCards";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { SortableList } from "@/components/common/SortableList";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { WorkshopCard } from "@/types";

const emptyForm = {
  heading: "",
  shortDescription: "",
  isActive: true,
};

export function WorkshopCardsPage() {
  const { data: cards, isLoading } = useWorkshopCards();
  const createCard = useCreateWorkshopCard();
  const updateCard = useUpdateWorkshopCard();
  const deleteCard = useDeleteWorkshopCard();
  const reorderCards = useReorderWorkshopCards();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkshopCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);

  const sorted = [...(cards || [])].sort((a, b) => a.order - b.order);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (card: WorkshopCard) => {
    setEditing(card);
    setForm({
      heading: card.heading,
      shortDescription: card.shortDescription || "",
      isActive: card.isActive,
    });
    setImage(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !image) return;

    const values = { ...form, image: image || undefined };

    if (editing) {
      updateCard.mutate({ id: editing._id, values }, { onSuccess: closeModal });
    } else {
      createCard.mutate(values, { onSuccess: closeModal });
    }
  };

  return (
    <div>
      <PageHeader
        title="Workshop"
        description={cards ? `${cards.length} cards` : undefined}
        action={<Button onClick={openAdd}><Plus size={15} /> Add Workshop Card</Button>}
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={<Wrench size={18} />} title="No workshop cards yet" />
        ) : (
          <div className="p-4">
            <SortableList
              items={sorted}
              onReorder={(order) => reorderCards.mutate(order)}
              renderItem={(card, dragHandle) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3">
                  <div className="flex items-center gap-3">
                    {dragHandle}
                    <div className="h-12 w-16 flex-none overflow-hidden rounded-lg border border-border">
                      <img src={card.image.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{card.heading}</p>
                      {card.shortDescription && (
                        <p className="max-w-md truncate text-xs text-muted">{card.shortDescription}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={card.isActive ? "success" : "neutral"}>{card.isActive ? "Active" : "Inactive"}</Badge>
                    <button onClick={() => openEdit(card)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(card._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit workshop card" : "Add workshop card"}>
        <form onSubmit={submit} className="space-y-4">
          <ImageUpload
            value={image}
            onChange={(v) => setImage(v as File | null)}
            existingUrl={editing?.image?.url}
            label="Image (required)"
          />
          <Input label="Heading" required value={form.heading} onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))} />
          <Textarea
            label="Short description"
            rows={3}
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          {!editing && !image && <p className="text-xs text-danger">Image is required.</p>}
          <Button type="submit" className="w-full" isLoading={createCard.isPending || updateCard.isPending}>
            {editing ? "Save card" : "Add card"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCard.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete workshop card"
        confirmLabel="Delete"
        danger
        isLoading={deleteCard.isPending}
      />
    </div>
  );
}
