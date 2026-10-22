import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useVariants, useCreateVariant, useUpdateVariant, useDeleteVariant } from "@/hooks/useProducts";
import { productsApi } from "@/api/products";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ColorSwatch } from "@/components/common/ItemOptions";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { skuToken } from "@/lib/jewellery";
import type { ImageRef, Product, Variant } from "@/types";

type VariantForm = {
  color: string;
  size: string;
  sku: string;
  barcode: string;
  price: number;
  salePrice: number | undefined;
  stock: number;
  images: ImageRef[];
  /** Any attributes besides Color/Size, as "Key:Value, Key:Value". */
  extraAttributes: string;
  isDefault: boolean;
};

const emptyForm: VariantForm = {
  color: "",
  size: "",
  sku: "",
  barcode: "",
  price: 0,
  salePrice: undefined,
  stock: 0,
  images: [],
  extraAttributes: "",
  isDefault: false,
};

const isColorOrSize = (key: string) => ["color", "size"].includes(key.toLowerCase());
const norm = (v?: string) => (v || "").trim().toLowerCase();

/** A variant's colour/size — older variants only have them in `attributes`. */
const variantColor = (v: Variant) => v.color || v.attributes.find((a) => a.key.toLowerCase() === "color")?.value || "";
const variantSize = (v: Variant) => v.size || v.attributes.find((a) => a.key.toLowerCase() === "size")?.value || "";

