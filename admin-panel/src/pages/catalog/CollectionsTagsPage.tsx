import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { apiClient } from "@/api/client";
import type { ApiEnvelope } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductPicker, type PickedProduct } from "@/components/products/ProductPicker";
import { cn, getErrorMessage } from "@/lib/utils";

type Kind = "collections" | "tags" | "occasions";
type Term = { name: string; count: number; published: number };

const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "collections", label: "Collections", hint: "Shown as Premium collection rails on the homepage and as a filter." },
  { id: "occasions", label: "Occasions", hint: "Festival, Wedding, Office… — homepage occasion rails and a filter." },
  { id: "tags", label: "Tags", hint: "Search keywords and internal grouping." },
];

const termsApi = {
  list: (kind: Kind) => apiClient.get<ApiEnvelope<{ terms: Term[] }>>(`/admin/catalog-terms/${kind}`).then((r) => r.data),
  rename: (kind: Kind, from: string, to: string) => apiClient.patch<ApiEnvelope<{ products: number }>>(`/admin/catalog-terms/${kind}`, { from, to }).then((r) => r.data),
  remove: (kind: Kind, name: string) => apiClient.delete<ApiEnvelope<{ products: number }>>(`/admin/catalog-terms/${kind}/${encodeURIComponent(name)}`).then((r) => r.data),
  assign: (kind: Kind, name: string, productIds: string[]) =>
    apiClient.post<ApiEnvelope<{ products: number }>>(`/admin/catalog-terms/${kind}/assign`, { name, productIds }).then((r) => r.data),
};

/** Collections, occasions and tags across the catalogue — rename, merge, delete, assign. */
export function CollectionsTagsPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("collections");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [picked, setPicked] = useState<PickedProduct[]>([]);
  const { data: terms, isLoading } = useQuery({ queryKey: ["catalog-terms", kind], queryFn: () => termsApi.list(kind), select: (r) => r.data.terms });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["catalog-terms"] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const rename = useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => termsApi.rename(kind, from, to),
    onSuccess: (r) => {
      toast.success(`Renamed on ${r.data.products} product(s)`);
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (name: string) => termsApi.remove(kind, name),
    onSuccess: (r) => {
      toast.success(`Removed from ${r.data.products} product(s)`);
      setDeleting(null);
      refresh();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const assign = useMutation({
    mutationFn: () => termsApi.assign(kind, newName.trim(), picked.map((p) => p._id)),
    onSuccess: (r) => {
      toast.success(`Added to ${r.data.products} product(s)`);
      setNewName("");
      setPicked([]);
      refresh();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const meta = KINDS.find((k) => k.id === kind)!;

  return (
    <div>
      <PageHeader title="Collections & tags" description="Group designs for the homepage, filters and search — changes apply to every product at once." />

      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-white p-1">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => {
              setKind(k.id);
              setEditing(null);
            }}
            className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium", kind === k.id ? "bg-brand text-white" : "text-muted hover:bg-surface hover:text-ink")}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title={meta.label} description={meta.hint} />
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !terms?.length ? (
            <EmptyState icon={<Tags size={18} />} title={`No ${meta.label.toLowerCase()} yet`} description="Create one on the right, or set it on a product." />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Name</Th>
                  <Th className="text-right">Products</Th>
                  <Th className="text-right">Published</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {terms.map((t) => (
                  <Tr key={t.name}>
                    <Td>
                      {editing === t.name ? (
                        <form
                          className="flex items-center gap-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (draft.trim()) rename.mutate({ from: t.name, to: draft.trim() });
                          }}
                        >
                          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className="h-8 flex-1 rounded-md border border-border px-2 text-sm" aria-label="New name" />
                          <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-md text-success hover:bg-success-bg" aria-label="Save">
                            <Check size={14} />
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface" aria-label="Cancel">
                            <X size={14} />
                          </button>
                        </form>
                      ) : (
                        <span className="text-sm font-medium text-ink">{t.name}</span>
                      )}
                    </Td>
                    <Td className="text-right font-mono text-sm">{t.count}</Td>
                    <Td className="text-right font-mono text-sm text-muted">{t.published}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(t.name);
                            setDraft(t.name);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                          aria-label={`Rename ${t.name}`}
                          title="Rename (or merge into an existing name)"
                        >
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setDeleting(t.name)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label={`Delete ${t.name}`}>
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

        <Card>
          <CardHeader title={`Add to products`} description={`Create a ${meta.label.slice(0, -1).toLowerCase()} or add an existing one to more designs.`} />
          <CardBody className="space-y-4">
            <Input label="Name" placeholder={kind === "collections" ? "e.g. Bridal 2026" : kind === "occasions" ? "e.g. Festival" : "e.g. lightweight"} value={newName} onChange={(e) => setNewName(e.target.value)} list="term-names" />
            <datalist id="term-names">
              {(terms ?? []).map((t) => (
                <option key={t.name} value={t.name} />
              ))}
            </datalist>
            <ProductPicker label="Products" value={picked} onChange={setPicked} max={100} />
            <Button className="w-full" disabled={!newName.trim() || !picked.length} isLoading={assign.isPending} onClick={() => assign.mutate()}>
              <Plus size={14} /> Add to {picked.length || ""} product{picked.length === 1 ? "" : "s"}
            </Button>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        title={`Delete “${deleting}”`}
        description="It is removed from every product. The products themselves are not changed otherwise."
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
      />
    </div>
  );
}
