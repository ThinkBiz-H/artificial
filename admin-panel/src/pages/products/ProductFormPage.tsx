import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { Plus, X, Trash2, ArrowLeft, Check, Film, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "@/api/products";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useRemoveProductImage,
} from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCategories";
import { useWarehouseList } from "@/hooks/useWarehouses";
import { ImageOrganizer } from "@/components/products/ImageOrganizer";
import { ProductPicker, type PickedProduct } from "@/components/products/ProductPicker";
import { compressImages } from "@/lib/imageCompress";
import { useBrands } from "@/hooks/useBrands";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { VariantsManager } from "./VariantsManager";
import type { ProductFormValues } from "@/api/products";
import type { ColorOption, ImageRef, Product } from "@/types";
import { COLOR_PRESETS, METAL_SUGGESTIONS, PLATING_SUGGESTIONS, SIZE_SUGGESTIONS, presetHex } from "@/lib/jewellery";
import { computeGstPricingPreview } from "@/lib/gstPricing";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

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
  stone: string;
  packaging: string;
  /** Comma-separated in the form, arrays in the API. */
  occasions: string;
  collections: string;
  isTrending: boolean;
  isNewArrival: boolean;
  isTopSelling: boolean;
  hsnCode: string;
  /** One highlight per line in the form. */
  highlights: string;
  dimLength: number | undefined;
  dimWidth: number | undefined;
  dimHeight: number | undefined;
  dimUnit: "cm" | "in";
  designCode: string;
  packSize: number | undefined;
  videoUrl: string;
  warehouse: string;
  dealerPrice: number | undefined;
  shippingClass: string;
}

type Tier = { minQty: number; discountPercent: number };

/** Sticky section menu — each entry scrolls to the card with that id. */
const SECTIONS = [
  ["general", "General"],
  ["pricing", "Pricing"],
  ["inventory", "Inventory"],
  ["wholesale", "Wholesale"],
  ["media", "Media"],
  ["specifications", "Specifications"],
  ["shipping", "Shipping"],
  ["seo", "SEO"],
  ["related", "Related"],
  ["variants", "Variants"],
] as const;

/** Related / cross-sell refs arrive populated (objects) or as ids. */
const toPicked = (list?: Product[] | string[]): PickedProduct[] =>
  (list ?? []).filter((p): p is Product => typeof p === "object" && !!p).map((p) => ({ _id: p._id, title: p.title }));

/** "Wedding, Festival , ,Party" → ["Wedding", "Festival", "Party"] */
const splitList = (text: string) => [...new Set(text.split(",").map((s) => s.trim()).filter(Boolean))];

type ColorDraft = Omit<ColorOption, "_id">;

