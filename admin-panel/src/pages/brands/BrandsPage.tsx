import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from "@/hooks/useBrands";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { Brand } from "@/types";

const emptyForm = { name: "", status: "active" };

export function BrandsPage() {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState<File | null>(null);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setLogo(null); setModalOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, status: b.status }); setLogo(null); setModalOpen(true); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = { ...form, logo: logo || undefined };
    if (editing) updateBrand.mutate({ id: editing._id, values }, { onSuccess: () => setModalOpen(false) });
    else createBrand.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader title="Brands" description={brands ? `${brands.length} brands` : undefined} action={<Button onClick={openAdd}><Plus size={15} /> Add brand</Button>} />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !brands || brands.length === 0 ? (
          <EmptyState icon={<Tag size={18} />} title="No brands yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Brand</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {brands.map((b) => (
                <Tr key={b._id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                        {b.logo?.url && <img src={b.logo.url} alt="" className="h-full w-full object-contain" />}
                      </div>
                      <span className="text-sm font-medium text-ink">{b.name}</span>
                    </div>
                  </Td>
                  <Td><Badge>{b.status}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(b)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(b._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit brand" : "Add brand"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <ImageUpload value={logo} onChange={(v) => setLogo(v as File | null)} existingUrl={editing?.logo?.url} label="Logo" />
          <Button type="submit" className="w-full" isLoading={createBrand.isPending || updateBrand.isPending}>
            Save brand
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteBrand.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete brand"
        confirmLabel="Delete"
        danger
        isLoading={deleteBrand.isPending}
      />
    </div>
  );
}
