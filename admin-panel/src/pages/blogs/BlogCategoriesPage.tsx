import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useBlogCategories, useCreateBlogCategory, useUpdateBlogCategory, useDeleteBlogCategory } from "@/hooks/useBlog";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { BlogCategory } from "@/types";

const emptySeo = { title: "", description: "", keywords: "", canonicalUrl: "", ogImage: "" };
const emptyForm = { name: "", description: "", status: "active", seo: emptySeo };

export function BlogCategoriesPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useBlogCategories();
  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: BlogCategory) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", status: c.status, seo: { ...emptySeo, ...c.seo } });
    setModalOpen(true);
  };
  const setSeo = (key: keyof typeof emptySeo, value: string) => setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateCategory.mutate({ id: editing._id, values: form }, { onSuccess: () => setModalOpen(false) });
    else createCategory.mutate(form, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader
        title="Blog categories"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/blogs" })}><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openAdd}><Plus size={15} /> Add category</Button>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !categories || categories.length === 0 ? (
          <EmptyState title="No blog categories yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c._id}>
                  <Td className="text-sm font-medium">{c.name}</Td>
                  <Td><Badge>{c.status}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(c._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
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
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">SEO</p>
            <Input label="SEO title" value={form.seo.title} onChange={(e) => setSeo("title", e.target.value)} />
            <Textarea label="SEO description" rows={2} value={form.seo.description} onChange={(e) => setSeo("description", e.target.value)} />
            <Input label="SEO keywords" placeholder="bridal, styling tips" value={form.seo.keywords} onChange={(e) => setSeo("keywords", e.target.value)} />
            <Input label="Canonical URL" placeholder="https://…" value={form.seo.canonicalUrl} onChange={(e) => setSeo("canonicalUrl", e.target.value)} />
            <Input label="OG image URL" placeholder="https://…" value={form.seo.ogImage} onChange={(e) => setSeo("ogImage", e.target.value)} />
          </div>
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
        confirmLabel="Delete"
        danger
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