export function ProductFormPage() {
  const params = useParams({ strict: false }) as { productId?: string };
  const isEdit = !!params.productId;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(params.productId);
  const { data: categoryTree } = useCategoryTree();
  const { data: warehouses } = useWarehouseList();
  // Main category → its sub-categories (the product is saved under the sub-category,
  // or under the main category when it has none).
  const mainCategories = useMemo(() => (categoryTree ?? []).filter((c) => c.status === "active" || c.children?.length), [categoryTree]);
  const [mainCategoryId, setMainCategoryId] = useState("");
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
    defaultValues: {
      status: "active",
      featured: false,
      gstRate: 18,
      priceIncludesGST: true,
      metal: "",
      plating: "",
      stone: "",
      packaging: "",
      occasions: "",
      collections: "",
      isTrending: false,
      isNewArrival: false,
      isTopSelling: false,
      hsnCode: "",
      highlights: "",
      dimUnit: "cm",
      designCode: "",
      packSize: 1,
      videoUrl: "",
      warehouse: "",
      dealerPrice: undefined,
      shippingClass: "",
    },
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
  const [savedImages, setSavedImages] = useState<ImageRef[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [related, setRelated] = useState<PickedProduct[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<PickedProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [spinFiles, setSpinFiles] = useState<File[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const qc = useQueryClient();
  const refreshProduct = () => qc.invalidateQueries({ queryKey: ["admin-products"] });

  const uploadMedia = async () => {
    if (!params.productId || (!videoFile && !spinFiles.length)) return;
    setMediaBusy(true);
    try {
      await productsApi.uploadMedia(params.productId, { video: videoFile, spin: spinFiles });
      toast.success("Media uploaded");
      setVideoFile(null);
      setSpinFiles([]);
      refreshProduct();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setMediaBusy(false);
    }
  };
  const removeMedia = async (kind: "video" | "spin") => {
    if (!params.productId) return;
    setMediaBusy(true);
    try {
      await productsApi.removeMedia(params.productId, kind);
      toast.success(kind === "video" ? "Video removed" : "360° view removed");
      refreshProduct();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setMediaBusy(false);
    }
  };
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
        stone: product.stone || "",
        packaging: product.packaging || "",
        occasions: (product.occasions ?? []).join(", "),
        collections: (product.collections ?? []).join(", "),
        isTrending: !!product.isTrending,
        isNewArrival: !!product.isNewArrival,
        isTopSelling: !!product.isTopSelling,
        hsnCode: product.hsnCode || "",
        highlights: (product.highlights ?? []).join("\n"),
        dimLength: product.dimensions?.length,
        dimWidth: product.dimensions?.width,
        dimHeight: product.dimensions?.height,
        dimUnit: product.dimensions?.unit || "cm",
        designCode: product.designCode || "",
        packSize: product.packSize || 1,
        videoUrl: product.video?.url && product.videoUrl === product.video.url ? "" : product.videoUrl || "",
        warehouse: "",
        dealerPrice: product.dealerPrice || undefined,
        shippingClass: product.shippingClass || "",
      });
      setTiers(product.bulkPricing ?? []);
      setSavedImages(product.images || []);
      setCoverUrl(product.thumbnail?.url);
      setRelated(toPicked(product.relatedProducts));
      setBoughtTogether(toPicked(product.crossSell));
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

  const productCategoryId =
    product && typeof product.category === "object" ? (product.category?._id ?? "") : ((product?.category as string) ?? "");
  useEffect(() => {
    if (!productCategoryId || !categoryTree) return;
    const owner = categoryTree.find((m) => m._id === productCategoryId || m.children?.some((c) => c._id === productCategoryId));
    // oxlint-disable-next-line react/set-state-in-effect -- derive the Main dropdown from the saved category
    if (owner) setMainCategoryId(owner._id);
  }, [productCategoryId, categoryTree]);
  const selectedMain = mainCategories.find((m) => m._id === mainCategoryId);
  const subOptions = (selectedMain?.children ?? []).filter((c) => c.status === "active" || c._id === productCategoryId);

  const onSubmit = async (values: FormShape) => {
    const cleanColors = colorOptions
      .map((c) => ({ ...c, name: c.name.trim(), hex: c.hex.trim() }))
      .filter((c) => c.name);
    const { occasions, collections, highlights, dimLength, dimWidth, dimHeight, dimUnit, warehouse, packSize, ...formValues } = values;
    // Shrink large photos in the browser before upload.
    setSaving(true);
    const uploads = images.length ? await compressImages(images) : [];
    setSaving(false);
    const num = (n: number | undefined) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined);
    const payload: Partial<ProductFormValues> = {
      ...formValues,
      occasions: splitList(occasions),
      highlights: [...new Set(highlights.split("\n").map((h) => h.trim()).filter(Boolean))].slice(0, 12),
      hsnCode: values.hsnCode.trim(),
      collections: splitList(collections),
      dimensions: { length: num(dimLength), width: num(dimWidth), height: num(dimHeight), unit: dimUnit },
      brand: values.brand || undefined,
      tags,
      colorOptions: cleanColors,
      colors: cleanColors.map((c) => c.name),
      sizes,
      metal: values.metal.trim(),
      plating: values.plating.trim(),
      stone: values.stone.trim(),
      packaging: values.packaging.trim(),
      attributes,
      designCode: values.designCode.trim(),
      // A linked video (YouTube / Vimeo / URL); an uploaded file is kept when left blank.
      ...(values.videoUrl.trim() || !product?.video?.url ? { videoUrl: values.videoUrl.trim() } : {}),
      dealerPrice: num(values.dealerPrice) ?? 0,
      shippingClass: values.shippingClass.trim(),
      bulkPricing: tiers.filter((t) => t.minQty > 0 && t.discountPercent > 0),
      packSize: num(packSize) ? Math.floor(packSize!) : 1,
      relatedProducts: related.map((p) => p._id),
      crossSell: boughtTogether.map((p) => p._id),
      ...(isEdit ? { imageOrder: savedImages.map((i) => i.url), thumbnailUrl: coverUrl } : { warehouse: warehouse || undefined }),
      images: uploads.length ? uploads : undefined,
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
            stone: "",
            packaging: "",
            occasions: "",
            collections: "",
            isTrending: false,
            isNewArrival: false,
            isTopSelling: false,
            hsnCode: "",
            highlights: "",
            dimLength: undefined,
            dimWidth: undefined,
            dimHeight: undefined,
            dimUnit: "cm",
            designCode: "",
            packSize: 1,
            videoUrl: "",
            warehouse: "",
            dealerPrice: undefined,
            shippingClass: "",
          });
          setTiers([]);

          setImages([]);
          setRelated([]);
          setBoughtTogether([]);
          setMainCategoryId("");
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
        <nav
          aria-label="Product form sections"
          className="no-scrollbar sticky top-16 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-border bg-white/90 p-1 backdrop-blur lg:col-span-3"
        >
          {SECTIONS.filter(([id]) => id !== "variants" || isEdit).map(([id, label]) => (
            <a key={id} href={`#${id}`} className="flex-none rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface hover:text-brand">
              {label}
            </a>
          ))}
        </nav>
        <div className="space-y-6 lg:col-span-2">
          <Card id="general">
            <CardHeader title="General" description="Name, codes and description buyers see." />
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
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="SKU" {...register("SKU")} />
                <Input label="Design code" placeholder="e.g. JH-2041" {...register("designCode")} />
                <Input label="HSN code" placeholder="e.g. 7117" {...register("hsnCode")} />
              </div>
            </CardBody>
          </Card>

          <Card id="pricing">
            <CardHeader title="Pricing" description="Retail (MRP), wholesale and dealer prices. GST is configured below." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label={
                  watchedPriceIncludesGST
                    ? "Retail price / MRP (GST included)"
                    : "Retail price / MRP (before GST)"
                }
                type="number"
                step="0.01"
                required
                {...register("price", { required: true, valueAsNumber: true })}
              />
              <Input
                label="Wholesale price (what buyers pay)"
                type="number"
                step="0.01"
                {...register("salePrice", { valueAsNumber: true })}
              />
              <Input
                label="Dealer price (dealer accounts)"
                type="number"
                step="0.01"
                min={0}
                hint="Leave blank for none."
                {...register("dealerPrice", { valueAsNumber: true })}
              />
            </CardBody>
          </Card>

          <Card id="inventory">
            <CardHeader title="Inventory" description="Stock is tracked per warehouse; edit later from Inventory." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Stock"
                type="number"
                required
                disabled={product?.hasVariants}
                hint={product?.hasVariants ? "Managed per-variant" : undefined}
                {...register("stock", { required: true, valueAsNumber: true })}
              />
              <Input
                label="Max order qty"
                type="number"
                hint="Blank = no limit."
                {...register("maxOrderQuantity", { valueAsNumber: true })}
              />
              {!isEdit && (
                <Select label="Warehouse (opening stock)" {...register("warehouse")}>
                  <option value="">Default warehouse</option>
                  {(warehouses ?? [])
                    .filter((w) => w.status === "active")
                    .map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                </Select>
              )}
            </CardBody>
          </Card>

          <Card id="wholesale">
            <CardHeader title="Wholesale" description="Minimum order, pack size and bulk discounts. The cart and checkout apply these automatically." />
            <CardBody className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Minimum order quantity (MOQ)" type="number" min={1} hint="Buyers add at least this many." {...register("minOrderQuantity", { valueAsNumber: true })} />
                <Input label="Pack size" type="number" min={1} hint="Pieces per pack (1 = sold loose)." {...register("packSize", { valueAsNumber: true, min: 1 })} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Bulk discount tiers</p>
                <p className="mb-3 text-xs text-muted">e.g. 50+ pieces → 5% off, 100+ → 10% off the wholesale price. The best tier the quantity reaches applies.</p>
                <div className="space-y-2">
                  {tiers.map((t, i) => (
                    <div key={i} className="flex items-end gap-2">
                      <Input
                        label={i === 0 ? "Min. quantity" : undefined}
                        type="number"
                        min={1}
                        value={t.minQty || ""}
                        onChange={(e) => setTiers((list) => list.map((x, j) => (j === i ? { ...x, minQty: Number(e.target.value) } : x)))}
                      />
                      <Input
                        label={i === 0 ? "Discount %" : undefined}
                        type="number"
                        min={0}
                        max={90}
                        step="0.5"
                        value={t.discountPercent || ""}
                        onChange={(e) => setTiers((list) => list.map((x, j) => (j === i ? { ...x, discountPercent: Number(e.target.value) } : x)))}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setTiers((list) => list.filter((_, j) => j !== i))} aria-label="Remove tier">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                {tiers.length < 10 && (
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setTiers((list) => [...list, { minQty: (list[list.length - 1]?.minQty || 0) + 50, discountPercent: 0 }])}>
                    <Plus size={13} /> Add tier
                  </Button>
                )}
              </div>
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

          <Card id="media">
            <CardHeader
              title="Media"
              description="Photos (drag to reorder, pick the cover, crop new ones), video and 360° view. New photos are compressed before upload."
            />
            <CardBody className="space-y-4">
              <ImageOrganizer
                images={savedImages}
                coverUrl={coverUrl}
                onReorder={setSavedImages}
                onCover={setCoverUrl}
                onRemove={(img) =>
                  removeImage.mutate(img.publicId, {
                    onSuccess: () => {
                      setSavedImages((list) => list.filter((x) => x.url !== img.url));
                      if (coverUrl === img.url) setCoverUrl(undefined);
                    },
                  })
                }
              />
              <ImageUpload
                value={images}
                onChange={(v) => setImages(v as File[])}
                multiple
              />
              <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Film size={14} /> Video
                  </p>
                  {product?.video?.url ? (
                    <div className="mt-2 space-y-2">
                      <video src={product.video.url} controls className="aspect-video w-full rounded-lg bg-black" />
                      <Button type="button" size="sm" variant="outline" onClick={() => removeMedia("video")} disabled={mediaBusy}>
                        Remove video
                      </Button>
                    </div>
                  ) : (
                    <Input placeholder="YouTube / Vimeo link (or upload a file below)" {...register("videoUrl")} />
                  )}
                  <label className="mt-2 block text-xs text-muted">
                    Upload a video file (MP4 / WebM / MOV)
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={!isEdit} onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs" />
                  </label>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    <RotateCw size={14} /> 360° view
                  </p>
                  {product?.spinImages?.length ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1 overflow-x-auto">
                        {product.spinImages.slice(0, 8).map((img) => (
                          <img key={img.url} src={img.url} alt="" className="h-12 w-12 flex-none rounded object-cover" />
                        ))}
                      </div>
                      <p className="text-xs text-muted">{product.spinImages.length} frames</p>
                      <Button type="button" size="sm" variant="outline" onClick={() => removeMedia("spin")} disabled={mediaBusy}>
                        Remove 360° view
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted">8–36 photos taken around the piece, named in order (01.jpg, 02.jpg…).</p>
                  )}
                  <input type="file" accept="image/*" multiple disabled={!isEdit} onChange={(e) => setSpinFiles(Array.from(e.target.files ?? []))} className="mt-2 block w-full text-xs" />
                  {spinFiles.length > 0 && <p className="mt-1 text-xs text-muted">{spinFiles.length} frames selected</p>}
                </div>
                {isEdit ? (
                  (videoFile || spinFiles.length > 0) && (
                    <Button type="button" className="sm:col-span-2" onClick={uploadMedia} isLoading={mediaBusy}>
                      Upload {videoFile ? "video" : ""}
                      {videoFile && spinFiles.length ? " and " : ""}
                      {spinFiles.length ? "360° frames" : ""}
                    </Button>
                  )
                ) : (
                  <p className="text-xs text-muted sm:col-span-2">Save the product first, then upload a video file or a 360° set.</p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card id="specifications">
            <CardHeader
              title="Specifications"
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
                <Input id="product-stone" label="Stone" placeholder="e.g. Kundan, AD, Pearl" {...register("stone")} />
                <Input id="product-packaging" label="Packaging" placeholder="e.g. Box of 12 pairs" {...register("packaging")} />
                <Input
                  id="product-occasions"
                  label="Occasions"
                  placeholder="Wedding, Festival, Office, Party, Daily"
                  hint="Comma separated — each becomes a homepage collection and a filter."
                  {...register("occasions")}
                />
                <Textarea
                  id="product-highlights"
                  label="Highlights (one per line)"
                  rows={3}
                  placeholder={"Anti-tarnish gold plating\nLightweight, all-day comfort\nSkin-friendly, nickel-free"}
                  {...register("highlights")}
                />
                <Input
                  id="product-collections"
                  label="Collections"
                  placeholder="e.g. Bridal 2026, Premium"
                  hint="Comma separated — shown as Premium collections and a filter."
                  {...register("collections")}
                />
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

          <Card id="shipping">
            <CardHeader title="Shipping" description="Used for courier rates and packing." />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Weight (kg)" type="number" step="0.01" {...register("weight", { valueAsNumber: true })} />
                <Input label="Shipping class" placeholder="e.g. Fragile, Standard box" {...register("shippingClass")} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Dimensions (packed)</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Input label="Length" type="number" min={0} step="0.1" {...register("dimLength", { valueAsNumber: true })} />
                  <Input label="Width" type="number" min={0} step="0.1" {...register("dimWidth", { valueAsNumber: true })} />
                  <Input label="Height" type="number" min={0} step="0.1" {...register("dimHeight", { valueAsNumber: true })} />
                  <Select label="Unit" {...register("dimUnit")}>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card id="seo">
            <CardHeader title="SEO" description="Search title and description (defaults to the product name)." />
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
            <div id="variants" className="scroll-mt-24">
              <VariantsManager productId={params.productId} product={product} />
            </div>
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
                  <>
                    <Select
                      label="Main category"
                      required
                      value={mainCategoryId}
                      onChange={(e) => {
                        const main = mainCategories.find((m) => m._id === e.target.value);
                        setMainCategoryId(e.target.value);
                        // No sub-categories → the product sits in the main category.
                        field.onChange(main && !main.children?.length ? main._id : "");
                      }}
                    >
                      <option value="">Select main category</option>
                      {mainCategories.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Sub category"
                      required={subOptions.length > 0}
                      disabled={!selectedMain || subOptions.length === 0}
                      value={subOptions.length ? field.value : ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      error={errors.category ? "Choose a sub category" : undefined}
                    >
                      <option value="">
                        {!selectedMain ? "Pick a main category first" : subOptions.length ? `Select ${selectedMain.name} sub category` : "No sub categories"}
                      </option>
                      {subOptions.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </>
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
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isTrending")} />
                Trending (shown first in Trending Now)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isTopSelling")} />
                Best seller (shown first in Best Sellers)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isNewArrival")} />
                New arrival (shown first in New Arrivals)
              </label>
            </CardBody>
          </Card>

          <Card id="related">
            <CardHeader title="Related & bought together" />
            <CardBody className="space-y-5">
              <ProductPicker label="Related products" hint="Shown as “You may also like”." value={related} onChange={setRelated} excludeId={params.productId} />
              <ProductPicker
                label="Frequently bought together"
                hint="Suggested as an add-on on the product page."
                value={boughtTogether}
                onChange={setBoughtTogether}
                excludeId={params.productId}
                max={6}
              />
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
            isLoading={saving || createProduct.isPending || updateProduct.isPending}
          >
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
