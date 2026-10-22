import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Pencil, Trash2, LayoutTemplate, X, Play, Images } from "lucide-react";
import { useHomeSections, useCreateHomeSection, useUpdateHomeSection, useDeleteHomeSection } from "@/hooks/useCms";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { ConfigItemsEditor, type ConfigItem } from "@/components/cms/ConfigItemsEditor";
import { HeroSlidesManager } from "@/components/cms/HeroSlidesManager";
import { ReelsManager } from "@/components/cms/ReelsManager";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { HomeSection } from "@/types";

const SECTION_TYPES: { value: string; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "about-preview", label: "Brand Story" },
  { value: "why-choose", label: "Why Choose Swastikala" },
  { value: "process", label: "Handmade Process" },
  { value: "lifestyle", label: "Lifestyle Banner" },
  { value: "craftsmanship", label: "Our Craftsmanship (row)" },
  { value: "gallery-showcase", label: "Premium Gallery" },
  { value: "customer-experience", label: "Customer Experience" },
  { value: "video-banner", label: "Video Banner" },
  { value: "instagram-gallery", label: "Instagram Gallery" },
  { value: "stats", label: "Stats" },
  { value: "cta", label: "CTA" },
  { value: "reels", label: "Reels" },
];

const HAS_IMAGE = new Set(["hero", "about-preview", "craftsmanship", "lifestyle", "video-banner", "cta"]);
const HAS_GALLERY = new Set(["gallery-showcase", "instagram-gallery"]);
const HAS_ITEMS = new Set(["why-choose", "process", "customer-experience", "stats"]);
const HAS_SECONDARY_BUTTON = new Set(["hero", "cta"]);
const HAS_BUTTON = new Set(["hero", "about-preview", "lifestyle", "cta"]);
const HAS_VIDEOS = new Set(["reels", "video-banner"]);

const DEFAULT_ITEMS: Record<string, ConfigItem[]> = {
  "why-choose": [
    { icon: "Hand", title: "Handcrafted", description: "Every piece is finished by skilled artisans." },
    { icon: "Gem", title: "Premium Plating", description: "Rich gold, rose gold and silver tones that stay bright." },
    { icon: "ShieldCheck", title: "Skin Friendly", description: "Nickel-safe finishes made for all-day comfort." },
    { icon: "Sparkles", title: "Designer Detailing", description: "Kundan, polki and stone work with fine detailing." },
    { icon: "Package", title: "Gift-Ready Packing", description: "Every order arrives in a protective jewellery box." },
    { icon: "Heart", title: "Made to Be Loved", description: "Designs for weddings, festivals and every day." },
  ],
  process: [
    { icon: "PenTool", title: "Design", description: "Every piece begins as a considered sketch." },
    { icon: "Hand", title: "Crafting", description: "Metal is shaped and stones are set by hand." },
    { icon: "Gem", title: "Plating", description: "A precise plating layer gives each piece its tone." },
    { icon: "Sparkles", title: "Finishing", description: "Polished and quality-checked for a flawless shine." },
    { icon: "Package", title: "Packing", description: "Carefully wrapped and boxed for safe delivery." },
  ],
  "customer-experience": [
    { icon: "PackageCheck", title: "Packaging", description: "Cushioned, custom crating for every fragile piece." },
    { icon: "BadgeCheck", title: "Quality", description: "Each piece inspected by hand before it ships." },
    { icon: "Truck", title: "Shipping", description: "Insured, tracked delivery to your doorstep." },
    { icon: "Settings2", title: "Customization", description: "Sizes, tones and finishes tailored on request." },
    { icon: "SprayCan", title: "Care", description: "Simple care guidance included with every order." },
  ],
  // "stats" intentionally has no defaults — real figures only, entered by the admin.
};

const emptyForm = {
  type: "hero",
  title: "",
  subtitle: "",
  content: "",
  sortOrder: 0,
  isActive: true,
  buttonLabel: "",
  buttonLink: "",
  secondaryButtonLabel: "",
  secondaryButtonLink: "",
};

