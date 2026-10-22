import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { useCategoryTree, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { Category } from "@/types";

interface FlatRow { category: Category; depth: number }

function flatten(categories: Category[], depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  categories.forEach((c) => {
    rows.push({ category: c, depth });
    if (c.children && c.children.length) rows.push(...flatten(c.children, depth + 1));
  });
  return rows;
}

const emptyForm = { name: "", shortTitle: "", description: "", status: "active", sortOrder: 0, parent: "", showInHeader: true };

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);

  const rows = categories ? flatten(categories) : [];

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImage(null); setModalOpen(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      shortTitle: c.shortTitle || "",
      description: c.description || "",
      status: c.status,
      sortOrder: c.sortOrder,
      parent: c.parent || "",
      showInHeader: c.showInHeader !== false,
    });
    setImage(null);
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = { ...form, parent: form.parent || null, image: image || undefined };
    if (editing) updateCategory.mutate({ id: editing._id, values }, { onSuccess: () => setModalOpen(false) });
    else createCategory.mutate(values as any, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader title="Categories" description={categories ? `${rows.length} categories` : undefined} action={<Button onClick={openAdd}><Plus size={15} /> Add category</Button>} />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<FolderTree size={18} />} title="No categories yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Sort order</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {rows.map(({ category, depth }) => (
                <Tr key={category._id}>
                  <Td>
                    <div className="flex items-center gap-2.5" style={{ paddingLeft: depth * 20 }}>
                      <div className="h-8 w-8 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                        {category.image?.url && <img src={category.image.url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="text-sm font-medium text-ink">{category.name}</span>
                    </div>
                  </Td>
                  <Td><Badge>{category.status}</Badge></Td>
                  <Td className="text-sm text-muted">{category.sortOrder}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(category)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(category._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit category" : "Add category"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Short title" value={form.shortTitle} onChange={(e) => setForm((f) => ({ ...f, shortTitle: e.target.value }))} />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Select label="Parent category" value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}>
            <option value="">None (top-level)</option>
            {rows.filter((r) => r.category._id !== editing?._id).map(({ category }) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Input label="Sort order (menu order)" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showInHeader} onChange={(e) => setForm((f) => ({ ...f, showInHeader: e.target.checked }))} />
            Show in header menu
          </label>
          <ImageUpload value={image} onChange={(v) => setImage(v as File | null)} existingUrl={editing?.image?.url} label="Image" />
          <Button type="submit" className="w-full" isLoading={createCategory.isPending || updateCategory.isPending}>
            Save category
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete category"
        description="Products in this category will not be deleted, but will lose their category assignment."
        confirmLabel="Delete"
        danger
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
