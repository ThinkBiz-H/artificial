import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Image as ImageIcon } from "lucide-react";
import {
  useCategoryBanners,
  useCreateCategoryBanner,
  useUpdateCategoryBanner,
  useDeleteCategoryBanner,
} from "@/hooks/useCategoryBanners";
import { useCategoryTree } from "@/hooks/useCategories";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { CategoryTreeSelect } from "@/components/common/CategoryTreeSelect";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { CategoryBanner } from "@/types";

const emptyForm = {
  name: "",
  title: "",
  subtitle: "",
  description: "",
  buttonText: "",
  buttonLink: "",
  categories: [] as string[],
  priority: 0,
  status: "active",
  startDate: "",
  endDate: "",
};

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function CategoryBannersPage() {
  const { data: banners, isLoading } = useCategoryBanners();
  const { data: categoryTree } = useCategoryTree();
  const createBanner = useCreateCategoryBanner();
  const updateBanner = useUpdateCategoryBanner();
  const deleteBanner = useDeleteCategoryBanner();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryBanner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<CategoryBanner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDesktopImage(null);
    setMobileImage(null);
    setModalOpen(true);
  };

  const openEdit = (b: CategoryBanner) => {
    setEditing(b);
    setForm({
      name: b.name,
      title: b.title || "",
      subtitle: b.subtitle || "",
      description: b.description || "",
      buttonText: b.buttonText || "",
      buttonLink: b.buttonLink || "",
      categories: (b.categories || []).filter(Boolean).map((c) => (typeof c === "object" ? c._id : c)),
      priority: b.priority,
      status: b.status,
      startDate: toDateInput(b.startDate),
      endDate: toDateInput(b.endDate),
    });
    setDesktopImage(null);
    setMobileImage(null);
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      ...form,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      desktopImage: desktopImage || undefined,
      mobileImage: mobileImage || undefined,
    };
    if (editing) updateBanner.mutate({ id: editing._id, values }, { onSuccess: () => setModalOpen(false) });
    else createBanner.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader
        title="Category Banners"
        description={banners ? `${banners.length} banners` : undefined}
        action={
          <Button onClick={openAdd}>
            <Plus size={15} /> Add banner
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !banners || banners.length === 0 ? (
          <EmptyState icon={<ImageIcon size={18} />} title="No category banners yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Image</Th>
                <Th>Banner Name</Th>
                <Th>Selected Categories</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {banners.map((banner) => (
                <Tr key={banner._id}>
                  <Td>
                    <div className="h-10 w-16 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                      {banner.desktopImage?.url && (
                        <img src={banner.desktopImage.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </Td>
                  <Td className="text-sm font-medium text-ink">{banner.name}</Td>
                  <Td className="max-w-xs text-sm text-muted">
                    {(banner.categories || [])
                      .filter(Boolean)
                      .map((c) => (typeof c === "object" ? c.name : c))
                      .join(", ") || "-"}
                  </Td>
                  <Td className="text-sm text-muted">{banner.priority}</Td>
                  <Td>
                    <Badge>{banner.status}</Badge>
                  </Td>
                  <Td className="text-sm text-muted">{new Date(banner.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setPreviewBanner(banner)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                        aria-label="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(banner)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(banner._id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit banner" : "Add banner"}
        className="max-w-2xl"
      >
        <form onSubmit={submit} className="space-y-4">
          <Input label="Banner Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

          <div className="grid grid-cols-2 gap-3">
            <ImageUpload
              label="Desktop Banner Image"
              value={desktopImage}
              onChange={(v) => setDesktopImage(v as File | null)}
              existingUrl={editing?.desktopImage?.url}
            />
            <ImageUpload
              label="Mobile Banner Image"
              value={mobileImage}
              onChange={(v) => setMobileImage(v as File | null)}
              existingUrl={editing?.mobileImage?.url}
            />
          </div>

          <CategoryTreeSelect
            label="Select Categories"
            categories={categoryTree || []}
            selected={form.categories}
            onChange={(ids) => setForm((f) => ({ ...f, categories: ids }))}
          />

          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Button Text" value={form.buttonText} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} />
            <Input label="Button Link" value={form.buttonLink} onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Priority"
              type="number"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
              hint="Lower number = higher priority"
            />
            <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>

          <Button type="submit" className="w-full" isLoading={createBanner.isPending || updateBanner.isPending}>
            Save banner
          </Button>
        </form>
      </Modal>

      <Modal open={!!previewBanner} onClose={() => setPreviewBanner(null)} title="Banner preview" className="max-w-2xl">
        {previewBanner && (
          <div className="overflow-hidden rounded-xl border border-border">
            {previewBanner.desktopImage?.url && (
              <img src={previewBanner.desktopImage.url} alt="" className="w-full object-cover" />
            )}
            <div className="space-y-2 p-5 text-center">
              {previewBanner.title && <h3 className="text-xl font-semibold text-ink">{previewBanner.title}</h3>}
              {previewBanner.subtitle && <p className="text-sm text-muted">{previewBanner.subtitle}</p>}
              {previewBanner.description && <p className="text-sm text-muted">{previewBanner.description}</p>}
              {previewBanner.buttonText && (
                <div className="pt-2">
                  <Button type="button">{previewBanner.buttonText}</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteBanner.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete banner"
        description="This banner will no longer appear on any product pages."
        confirmLabel="Delete"
        danger
        isLoading={deleteBanner.isPending}
      />
    </div>
  );
}