export function HomeSectionsPage() {
  const navigate = useNavigate();
  const { data: sections, isLoading } = useHomeSections();
  const createSection = useCreateHomeSection();
  const updateSection = useUpdateHomeSection();
  const deleteSection = useDeleteHomeSection();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [videos, setVideos] = useState<File[]>([]);
  const [gallery, setGallery] = useState<File[]>([]);
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [addType, setAddType] = useState("hero");

  const resetLocalFiles = () => {
    setImage(null);
    setVideos([]);
    setGallery([]);
  };

  const openAdd = (sectionType: string) => {
    setEditing(null);
    setForm({ ...emptyForm, type: sectionType });
    resetLocalFiles();
    setItems(DEFAULT_ITEMS[sectionType] || []);
    setModalOpen(true);
  };

  const openEdit = (s: HomeSection) => {
    setEditing(s);
    const config = (s.config || {}) as { items?: ConfigItem[]; secondaryButton?: { label?: string; link?: string } };
    setForm({
      type: s.type,
      title: s.title || "",
      subtitle: s.subtitle || "",
      content: s.content || "",
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      buttonLabel: s.button?.label || "",
      buttonLink: s.button?.link || "",
      secondaryButtonLabel: config.secondaryButton?.label || "",
      secondaryButtonLink: config.secondaryButton?.link || "",
    });
    resetLocalFiles();
    setItems(config.items || DEFAULT_ITEMS[s.type] || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetLocalFiles();
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos([...videos, ...Array.from(e.target.files)]);
    }
  };

  const handleVideoRemove = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    let config: Record<string, unknown> | undefined;
    if (HAS_ITEMS.has(form.type)) {
      config = { ...(config || {}), items };
    }
    if (HAS_SECONDARY_BUTTON.has(form.type) && (form.secondaryButtonLabel || form.secondaryButtonLink)) {
      config = { ...(config || {}), secondaryButton: { label: form.secondaryButtonLabel, link: form.secondaryButtonLink } };
    }

    const values = {
      type: form.type,
      title: form.title || undefined,
      subtitle: form.subtitle || undefined,
      content: form.content || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      button:
        HAS_BUTTON.has(form.type) && (form.buttonLabel || form.buttonLink)
          ? { label: form.buttonLabel, link: form.buttonLink }
          : undefined,
      config,
      image: image || undefined,
      videos: videos.length > 0 ? videos : undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
    };
    if (editing) updateSection.mutate({ id: editing._id, values }, { onSuccess: closeModal });
    else createSection.mutate(values, { onSuccess: closeModal });
  };

  return (
    <div>
      <PageHeader
        title="Home page sections"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/cms/pages" })}><ArrowLeft size={14} /> Back</Button>
            <Select value={addType} onChange={(e) => setAddType(e.target.value)} className="w-44">
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            <Button onClick={() => openAdd(addType)}><Plus size={15} /> Add section</Button>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !sections || sections.length === 0 ? (
          <EmptyState icon={<LayoutTemplate size={18} />} title="No home sections yet" />
        ) : (
          <div className="divide-y divide-border">
            {sections.map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  {s.image?.url && <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-border"><img src={s.image.url} alt="" className="h-full w-full object-cover" /></div>}
                  {!s.image?.url && s.slides?.[0]?.desktopImage?.url && <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-border"><img src={s.slides[0].desktopImage.url} alt="" className="h-full w-full object-cover" /></div>}
                  {!s.image?.url && !s.slides?.length && s.reels?.[0]?.thumbnail?.url && <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-border"><img src={s.reels[0].thumbnail.url} alt="" className="h-full w-full object-cover" /></div>}
                  {!s.image?.url && !s.slides?.length && !s.reels?.[0]?.thumbnail?.url && s.gallery?.length && <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-border"><img src={s.gallery[0].url} alt="" className="h-full w-full object-cover" /></div>}
                  {!s.image?.url && !s.slides?.length && !s.reels?.[0]?.thumbnail?.url && !s.gallery?.length && (s.videos?.length || s.reels?.length) && <div className="h-12 w-12 flex-none flex items-center justify-center rounded-lg border border-border bg-surface"><Play size={18} className="text-muted" /></div>}
                  {!s.image?.url && !s.slides?.length && !s.reels?.length && !s.gallery?.length && !s.videos?.length && <div className="h-12 w-12 flex-none flex items-center justify-center rounded-lg border border-border bg-surface"><Images size={18} className="text-muted" /></div>}
                  <div>
                    <p className="text-sm font-medium text-ink">{s.title || s.type}</p>
                    <p className="text-xs text-muted">
                      {s.type} · order {s.sortOrder}
                      {s.slides?.length ? ` · ${s.slides.length} slide(s)` : ""}
                      {s.reels?.length ? ` · ${s.reels.length} reel(s)` : ""}
                      {s.videos?.length ? ` · ${s.videos.length} video(s)` : ""}
                      {s.gallery?.length ? ` · ${s.gallery.length} image(s)` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  <button onClick={() => openEdit(s)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(s._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit section" : "Add section"}>
        <form onSubmit={submit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {!editing && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <p className="text-xs text-blue-900">
                <strong>Type:</strong> <code className="bg-white px-2 py-1 rounded">{form.type}</code>
              </p>
            </div>
          )}
          {editing && <Input label="Type" disabled value={form.type} />}

          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />

          {!HAS_VIDEOS.has(form.type) && (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Description</label>
              <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} placeholder="Enter description..." />
            </div>
          )}

          {HAS_BUTTON.has(form.type) && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Button label" value={form.buttonLabel} onChange={(e) => setForm((f) => ({ ...f, buttonLabel: e.target.value }))} />
              <Input label="Button link" value={form.buttonLink} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} />
            </div>
          )}

          {HAS_SECONDARY_BUTTON.has(form.type) && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Secondary button label" value={form.secondaryButtonLabel} onChange={(e) => setForm((f) => ({ ...f, secondaryButtonLabel: e.target.value }))} />
              <Input label="Secondary button link" value={form.secondaryButtonLink} onChange={(e) => setForm((f) => ({ ...f, secondaryButtonLink: e.target.value }))} />
            </div>
          )}

          {form.type === "hero" ? (
            editing ? (
              <HeroSlidesManager section={editing} />
            ) : (
              <p className="rounded-lg border border-dashed border-border-strong p-3 text-xs text-muted">
                Save this section first, then reopen it to add hero slides.
              </p>
            )
          ) : (
            HAS_IMAGE.has(form.type) && (
              <ImageUpload
                value={image}
                onChange={(v) => setImage(v as File | null)}
                existingUrl={editing?.image?.url}
                label={
                  form.type === "cta"
                    ? "Background Image"
                    : form.type === "video-banner"
                      ? "Poster / Fallback Image"
                      : "Image"
                }
              />
            )
          )}

          {HAS_GALLERY.has(form.type) && (
            <div>
              {editing?.gallery && editing.gallery.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-xs font-medium text-muted">Current gallery ({editing.gallery.length} image(s)) — uploading new images below replaces all of these</p>
                  <div className="flex flex-wrap gap-2">
                    {editing.gallery.map((g) => (
                      <div key={g.publicId || g.url} className="h-16 w-16 overflow-hidden rounded-lg border border-border">
                        <img src={g.url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ImageUpload
                value={gallery}
                onChange={(v) => setGallery(Array.isArray(v) ? v : v ? [v] : [])}
                label="Gallery Images (replaces all existing when uploaded)"
                multiple
              />
            </div>
          )}

          {HAS_ITEMS.has(form.type) && (
            <ConfigItemsEditor
              label={
                form.type === "process"
                  ? "Process steps"
                  : form.type === "stats"
                    ? "Stats"
                    : "Cards"
              }
              items={items}
              onChange={setItems}
              numeric={form.type === "stats"}
            />
          )}

          {form.type === "reels" ? (
            editing ? (
              <ReelsManager section={editing} />
            ) : (
              <p className="rounded-lg border border-dashed border-border-strong p-3 text-xs text-muted">
                Save this section first, then reopen it to add reels.
              </p>
            )
          ) : (
            HAS_VIDEOS.has(form.type) && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Videos</label>
                <input type="file" multiple accept="video/*" onChange={handleVideoAdd} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                {videos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {videos.map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-surface rounded border border-border">
                        <span className="text-sm text-ink">{v.name}</span>
                        <button type="button" onClick={() => handleVideoRemove(i)} className="flex h-6 w-6 items-center justify-center rounded text-danger hover:bg-danger-bg"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {editing?.videos && editing.videos.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">Existing videos: {editing.videos.length}</p>
                  </div>
                )}
              </div>
            )
          )}

          <Input label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <Button type="submit" className="w-full" isLoading={createSection.isPending || updateSection.isPending}>
            Save section
          </Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteSection.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} title="Delete section" confirmLabel="Delete" danger isLoading={deleteSection.isPending} />
    </div>
  );
}
