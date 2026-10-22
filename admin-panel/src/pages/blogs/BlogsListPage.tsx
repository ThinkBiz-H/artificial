import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Newspaper, Settings2 } from "lucide-react";
import { useBlogList, useDeleteBlog, useSetBlogStatus } from "@/hooks/useBlog";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { blogApi } from "@/api/blog";
import { useQueryClient } from "@tanstack/react-query";
import { BulkActionBar, exportCsv, useSelection } from "@/components/common/BulkActions";


export function BlogsListPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: blogs, isLoading } = useBlogList({ keyword: keyword || undefined, status: status || undefined });
  const qc = useQueryClient();
  const selection = useSelection(blogs?.map((b) => b._id) ?? []);
  const deleteBlog = useDeleteBlog();
  const setStatusMutation = useSetBlogStatus();

  return (
    <div>
      <PageHeader
        title="Blog"
        description={blogs ? `${blogs.length} posts` : undefined}
        action={
          <div className="flex gap-2">
            <Link to="/blogs/categories"><Button variant="outline"><Settings2 size={15} /> Categories</Button></Link>
            <Link to="/blogs/new"><Button><Plus size={15} /> New post</Button></Link>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={keyword} onChange={setKeyword} placeholder="Search posts…" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !blogs || blogs.length === 0 ? (
          <EmptyState icon={<Newspaper size={18} />} title="No blog posts yet" />
        ) : (
          <>
          <BulkActionBar
            selection={selection}
            onDone={() => qc.invalidateQueries({ queryKey: ["admin-blogs"] })}
            actions={[
              { label: "Publish", run: (id) => blogApi.setStatus(id, "published") },
              { label: "Unpublish", run: (id) => blogApi.setStatus(id, "draft") },
              { label: "Delete", variant: "danger", confirm: "Delete the selected posts?", run: (id) => blogApi.remove(id) },
            ]}
            extra={
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportCsv("blogs.csv", blogs.filter((b) => selection.isSelected(b._id)).map((b) => ({ title: b.title, slug: b.slug, status: b.status, createdAt: b.createdAt })))
                }
              >
                Export
              </Button>
            }
          />
          <Table>
            <Thead>
              <tr>
                <Th className="w-8"><input type="checkbox" aria-label="Select all" checked={selection.allSelected} onChange={selection.toggleAll} /></Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {blogs.map((b) => {
                const categoryName = typeof b.category === "object" ? b.category?.name : undefined;
                return (
                  <Tr key={b._id}>
                    <Td><input type="checkbox" aria-label={`Select ${b.title}`} checked={selection.isSelected(b._id)} onChange={() => selection.toggle(b._id)} /></Td>
                    <Td className="max-w-xs truncate text-sm font-medium">{b.title}</Td>
                    <Td className="text-sm text-muted">{categoryName || "—"}</Td>
                    <Td>
                      <Select
                        value={b.status}
                        onChange={(e) => setStatusMutation.mutate({ id: b._id, status: e.target.value })}
                        className="!w-32 !py-1 !text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </Select>
                    </Td>
                    <Td className="text-sm text-muted">{formatDate(b.publishedAt || b.createdAt)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Link to="/blogs/$blogId/edit" params={{ blogId: b._id }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => setDeleteId(b._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteBlog.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete blog post"
        confirmLabel="Delete"
        danger
        isLoading={deleteBlog.isPending}
      />
    </div>
  );
}
