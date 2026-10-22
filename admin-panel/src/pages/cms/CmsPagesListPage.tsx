import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, FileText, HelpCircle, LayoutTemplate } from "lucide-react";
import { usePages, useDeletePage, useSetPageStatus } from "@/hooks/useCms";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";

export function CmsPagesListPage() {
  const { data: pages, isLoading } = usePages();
  const deletePage = useDeletePage();
  const setStatus = useSetPageStatus();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="CMS pages"
        description="About, Contact, Privacy Policy, Terms, Refund Policy, Shipping Policy, and any other static page."
        action={
          <div className="flex gap-2">
            <Link to="/cms/faqs"><Button variant="outline"><HelpCircle size={15} /> FAQs</Button></Link>
            <Link to="/cms/home-sections"><Button variant="outline"><LayoutTemplate size={15} /> Home sections</Button></Link>
            <Link to="/cms/pages/new"><Button><Plus size={15} /> Add page</Button></Link>
          </div>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !pages || pages.length === 0 ? (
          <EmptyState icon={<FileText size={18} />} title="No pages yet" description="Create About, Privacy Policy, Terms & Conditions, and other pages here." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Title</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {pages.map((p) => (
                <Tr key={p._id}>
                  <Td className="text-sm font-medium">{p.title}</Td>
                  <Td className="font-mono text-xs text-muted">/{p.slug}</Td>
                  <Td>
                    <Select value={p.status} onChange={(e) => setStatus.mutate({ id: p._id, status: e.target.value })} className="!w-32 !py-1 !text-xs">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished</option>
                    </Select>
                  </Td>
                  <Td className="text-sm text-muted">{formatDate(p.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Link to="/cms/pages/$pageId/edit" params={{ pageId: p._id }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(p._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deletePage.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete page"
        confirmLabel="Delete"
        danger
        isLoading={deletePage.isPending}
      />
    </div>
  );
}
