import { useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { HomeSection, HeroSlide } from "@/types";
import { useAddSlide, useUpdateSlide, useDeleteSlide, useReorderSlides } from "@/hooks/useHeroSlides";
import { SortableList } from "@/components/common/SortableList";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  buttonText: "",
  buttonLink: "",
  active: true,
};

export function HeroSlidesManager({ section }: { section: HomeSection }) {
  const addSlide = useAddSlide(section._id);
  const updateSlide = useUpdateSlide(section._id);
  const deleteSlide = useDeleteSlide(section._id);
  const reorderSlides = useReorderSlides(section._id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);

  const slides = [...(section.slides || [])].sort((a, b) => a.order - b.order);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDesktopImage(null);
    setMobileImage(null);
    setModalOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      active: slide.active,
    });
    setDesktopImage(null);
    setMobileImage(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !desktopImage) return;

    const values = { ...form, desktopImage: desktopImage || undefined, mobileImage: mobileImage || undefined };

    if (editing) {
      updateSlide.mutate({ slideId: editing._id, values }, { onSuccess: closeModal });
    } else {
      addSlide.mutate(values, { onSuccess: closeModal });
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Hero slides ({slides.length})</p>
        <Button type="button" size="sm" onClick={openAdd}>
          <Plus size={14} /> Add Hero Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <EmptyState icon={<ImageIcon size={18} />} title="No slides yet" />
      ) : (
        <SortableList
          items={slides}
          onReorder={(order) => reorderSlides.mutate(order)}
          renderItem={(slide, dragHandle) => (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3">
              <div className="flex items-center gap-3">
                {dragHandle}
                <div className="h-12 w-16 flex-none overflow-hidden rounded-lg border border-border">
                  <img src={slide.desktopImage.url} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{slide.title || "Untitled slide"}</p>
                  <p className="text-xs text-muted">order {slide.order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={slide.active ? "success" : "neutral"}>{slide.active ? "Active" : "Inactive"}</Badge>
                <button type="button" onClick={() => openEdit(slide)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => setDeleteId(slide._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit slide" : "Add hero slide"}>
        <form onSubmit={submit} className="space-y-4">
          <ImageUpload
            value={desktopImage}
            onChange={(v) => setDesktopImage(v as File | null)}
            existingUrl={editing?.desktopImage?.url}
            label="Desktop image (required)"
          />
          <ImageUpload
            value={mobileImage}
            onChange={(v) => setMobileImage(v as File | null)}
            existingUrl={editing?.mobileImage?.url}
            label="Mobile image (optional)"
          />
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Button text" value={form.buttonText} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} />
            <Input label="Button link" value={form.buttonLink} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            Active
          </label>
          {!editing && !desktopImage && <p className="text-xs text-danger">Desktop image is required.</p>}
          <Button type="submit" className="w-full" isLoading={addSlide.isPending || updateSlide.isPending}>
            {editing ? "Save slide" : "Add slide"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteSlide.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete slide"
        confirmLabel="Delete"
        danger
        isLoading={deleteSlide.isPending}
      />
    </div>
  );
}
