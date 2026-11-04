import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, Search, CornerDownRight, ChevronRight } from "lucide-react";
import { useCategoryTree, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface FlatRow {
  category: Category;
  depth: number;
  parentName?: string;
}

function flatten(categories: Category[], depth = 0, parentName?: string): FlatRow[] {
  const rows: FlatRow[] = [];
  categories.forEach((c) => {
    rows.push({ category: c, depth, parentName });
    if (c.children && c.children.length) rows.push(...flatten(c.children, depth + 1, c.name));
  });
  return rows;
}

type View = "main" | "sub";

function CategoryThumb({ category, size }: { category: Category; size: "lg" | "sm" }) {
  const src = category.icon?.url || category.image?.url;
  return (
    <div className={cn("flex-none overflow-hidden rounded-full border border-border bg-surface", size === "lg" ? "h-10 w-10" : "h-7 w-7")}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
    </div>
  );
}

const emptyForm = {
  name: "",
  shortTitle: "",
  description: "",
  status: "active",
  sortOrder: 0,
  parent: "",
  showInHeader: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

/**
 * Main categories (Earrings, Necklace…) and their sub-categories (Jhumki,
 * Bali…). Products belong to a sub-category, or to a main category that has
 * none. The website and app build their category tabs from this.
 */
export function CategoriesPage({ initialView = "main" }: { initialView?: View } = {}) {
  const { data: categories, isLoading } = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [view, setView] = useState<View>(initialView);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);

  const rows = useMemo(() => (categories ? flatten(categories) : []), [categories]);
  const mains = rows.filter((r) => r.depth === 0);
  const subs = rows.filter((r) => r.depth > 0);
  const q = search.trim().toLowerCase();

  // Tree: every main category with its sub-categories. Search keeps a main
  // category when it or any sub-category matches; the Sub view can narrow to one parent.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const toggleCollapse = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const matches = (c: Category) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q);
  const treeRoots = (categories ?? [])
    .filter((m) => view === "main" || !parentFilter || m._id === parentFilter)
    .map((main) => {
      const all = main.children ?? [];
      const children = matches(main) ? all : all.filter(matches);
      return { main, children };
    })
    .filter(({ main, children }) => (view === "sub" ? children.length > 0 || (!q && !!main.children?.length) : matches(main) || children.length > 0));

  const rowActions = (category: Category, isMain = false) => (
    <div className="flex flex-none items-center gap-1">
      <button type="button" onClick={() => toggleStatus(category)} title={category.status === "active" ? "Disable" : "Enable"}>
        <Badge tone={category.status === "active" ? "success" : "neutral"}>{category.status === "active" ? "Enabled" : "Disabled"}</Badge>
      </button>
      {isMain && (
        <button onClick={() => openAdd(category._id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label={`Add sub-category to ${category.name}`} title="Add sub-category">
          <Plus size={14} />
        </button>
      )}
      <button onClick={() => openEdit(category)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label={`Edit ${category.name}`}>
        <Pencil size={14} />
      </button>
      <button onClick={() => setDeleteId(category._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label={`Delete ${category.name}`}>
        <Trash2 size={14} />
      </button>
    </div>
  );

  const resetFiles = () => {
    setImage(null);
    setIcon(null);
    setBanner(null);
    setRemoveIcon(false);
    setRemoveBanner(false);
  };

  const openAdd = (parent = "") => {
    setEditing(null);
    setForm({ ...emptyForm, parent, showInHeader: !parent });
    resetFiles();
    setModalOpen(true);
  };
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
      seoTitle: c.seo?.title || "",
      seoDescription: c.seo?.description || "",
      seoKeywords: c.seo?.keywords || "",
    });
    resetFiles();
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { seoTitle, seoDescription, seoKeywords, ...rest } = form;
    const values = {
      ...rest,
      // "root" moves a sub-category back to the top level (null is dropped from multipart).
      parent: form.parent || "root",
      seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
      image: image || undefined,
      icon: icon || undefined,
      banner: banner || undefined,
      ...(removeIcon && !icon ? { remove_icon: true } : {}),
      ...(removeBanner && !banner ? { remove_banner: true } : {}),
    };
    if (editing) updateCategory.mutate({ id: editing._id, values }, { onSuccess: () => setModalOpen(false) });
    else createCategory.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  const toggleStatus = (c: Category) => updateCategory.mutate({ id: c._id, values: { status: c.status === "active" ? "inactive" : "active" } });

  // Parent choices: main categories only (two levels), plus the current parent if it is deeper.
  const parentOptions = mains.filter((r) => r.category._id !== editing?._id);
  const currentDeepParent = editing?.parent && !mains.some((m) => m.category._id === editing.parent) ? rows.find((r) => r.category._id === editing.parent) : undefined;
  const isSub = !!form.parent;
  const editingHasChildren = !!editing?.children?.length;

  return (
    <div>
      <PageHeader
        title="Categories"
        description={categories ? `${mains.length} main categories · ${subs.length} sub-categories` : undefined}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openAdd(parentFilter || mains[0]?.category._id || "")} disabled={!mains.length}>
              <CornerDownRight size={15} /> Add sub-category
            </Button>
            <Button onClick={() => openAdd()}>
              <Plus size={15} /> Add main category
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex rounded-lg border border-border p-0.5">
            {(["main", "sub"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium", view === v ? "bg-brand text-white" : "text-muted hover:text-ink")}
              >
                {v === "main" ? `Main categories (${mains.length})` : `Sub-categories (${subs.length})`}
              </button>
            ))}
          </div>
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories"
              className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
          {view === "sub" && (
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              aria-label="Filter by main category"
              className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
            >
              <option value="">All main categories</option>
              {mains.map(({ category }) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : treeRoots.length === 0 ? (
          <EmptyState
            icon={<FolderTree size={18} />}
            title={rows.length === 0 ? "No categories yet" : "No categories match"}
          />
        ) : (
          <ul className="divide-y divide-border">
            {treeRoots.map(({ main, children }) => {
              const collapsed = collapsedIds.has(main._id);
              return (
                <li key={main._id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(main._id)}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-muted hover:bg-surface disabled:opacity-0"
                      disabled={!main.children?.length}
                      aria-label={collapsed ? `Expand ${main.name}` : `Collapse ${main.name}`}
                      aria-expanded={!collapsed}
                    >
                      <ChevronRight size={15} className={cn("transition-transform", !collapsed && "rotate-90")} />
                    </button>
                    <CategoryThumb category={main} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                        {main.name}
                        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                          {main.children?.length ?? 0} sub-categories
                        </span>
                      </p>
                      <p className="text-xs text-muted">/{main.slug} · order {main.sortOrder}</p>
                    </div>
                    {rowActions(main, true)}
                  </div>
                  {!collapsed && children.length > 0 && (
                    <ul className="ml-[18px] mt-2 border-l border-border pl-0">
                      {children.map((child, i) => (
                        <li key={child._id} className="relative flex items-center gap-3 py-1.5 pl-6">
                          <span aria-hidden className={cn("absolute left-0 top-1/2 h-px w-5 bg-border", i === children.length - 1 && "")} />
                          <CategoryThumb category={child} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-ink">{child.name}</p>
                            <p className="text-xs text-muted">/{child.slug} · order {child.sortOrder}</p>
                          </div>
                          {rowActions(child)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${isSub ? "sub-category" : "main category"}` : isSub ? "Add sub-category" : "Add main category"}
        className="max-w-2xl"
      >
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Type"
            value={isSub ? form.parent : ""}
            disabled={editingHasChildren}
            onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
          >
            <option value="">Main category</option>
            {currentDeepParent && <option value={currentDeepParent.category._id}>Sub-category of {currentDeepParent.category.name}</option>}
            {parentOptions.map(({ category }) => (
              <option key={category._id} value={category._id}>
                Sub-category of {category.name}
              </option>
            ))}
          </Select>
          {editingHasChildren && <p className="-mt-2 text-xs text-muted">This category has sub-categories, so it stays a main category.</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Short title" value={form.shortTitle} onChange={(e) => setForm((f) => ({ ...f, shortTitle: e.target.value }))} />
          </div>
          {editing && <p className="-mt-2 text-xs text-muted">Slug: /{editing.slug} (generated from the name)</p>}
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Enabled</option>
              <option value="inactive">Disabled</option>
            </Select>
            <Input label="Display order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </div>
          {!isSub && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.showInHeader} onChange={(e) => setForm((f) => ({ ...f, showInHeader: e.target.checked }))} />
              Show in header menu
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <ImageUpload value={image} onChange={(v) => setImage(v as File | null)} existingUrl={editing?.image?.url} label="Image" />
            <ImageUpload
              value={icon}
              onChange={(v) => setIcon(v as File | null)}
              existingUrl={removeIcon ? undefined : editing?.icon?.url}
              onRemoveExisting={editing?.icon?.url ? () => setRemoveIcon(true) : undefined}
              label="Icon (round, optional)"
            />
            <ImageUpload
              value={banner}
              onChange={(v) => setBanner(v as File | null)}
              existingUrl={removeBanner ? undefined : editing?.banner?.url}
              onRemoveExisting={editing?.banner?.url ? () => setRemoveBanner(true) : undefined}
              label="Banner (wide, optional)"
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-ink">SEO</legend>
            <Input label="Meta title" value={form.seoTitle} maxLength={160} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            <Textarea label="Meta description" rows={2} maxLength={320} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
            <Input label="Keywords (comma separated)" value={form.seoKeywords} onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))} />
          </fieldset>

          <Button type="submit" className="w-full" isLoading={createCategory.isPending || updateCategory.isPending}>
            Save {isSub ? "sub-category" : "category"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCategory.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete category"
        description="Categories that still have sub-categories or products can't be deleted — move or delete those first."
        confirmLabel="Delete"
        danger
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
