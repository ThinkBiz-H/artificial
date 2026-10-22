import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { Plus, X, Trash2, ArrowLeft, Check } from "lucide-react";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useRemoveProductImage,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { VariantsManager } from "./VariantsManager";
import type { ProductFormValues } from "@/api/products";
import type { ColorOption } from "@/types";
import { COLOR_PRESETS, METAL_SUGGESTIONS, PLATING_SUGGESTIONS, SIZE_SUGGESTIONS, presetHex } from "@/lib/jewellery";
import { computeGstPricingPreview } from "@/lib/gstPricing";
import { formatCurrency } from "@/lib/utils";

interface FormShape {
  title: string;
  shortDescription: string;
  description: string;
  SKU: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number | undefined;
  gstRate: number;
  priceIncludesGST: boolean;
  stock: number;
  weight: number | undefined;
  minOrderQuantity: number | undefined;
  maxOrderQuantity: number | undefined;
  warranty: string;
  returnPolicy: string;
  featured: boolean;
  status: string;
  seoTitle: string;
  seoDescription: string;
  metal: string;
  plating: string;
}

type ColorDraft = Omit<ColorOption, "_id">;

export function ProductFormPage() {
  const params = useParams({ strict: false }) as { productId?: string };
  const isEdit = !!params.productId;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(params.productId);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(params.productId || "");
  const removeImage = useRemoveProductImage(params.productId || "");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormShape>({
    defaultValues: { status: "active", featured: false, gstRate: 18, priceIncludesGST: true, metal: "", plating: "" },
  });

  // Live preview only (FEATURE 6) — updates instantly while typing. The
  // actual save never sends these computed values, only the raw inputs;
  // the backend independently recomputes and persists them itself.
  const watchedPrice = watch("price");
  const watchedGstRate = watch("gstRate");
  const watchedPriceIncludesGST = watch("priceIncludesGST");
  const gstPreview = computeGstPricingPreview({
    enteredPrice: Number(watchedPrice) || 0,
    gstRate: Number(watchedGstRate) || 0,
    priceIncludesGST: !!watchedPriceIncludesGST,
  });

  const [images, setImages] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [colorOptions, setColorOptions] = useState<ColorDraft[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([]);

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        SKU: product.SKU || "",
        // Null when the category was deleted — leave the select empty so the
        // admin picks a new one instead of the page crashing.
        category:
          typeof product.category === "object"
            ? (product.category?._id ?? "")
            : (product.category ?? ""),
        brand:
          typeof product.brand === "object"
            ? product.brand?._id
            : product.brand || "",
        price: product.price,
        salePrice: product.salePrice,
        // Backward-compat defaults for products saved before this feature
        // existed — matches the backend schema defaults exactly (Feature 12).
        gstRate: product.gstRate ?? 18,
        priceIncludesGST: product.priceIncludesGST ?? true,
        stock: product.stock,
        weight: product.weight,
        minOrderQuantity: product.minOrderQuantity,
        maxOrderQuantity: product.maxOrderQuantity,
        warranty: product.warranty || "",
        returnPolicy: product.returnPolicy || "",
        featured: product.featured,
        status: product.status,
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        metal: product.metal || "",
        plating: product.plating || "",
      });
      // oxlint-disable-next-line react/set-state-in-effect -- syncing fetched entity into local editable state
      setTags(product.tags || []);
      // Products saved before colour options existed only have plain names.
      setColorOptions(
        product.colorOptions?.length
          ? product.colorOptions.map(({ name, hex, images }) => ({ name, hex: hex || "", images: images || [] }))
          : (product.colors || []).map((name) => ({ name, hex: presetHex(name) || "", images: [] })),
      );
      setSizes(product.sizes || []);
      setAttributes(product.attributes || []);
    }
  }, [product, reset]);

  const onSubmit = (values: FormShape) => {
    const cleanColors = colorOptions
      .map((c) => ({ ...c, name: c.name.trim(), hex: c.hex.trim() }))
      .filter((c) => c.name);
    const payload: Partial<ProductFormValues> = {
      ...values,
      brand: values.brand || undefined,
      tags,
      colorOptions: cleanColors,
      colors: cleanColors.map((c) => c.name),
      sizes,
      metal: values.metal.trim(),
      plating: values.plating.trim(),
      attributes,
      images: images.length ? images : undefined,
    };
    if (isEdit && params.productId) {
      updateProduct.mutate(payload, { onSuccess: () => setImages([]) });
    } else {
      createProduct.mutate(payload as ProductFormValues, {
        onSuccess: () => {
          reset({
            title: "",
            shortDescription: "",
            description: "",
            SKU: "",
            category: "",
            brand: "",
            price: 0,
            salePrice: undefined,
            gstRate: 18,
            priceIncludesGST: true,
            stock: 0,
            weight: undefined,
            minOrderQuantity: undefined,
            maxOrderQuantity: undefined,
            warranty: "",
            returnPolicy: "",
            featured: false,
            status: "active",
            seoTitle: "",
            seoDescription: "",
            metal: "",
            plating: "",
          });

          setImages([]);
          setTags([]);
          setColorOptions([]);
          setSizes([]);
          setAttributes([]);
          setTagInput("");
          setSizeInput("");
        },
      });
    }
  };

  const updateColor = (index: number, patch: Partial<ColorDraft>) =>
    setColorOptions((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const addColor = (name = "", hex = "") => {
    if (name && colorOptions.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setColorOptions((list) => [...list, { name, hex, images: [] }]);
  };
  const toggleColorImage = (index: number, img: { url: string; publicId: string }) =>
    setColorOptions((list) =>
      list.map((c, i) => {
        if (i !== index) return c;
        const has = c.images.some((x) => x.publicId === img.publicId);
        return { ...c, images: has ? c.images.filter((x) => x.publicId !== img.publicId) : [...c.images, img] };
      }),
    );
  const addSize = (value: string) => {
    const v = value.trim();
    if (v && !sizes.includes(v)) setSizes((x) => [...x, v]);
  };
  const unusedPresets = COLOR_PRESETS.filter((p) => !colorOptions.some((c) => c.name.toLowerCase() === p.name.toLowerCase()));

  if (isEdit && isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit product" : "Add product"}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/products" })}
          >
            <ArrowLeft size={14} /> Back to products
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="General" />
            <CardBody className="space-y-4">
              <Input
                label="Title"
                required
                {...register("title", { required: true })}
                error={errors.title ? "Title is required" : undefined}
              />
              <Textarea
                label="Short description"
                rows={2}
                {...register("shortDescription")}
              />
              <Textarea
                label="Description"
                rows={6}
                {...register("description")}
              />
              <Input label="SKU" {...register("SKU")} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pricing & inventory" />
            <CardBody className="grid grid-cols-2 gap-4">
              <Input
                label={
                  watchedPriceIncludesGST
                    ? "Price (final, GST included)"
                    : "Price (base, before GST)"
                }
                type="number"
                step="0.01"
                required
                {...register("price", { required: true, valueAsNumber: true })}
              />
              <Input
                label="Sale price (optional)"
                type="number"
                step="0.01"
                {...register("salePrice", { valueAsNumber: true })}
              />
              <Input
                label="Stock"
                type="number"
                required
                disabled={product?.hasVariants}
                hint={product?.hasVariants ? "Managed per-variant" : undefined}
                {...register("stock", { required: true, valueAsNumber: true })}
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                {...register("weight", { valueAsNumber: true })}
              />
              <Input
                label="Min order qty"
                type="number"
                {...register("minOrderQuantity", { valueAsNumber: true })}
              />
              <Input
                label="Max order qty"
                type="number"
                {...register("maxOrderQuantity", { valueAsNumber: true })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="GST Configuration"
              description="Applies only to this product going forward — never recalculates or changes any other product's price."
            />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("priceIncludesGST")} />
                Price Includes GST
              </label>
              <Input
                label="GST Percentage"
                type="number"
                step="0.01"
                min={0}
                max={100}
                hint="Default 18%. Must be between 0 and 100."
                {...register("gstRate", { valueAsNumber: true, min: 0, max: 100 })}
                error={
                  errors.gstRate
                    ? "GST percentage must be between 0 and 100"
                    : undefined
                }
              />

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted">Entered Price</p>
                  <p className="font-mono font-medium text-ink">
                    {formatCurrency(Number(watchedPrice) || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">GST %</p>
                  <p className="font-mono font-medium text-ink">
                    {gstPreview.gstRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">GST Amount</p>
                  <p className="font-mono font-medium text-ink">
                    {formatCurrency(gstPreview.gstAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Final Selling Price</p>
                  <p className="font-mono font-semibold text-ink">
                    {formatCurrency(gstPreview.price)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Images"
              description="First image is used as the thumbnail."
            />
            <CardBody>
              <div className="mb-3 flex flex-wrap gap-3">
                {product?.images?.map((img) => (
                  <div
                    key={img.publicId}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage.mutate(img.publicId)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      aria-label="Remove"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                value={images}
                onChange={(v) => setImages(v as File[])}
                multiple
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Jewellery options"
              description="Metal, plating, colours and sizes shown on the product page. Variants (below) combine a colour and a size with their own SKU, stock and price."
            />
            <CardBody className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="product-metal" label="Metal" list="metal-suggestions" placeholder="e.g. Brass" {...register("metal")} />
                <Input id="product-plating" label="Plating" list="plating-suggestions" placeholder="e.g. Gold Plated" {...register("plating")} />
                <datalist id="metal-suggestions">
                  {METAL_SUGGESTIONS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <datalist id="plating-suggestions">
                  {PLATING_SUGGESTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-ink">Colours</p>
                <div className="space-y-3">
                  {colorOptions.map((opt, i) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <div className="flex items-end gap-2">
                        <input
                          type="color"
                          value={/^#[0-9a-f]{6}$/i.test(opt.hex) ? opt.hex : "#cccccc"}
                          onChange={(e) => updateColor(i, { hex: e.target.value.toUpperCase() })}
                          aria-label={`Swatch colour for ${opt.name || "new colour"}`}
                          className="h-9 w-11 flex-none cursor-pointer rounded-lg border border-border bg-white p-0.5"
                        />
                        <Input
                          id={`color-name-${i}`}
                          label="Colour name"
                          list="color-presets"
                          required
                          value={opt.name}
                          onChange={(e) => updateColor(i, { name: e.target.value, hex: opt.hex || presetHex(e.target.value) || "" })}
                        />
                        <Input
                          id={`color-hex-${i}`}
                          label="Hex"
                          placeholder="#D4AF37"
                          className="font-mono"
                          value={opt.hex}
                          onChange={(e) => updateColor(i, { hex: e.target.value })}
                          error={opt.hex && !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(opt.hex) ? "Use #RGB or #RRGGBB" : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setColorOptions((list) => list.filter((_, idx) => idx !== i))}
                          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                          aria-label={`Remove colour ${opt.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {product?.images?.length ? (
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs text-muted">Gallery for this colour — shown when the shopper picks it:</p>
                          <div className="flex flex-wrap gap-2">
                            {product.images.map((img) => {
                              const selected = opt.images.some((x) => x.publicId === img.publicId);
                              return (
                                <button
                                  key={img.publicId}
                                  type="button"
                                  onClick={() => toggleColorImage(i, img)}
                                  aria-pressed={selected}
                                  aria-label={`${selected ? "Remove" : "Add"} image for ${opt.name || "this colour"}`}
                                  className={`relative h-14 w-14 overflow-hidden rounded-lg border-2 ${selected ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
                                >
                                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                                  {selected && (
                                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white">
                                      <Check size={10} />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted">Upload and save product images first to pick a gallery for this colour.</p>
                      )}
                    </div>
                  ))}
                </div>
                <datalist id="color-presets">
                  {COLOR_PRESETS.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addColor()}>
                    <Plus size={13} /> Add colour
                  </Button>
                  {unusedPresets.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => addColor(p.name, p.hex)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-ink-soft hover:border-ink"
                    >
                      <span className="h-3 w-3 rounded-full border border-border-strong" style={{ backgroundColor: p.hex }} aria-hidden />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-ink">Sizes</p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {sizes.map((sz) => (
                    <span key={sz} className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs">
                      {sz}
                      <button type="button" onClick={() => setSizes((x) => x.filter((i) => i !== sz))} aria-label={`Remove size ${sz}`}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  id="size-input"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Add a size and press Enter — e.g. 2.4, 7, Free Size"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize(sizeInput);
                      setSizeInput("");
                    }
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SIZE_SUGGESTIONS.filter((x) => !sizes.includes(x)).map((x) => (
                    <button key={x} type="button" onClick={() => addSize(x)} className="rounded-md border border-border px-2 py-0.5 text-xs text-ink-soft hover:border-ink">
                      + {x}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Attributes"
              description="Custom specification fields shown on the product page."
            />
            <CardBody>
              <div className="space-y-2">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Key"
                      value={attr.key}
                      onChange={(e) =>
                        setAttributes((a) =>
                          a.map((x, idx) =>
                            idx === i ? { ...x, key: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Value"
                      value={attr.value}
                      onChange={(e) =>
                        setAttributes((a) =>
                          a.map((x, idx) =>
                            idx === i ? { ...x, value: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAttributes((a) => a.filter((_, idx) => idx !== i))
                      }
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                      aria-label="Remove attribute"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAttributes((a) => [...a, { key: "", value: "" }])
                  }
                >
                  <Plus size={13} /> Add attribute
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="SEO" />
            <CardBody className="space-y-4">
              <Input label="SEO title" {...register("seoTitle")} />
              <Textarea
                label="SEO description"
                rows={2}
                {...register("seoDescription")}
              />
            </CardBody>
          </Card>

          {isEdit && params.productId && (
            <VariantsManager productId={params.productId} product={product} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Organize" />
            <CardBody className="space-y-4">
              <Controller
                control={control}
                name="category"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    label="Category"
                    required
                    {...field}
                    error={errors.category ? "Required" : undefined}
                  >
                    <option value="">Select category</option>
                    {categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="brand"
                render={({ field }) => (
                  <Select label="Brand" {...field}>
                    <option value="">No brand</option>
                    {brands?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select label="Status" {...field}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </Select>
                )}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("featured")} />
                Featured product
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tags" />
            <CardBody>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                      aria-label="Remove tag"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (tagInput.trim()) {
                        setTags((t) => [...t, tagInput.trim()]);
                        setTagInput("");
                      }
                    }
                  }}
                />
              </div>
            </CardBody>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={createProduct.isPending || updateProduct.isPending}
          >
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
