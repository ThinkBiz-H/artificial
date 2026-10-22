import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { useFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from "@/hooks/useCms";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import type { Faq } from "@/types";

const emptyForm = { question: "", answer: "", category: "", sortOrder: 0, isActive: true };

export function FaqsPage() {
  const navigate = useNavigate();
  const { data: faqs, isLoading } = useFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (f: Faq) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category || "", sortOrder: f.sortOrder, isActive: f.isActive }); setModalOpen(true); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateFaq.mutate({ id: editing._id, values: form }, { onSuccess: () => setModalOpen(false) });
    else createFaq.mutate(form, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/cms/pages" })}><ArrowLeft size={14} /> Back</Button>
            <Button onClick={openAdd}><Plus size={15} /> Add FAQ</Button>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !faqs || faqs.length === 0 ? (
          <EmptyState icon={<HelpCircle size={18} />} title="No FAQs yet" />
        ) : (
          <div className="divide-y divide-border">
            {faqs.map((f) => (
              <div key={f._id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-ink">{f.question}</p>
                  <p className="mt-1 text-sm text-muted">{f.answer}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={f.isActive ? "success" : "neutral"}>{f.isActive ? "Active" : "Inactive"}</Badge>
                    {f.category && <span className="text-xs text-muted">{f.category}</span>}
                  </div>
                </div>
                <div className="flex flex-none gap-1">
                  <button onClick={() => openEdit(f)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(f._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit FAQ" : "Add FAQ"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Question" required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
          <Textarea label="Answer" rows={4} required value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
          <Input label="Category (optional)" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <Input label="Sort order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <Button type="submit" className="w-full" isLoading={createFaq.isPending || updateFaq.isPending}>
            Save FAQ
          </Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteFaq.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} title="Delete FAQ" confirmLabel="Delete" danger isLoading={deleteFaq.isPending} />
    </div>
  );
}