export function VariantsManager({ productId, product }: { productId: string; product?: Product }) {
  const qc = useQueryClient();
  const { data: variants, isLoading } = useVariants(productId);
  const createVariant = useCreateVariant(productId);
  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantForm>(emptyForm);
  const [generating, setGenerating] = useState(false);

  const colorOptions = product?.colorOptions ?? [];
  const sizes = product?.sizes ?? [];
  const productImages = product?.images ?? [];
  const hexFor = (color: string) => colorOptions.find((c) => norm(c.name) === norm(color))?.hex;

  // Every colour × size combination the product defines that has no variant yet.
  const missingCombos = useMemo(() => {
    const colors = colorOptions.length ? colorOptions.map((c) => c.name) : [""];
    const sizeList = sizes.length ? sizes : [""];
    if (!colorOptions.length && !sizes.length) return [];
    const existing = new Set((variants ?? []).map((v) => `${norm(variantColor(v))}|${norm(variantSize(v))}`));
    return colors.flatMap((color) => sizeList.map((size) => ({ color, size }))).filter((c) => !existing.has(`${norm(c.color)}|${norm(c.size)}`));
  }, [colorOptions, sizes, variants]);

  const skuBase = product?.SKU ? skuToken(product.SKU) : `${skuToken(product?.title || "ITEM").slice(0, 12)}-${productId.slice(-4).toUpperCase()}`;
  const makeSku = (color: string, size: string) => [skuBase, color && skuToken(color), size && skuToken(size)].filter(Boolean).join("-");

  const generateCombos = async () => {
    if (!product || missingCombos.length === 0) return;
    setGenerating(true);
    let created = 0;
    const failed: string[] = [];
    // Sequential so the first variant created becomes the default.
    for (const { color, size } of missingCombos) {
      const gallery = colorOptions.find((c) => norm(c.name) === norm(color))?.images ?? [];
      try {
        await productsApi.createVariant(productId, {
          color: color || undefined,
          size: size || undefined,
          sku: makeSku(color, size),
          price: product.price,
          salePrice: product.salePrice,
          stock: 0,
          pickedImages: gallery.slice(0, 1),
        });
        created += 1;
      } catch (err) {
        failed.push(`${[color, size].filter(Boolean).join(" / ")}: ${getErrorMessage(err)}`);
      }
    }
    await qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
    await qc.invalidateQueries({ queryKey: ["admin-product", productId] });
    setGenerating(false);
    if (created) toast.success(`${created} variant${created === 1 ? "" : "s"} created — set their stock and prices below`);
    if (failed.length) toast.error(`Could not create ${failed.length}: ${failed[0]}`);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, price: product?.price ?? 0, salePrice: product?.salePrice });
    setModalOpen(true);
  };
  const openEdit = (v: Variant) => {
    setEditing(v);
    setForm({
      color: variantColor(v),
      size: variantSize(v),
      sku: v.sku,
      barcode: v.barcode || "",
      price: v.price,
      salePrice: v.salePrice,
      stock: v.stock,
      images: v.images ?? [],
      extraAttributes: v.attributes
        .filter((a) => !isColorOrSize(a.key))
        .map((a) => `${a.key}:${a.value}`)
        .join(", "),
      isDefault: v.isDefault,
    });
    setModalOpen(true);
  };

  const toggleImage = (img: ImageRef) =>
    setForm((f) => ({
      ...f,
      images: f.images.some((x) => x.publicId === img.publicId) ? f.images.filter((x) => x.publicId !== img.publicId) : [...f.images, img],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const attributes = form.extraAttributes
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [key, ...rest] = pair.split(":");
        return { key: key.trim(), value: rest.join(":").trim() };
      })
      .filter((a) => a.key && a.value && !isColorOrSize(a.key));

    const payload = {
      color: form.color.trim(),
      size: form.size.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode || undefined,
      price: form.price,
      salePrice: form.salePrice,
      stock: form.stock,
      attributes,
      pickedImages: form.images,
      isDefault: form.isDefault,
    };

    if (editing) {
      updateVariant.mutate({ variantId: editing._id, values: payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createVariant.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  // Images worth offering: the product's photos (colour galleries are subsets of these).
  const pickable = productImages.length ? productImages : (form.images ?? []);

  return (
    <Card>
      <CardHeader
        title="Variants"
        description="Each colour × size combination with its own SKU, stock, price and image."
        action={
          <div className="flex gap-2">
            {missingCombos.length > 0 && (
              <Button type="button" size="sm" variant="outline" onClick={generateCombos} isLoading={generating}>
                <Sparkles size={13} /> Generate {missingCombos.length} combination{missingCombos.length === 1 ? "" : "s"}
              </Button>
            )}
            <Button type="button" size="sm" onClick={openAdd}>
              <Plus size={13} /> Add variant
            </Button>
          </div>
        }
      />
      <CardBody className="p-0">
        {isLoading ? (
          <div className="p-5">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !variants || variants.length === 0 ? (
          <EmptyState
            title="No variants yet"
            description={
              colorOptions.length || sizes.length
                ? "Use “Generate combinations” to create every colour × size, or add one manually."
                : "Add colours and sizes under Jewellery options and save, then generate the combinations here."
            }
            className="py-10"
          />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Image</Th>
                <Th>Colour</Th>
                <Th>Size</Th>
                <Th>SKU</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {variants.map((v) => {
                const color = variantColor(v);
                const size = variantSize(v);
                const extra = v.attributes.filter((a) => !isColorOrSize(a.key));
                return (
                  <Tr key={v._id}>
                    <Td>
                      <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-surface">
                        {v.images?.[0]?.url && <img src={v.images[0].url} alt="" className="h-full w-full object-cover" />}
                      </div>
                    </Td>
                    <Td className="text-sm">
                      {color ? (
                        <span className="inline-flex items-center gap-1.5">
                          <ColorSwatch hex={v.colorHex || hexFor(color)} />
                          {color}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                      {extra.length > 0 && <p className="text-xs text-muted">{extra.map((a) => `${a.key}: ${a.value}`).join(", ")}</p>}
                    </Td>
                    <Td className="text-sm">{size || <span className="text-muted">—</span>}</Td>
                    <Td className="font-mono text-xs">
                      {v.sku}
                      {v.isDefault && <span className="ml-1 text-muted">(default)</span>}
                    </Td>
                    <Td className="font-mono text-xs">
                      {formatCurrency(v.salePrice || v.price)}
                      {v.salePrice ? <span className="ml-1 text-muted line-through">{formatCurrency(v.price)}</span> : null}
                    </Td>
                    <Td className={v.stock > 0 ? "text-sm" : "text-sm text-danger"}>{v.stock}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                          aria-label={`Edit variant ${v.sku}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(v._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                          aria-label={`Delete variant ${v.sku}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </CardBody>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit variant" : "Add variant"}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                id="variant-color"
                label="Colour"
                list="variant-color-options"
                placeholder="e.g. Gold"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              />
              {hexFor(form.color) && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <ColorSwatch hex={hexFor(form.color)} /> {hexFor(form.color)}
                </p>
              )}
              <datalist id="variant-color-options">
                {colorOptions.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </div>
            <div>
              <Input
                id="variant-size"
                label="Size"
                list="variant-size-options"
                placeholder="e.g. 2.4"
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
              />
              <datalist id="variant-size-options">
                {sizes.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="variant-sku" label="SKU" required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            <Input id="variant-barcode" label="Barcode (optional)" value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} />
          </div>
          {!editing && !form.sku && (form.color || form.size) && (
            <button
              type="button"
              className="text-xs text-ink underline underline-offset-2"
              onClick={() => setForm((f) => ({ ...f, sku: makeSku(f.color, f.size) }))}
            >
              Use {makeSku(form.color, form.size)}
            </button>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="variant-price"
              label="Price"
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            />
            <Input
              id="variant-sale"
              label="Sale price"
              type="number"
              step="0.01"
              value={form.salePrice ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value ? Number(e.target.value) : undefined }))}
            />
            <Input
              id="variant-stock"
              label="Stock"
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">Images</p>
            {pickable.length ? (
              <div className="flex flex-wrap gap-2">
                {pickable.map((img) => {
                  const index = form.images.findIndex((x) => x.publicId === img.publicId);
                  const selected = index >= 0;
                  return (
                    <button
                      key={img.publicId}
                      type="button"
                      onClick={() => toggleImage(img)}
                      aria-pressed={selected}
                      aria-label={`${selected ? "Remove" : "Use"} this image`}
                      className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 ${selected ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                      {selected && (
                        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-semibold text-white">
                          {index === 0 ? <Check size={10} /> : index + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted">Upload product images first — variants reuse them.</p>
            )}
            <p className="mt-1 text-xs text-muted">The first selected image is shown for this combination.</p>
          </div>

          <Input
            id="variant-extra"
            label="Other attributes (optional)"
            placeholder="e.g. Length:16 in, Stone:Kundan"
            value={form.extraAttributes}
            onChange={(e) => setForm((f) => ({ ...f, extraAttributes: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            Set as default variant
          </label>
          <Button type="submit" className="w-full" isLoading={createVariant.isPending || updateVariant.isPending}>
            Save variant
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteVariant.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete variant"
        description="This variant will be permanently removed."
        confirmLabel="Delete"
        danger
        isLoading={deleteVariant.isPending}
      />
    </Card>
  );
}
