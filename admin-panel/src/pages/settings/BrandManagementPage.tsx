import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Download,
  History,
  ImageIcon,
  Images,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Share2,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { BrandAdminView, BrandCompany, BrandExport, BrandSlotInfo, BrandTheme } from "@/api/brand";
import { brandApi } from "@/api/brand";
import { mediaApi } from "@/api/media";
import {
  useBrandAdmin,
  useBrandAssetFromMedia,
  useBrandVersions,
  useImportBrand,
  useRemoveBrandAsset,
  useResetBrand,
  useRestoreBrandAsset,
  useUpdateBrand,
  useUploadBrandAsset,
} from "@/hooks/useBrand";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatDateTime, getErrorMessage } from "@/lib/utils";

const TABS = [
  { id: "logos", label: "Logos", icon: ImageIcon },
  { id: "company", label: "Company", icon: Building2 },
  { id: "social", label: "Social", icon: Share2 },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "backup", label: "Backup & reset", icon: Download },
] as const;
type TabId = (typeof TABS)[number]["id"];

const GROUPS: { id: BrandSlotInfo["group"]; label: string; hint: string }[] = [
  { id: "website", label: "Website", hint: "Header, footer and logos for light / dark backgrounds" },
  { id: "browser", label: "Browser", hint: "Tab icon and home-screen icon" },
  { id: "app", label: "Mobile app", hint: "Splash, sign-in, menus and app bar. App icons apply at the next app build." },
  { id: "documents", label: "Invoices & emails", hint: "PDF invoices and transactional emails" },
  { id: "admin", label: "Admin panel", hint: "Sidebar and sign-in page of this panel" },
];

/** Brand Management — every logo, company detail, social link and theme colour in one place. */
export function BrandManagementPage() {
  const { data, isLoading } = useBrandAdmin();
  const [tab, setTab] = useState<TabId>("logos");

  return (
    <div>
      <PageHeader
        title="Brand Management"
        description="Logos, company details, social links and theme — saved changes appear on the website, app and this panel immediately"
      />

      {data && (
        <p className="-mt-2 mb-6 text-xs text-muted">
          {data.meta.updatedAt
            ? `Last updated ${formatDateTime(data.meta.updatedAt)}${data.meta.updatedBy ? ` by ${data.meta.updatedBy.name}` : ""} · revision ${data.meta.revision}`
            : "Using the built-in defaults — nothing has been customised yet."}
        </p>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors",
              tab === id ? "border-brand font-medium text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-60 w-full rounded-2xl" />)}</div>
      ) : (
        <>
          {tab === "logos" && <LogosTab data={data} />}
          {tab === "company" && <CompanyTab key={data.meta.revision} company={data.company} />}
          {tab === "social" && <SocialTab key={data.meta.revision} social={data.social} />}
          {tab === "theme" && <ThemeTab key={data.meta.revision} data={data} />}
          {tab === "backup" && <BackupTab />}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Logos

function LogosTab({ data }: { data: BrandAdminView }) {
  const [historyFor, setHistoryFor] = useState<BrandSlotInfo | null>(null);
  const [libraryFor, setLibraryFor] = useState<BrandSlotInfo | null>(null);
  return (
    <div className="space-y-8">
      {GROUPS.map((g) => (
        <section key={g.id}>
          <div className="mb-3">
            <h2 className="font-display text-lg font-semibold text-ink">{g.label}</h2>
            <p className="text-xs text-muted">{g.hint}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.slots
              .filter((s) => s.group === g.id)
              .map((s) => (
                <LogoSlotCard key={s.slot} info={s} slots={data.slots} onHistory={() => setHistoryFor(s)} onLibrary={() => setLibraryFor(s)} />
              ))}
          </div>
        </section>
      ))}
      <VersionHistoryModal info={historyFor} onClose={() => setHistoryFor(null)} />
      <MediaPickerModal info={libraryFor} onClose={() => setLibraryFor(null)} />
    </div>
  );
}

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico";

function LogoSlotCard({ info, slots, onHistory, onLibrary }: { info: BrandSlotInfo; slots: BrandSlotInfo[]; onHistory: () => void; onLibrary: () => void }) {
  const upload = useUploadBrandAsset();
  const remove = useRemoveBrandAsset();
  const [dark, setDark] = useState(info.slot === "footerLogo" || info.slot === "darkLogo");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const url = info.current?.url || info.effectiveUrl;
  const inheritedLabel = info.inheritedFrom && info.inheritedFrom !== "legacy" ? slots.find((s) => s.slot === info.inheritedFrom)?.label : null;

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Logos must be under 5 MB");
    upload.mutate({ slot: info.slot, file });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
      <div
        className={cn(
          "relative flex h-36 items-center justify-center p-4",
          // Checkerboard shows transparency.
          dark ? "bg-[#16120f]" : "bg-[length:16px_16px] bg-[conic-gradient(#f3ece6_25%,#fff_0_50%,#f3ece6_0_75%,#fff_0)]",
        )}
      >
        {url ? (
          <img src={url} alt={info.label} className={cn("max-h-full max-w-full object-contain", !info.current && "opacity-50")} />
        ) : (
          <span className={cn("text-xs", dark ? "text-white/50" : "text-muted")}>Built-in default</span>
        )}
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm hover:bg-white"
          aria-label={dark ? "Preview on light background" : "Preview on dark background"}
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-ink">{info.label}</p>
          {info.current ? <Badge tone="success">Custom</Badge> : inheritedLabel ? <Badge tone="neutral">Uses {inheritedLabel.toLowerCase()}</Badge> : <Badge tone="neutral">Default</Badge>}
        </div>
        <p className="mt-1 text-xs text-muted">Recommended: {info.size}</p>
        {info.current && (
          <p className="mt-1 text-xs text-muted">
            {info.current.width && info.current.height ? `${info.current.width} × ${info.current.height} px · ` : ""}
            {info.current.format?.toUpperCase()}
          </p>
        )}
        <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          <Button size="sm" onClick={() => fileRef.current?.click()} isLoading={upload.isPending}>
            <Upload size={13} /> {info.current ? "Replace" : "Upload"}
          </Button>
          <Button size="sm" variant="outline" onClick={onLibrary}><Images size={13} /> Library</Button>
          {info.versions > 0 && <Button size="sm" variant="ghost" onClick={onHistory}><History size={13} /> {info.versions}</Button>}
          {info.current && (
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => setConfirmRemove(true)} aria-label="Remove">
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => remove.mutate(info.slot, { onSuccess: () => setConfirmRemove(false) })}
        title={`Remove the ${info.label.toLowerCase()}?`}
        description={info.fallback.length ? "Its fallback logo is used instead. You can restore it from history any time." : "The built-in default is used instead. You can restore it from history any time."}
        confirmLabel="Remove"
        danger
        isLoading={remove.isPending}
      />
    </div>
  );
}

function VersionHistoryModal({ info, onClose }: { info: BrandSlotInfo | null; onClose: () => void }) {
  const { data: versions, isLoading } = useBrandVersions(info?.slot ?? null);
  const restore = useRestoreBrandAsset();
  return (
    <Modal open={!!info} onClose={onClose} title={info ? `${info.label} — history` : ""}>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : !versions?.length ? (
        <p className="text-sm text-muted">No previous versions.</p>
      ) : (
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v._id} className="flex items-center gap-3 rounded-xl border border-border p-2">
              <div className="flex h-14 w-24 flex-none items-center justify-center rounded-lg bg-surface p-1">
                <img src={v.url} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1 text-xs text-muted">
                <p className="truncate text-sm text-ink">{v.originalName || v.format?.toUpperCase() || "Logo"}</p>
                <p>
                  {formatDateTime(v.createdAt)}
                  {v.createdBy ? ` · ${v.createdBy.name}` : ""} · {v.source === "media" ? "from library" : v.source === "import" ? "imported" : "uploaded"}
                  {v.width && v.height ? ` · ${v.width}×${v.height}` : ""}
                </p>
              </div>
              {v.isCurrent ? (
                <Badge tone="success">Current</Badge>
              ) : (
                <Button size="sm" variant="outline" isLoading={restore.isPending && restore.variables?.versionId === v._id} onClick={() => info && restore.mutate({ slot: info.slot, versionId: v._id })}>
                  <RotateCcw size={13} /> Restore
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function MediaPickerModal({ info, onClose }: { info: BrandSlotInfo | null; onClose: () => void }) {
  const [keyword, setKeyword] = useState("");
  const pick = useBrandAssetFromMedia();
  const { data, isLoading } = useQuery({
    queryKey: ["brand-media-picker", keyword],
    queryFn: () => mediaApi.list({ type: "image", keyword: keyword.trim() || undefined, limit: 24 }),
    enabled: !!info,
    select: (r) => r.data.media,
  });
  return (
    <Modal open={!!info} onClose={onClose} title={info ? `Choose ${info.label.toLowerCase()} from the library` : ""} className="max-w-3xl">
      <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search the Media Library…" className="mb-4" />
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}</div>
      ) : !data?.length ? (
        <p className="text-sm text-muted">No images found. Upload logos in the Media Library, or use Upload on the logo card.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {data.map((m) => (
            <button
              key={m._id}
              type="button"
              disabled={pick.isPending}
              onClick={() => info && pick.mutate({ slot: info.slot, mediaId: m._id }, { onSuccess: onClose })}
              className="group flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-surface p-2 hover:border-brand"
              title={m.originalName}
            >
              <img src={m.url} alt={m.originalName} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------- Company

function CompanyTab({ company }: { company: BrandCompany }) {
  const update = useUpdateBrand();
  const [form, setForm] = useState(company);
  const set = (key: keyof BrandCompany) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setAddr = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, invoiceAddress: { ...f.invoiceAddress, [key]: e.target.value } }));
  const setInv = (key: keyof BrandCompany["invoice"]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, invoice: { ...f.invoice, [key]: e.target.value } }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ company: form });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader title="Brand" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Brand name" required value={form.brandName} onChange={set("brandName")} hint="Shown in titles, emails, the app and the website" />
          <Input label="Company (legal) name" value={form.companyName} onChange={set("companyName")} hint="Printed on invoices" />
          <div className="sm:col-span-2"><Input label="Tagline" value={form.tagline} onChange={set("tagline")} /></div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Contact" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" value={form.email} onChange={set("email")} />
          <Input label="Support email" type="email" value={form.supportEmail} onChange={set("supportEmail")} />
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
          <Input label="Customer care number" value={form.customerCare} onChange={set("customerCare")} />
          <Input label="WhatsApp number" value={form.whatsapp} onChange={set("whatsapp")} hint="With country code, e.g. +91 98765 43210" />
          <Input label="Working hours" value={form.workingHours} onChange={set("workingHours")} placeholder="Mon–Sat, 10am–7pm" />
          <div className="sm:col-span-2"><Textarea label="Store address" rows={2} value={form.address} onChange={set("address")} /></div>
          <div className="sm:col-span-2"><Input label="Google Maps link" value={form.mapUrl} onChange={set("mapUrl")} placeholder="https://maps.google.com/…" /></div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Tax & invoices" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="GSTIN" value={form.gst} onChange={set("gst")} placeholder="27ABCDE1234F1Z5" />
          <Input label="PAN" value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" />
          <Input label="Invoice address line 1" value={form.invoiceAddress.line1 || ""} onChange={setAddr("line1")} />
          <Input label="Invoice address line 2" value={form.invoiceAddress.line2 || ""} onChange={setAddr("line2")} />
          <Input label="City" value={form.invoiceAddress.city || ""} onChange={setAddr("city")} />
          <Input label="State" value={form.invoiceAddress.state || ""} onChange={setAddr("state")} />
          <Input label="Pincode" value={form.invoiceAddress.pincode || ""} onChange={setAddr("pincode")} maxLength={6} />
          <Input label="Invoice number prefix" value={form.invoice.prefix} onChange={setInv("prefix")} />
          <div className="sm:col-span-2"><Input label="Invoice footer note" value={form.invoice.footerNote} onChange={setInv("footerNote")} /></div>
          <div className="sm:col-span-2"><Textarea label="Invoice terms & conditions" rows={3} value={form.invoice.termsAndConditions} onChange={setInv("termsAndConditions")} /></div>
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" isLoading={update.isPending}><Save size={14} /> Save company details</Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- Social

const SOCIALS: { key: string; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbrand" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbrand" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbrand" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/yourbrand" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourbrand" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/yourbrand" },
  { key: "whatsapp", label: "WhatsApp link or number", placeholder: "https://wa.me/919876543210" },
];

function SocialTab({ social }: { social: Record<string, string> }) {
  const update = useUpdateBrand();
  const [form, setForm] = useState<Record<string, string>>(() => Object.fromEntries(SOCIALS.map((s) => [s.key, social?.[s.key] || ""])));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate({ social: form });
      }}
    >
      <Card>
        <CardHeader title="Social links" description="Shown in the website footer and the app. Leave a field empty to hide it." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <Input key={s.key} label={s.label} value={form[s.key]} placeholder={s.placeholder} onChange={(e) => setForm((f) => ({ ...f, [s.key]: e.target.value }))} />
          ))}
        </CardBody>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit" isLoading={update.isPending}><Save size={14} /> Save social links</Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- Theme

const COLOR_FIELDS: { key: keyof BrandTheme; label: string; hint: string }[] = [
  { key: "primary", label: "Primary", hint: "Main actions, selected states" },
  { key: "secondary", label: "Secondary", hint: "Hover / pressed shade of primary" },
  { key: "accent", label: "Accent", hint: "Rose-gold details, eyebrows, links" },
  { key: "button", label: "Buttons", hint: "Primary buttons" },
  { key: "navbar", label: "Navbar", hint: "Website header background" },
  { key: "footer", label: "Footer", hint: "Website footer background" },
  { key: "background", label: "Background", hint: "Page background" },
  { key: "text", label: "Text", hint: "Headings and body text" },
  { key: "textMuted", label: "Muted text", hint: "Secondary text" },
];

function ThemeTab({ data }: { data: BrandAdminView }) {
  const update = useUpdateBrand();
  const reset = useResetBrand();
  const { defaults, fonts } = data.theme;
  const [theme, setTheme] = useState<BrandTheme>(data.theme.resolved);
  const [confirmReset, setConfirmReset] = useState(false);
  const changed = useMemo(() => (Object.keys(theme) as (keyof BrandTheme)[]).filter((k) => theme[k] !== data.theme.resolved[k]), [theme, data.theme.resolved]);

  const save = () => {
    // Values equal to the built-in default are stored empty, so future default changes still apply.
    const payload = Object.fromEntries((Object.keys(theme) as (keyof BrandTheme)[]).map((k) => [k, theme[k] === defaults[k] ? (k === "radius" ? null : "") : theme[k]]));
    update.mutate({ theme: payload });
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Colours" description="Applied to the website live. The mobile app keeps its own design." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELDS.map((f) => (
              <div key={f.key}>
                <p className="mb-1.5 text-sm font-medium text-ink">{f.label}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={String(theme[f.key])}
                    onChange={(e) => setTheme((t) => ({ ...t, [f.key]: e.target.value }))}
                    className="h-10 w-12 flex-none cursor-pointer rounded-lg border border-border bg-white p-1"
                    aria-label={f.label}
                  />
                  <Input value={String(theme[f.key])} onChange={(e) => setTheme((t) => ({ ...t, [f.key]: e.target.value }))} className="font-mono text-xs" maxLength={7} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {f.hint}
                  {theme[f.key] !== defaults[f.key] && (
                    <button type="button" className="ml-2 underline hover:text-ink" onClick={() => setTheme((t) => ({ ...t, [f.key]: defaults[f.key] }))}>default</button>
                  )}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Shape & typography" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Card corner radius: {theme.radius}px</p>
              <input type="range" min={0} max={40} value={theme.radius} onChange={(e) => setTheme((t) => ({ ...t, radius: Number(e.target.value) }))} className="w-full accent-[var(--color-brand)]" />
            </div>
            <Select label="Heading font" value={theme.headingFont} onChange={(e) => setTheme((t) => ({ ...t, headingFont: e.target.value }))}>
              {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
            <Select label="Body font" value={theme.bodyFont} onChange={(e) => setTheme((t) => ({ ...t, bodyFont: e.target.value }))}>
              {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </CardBody>
        </Card>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(true)}><RotateCcw size={14} /> Reset theme to default</Button>
          <Button onClick={save} isLoading={update.isPending} disabled={changed.length === 0}><Save size={14} /> Save theme</Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Preview</p>
        <ThemePreview theme={theme} logo={data.brand.logos.headerLogo} footerLogo={data.brand.logos.footerLogo} />
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => reset.mutate(["theme"], { onSuccess: () => setConfirmReset(false) })}
        title="Reset the theme to the built-in defaults?"
        description="Colours, corner radius and fonts go back to the original design on the website."
        confirmLabel="Reset theme"
        danger
        isLoading={reset.isPending}
      />
    </div>
  );
}

/** Miniature storefront using the edited theme. */
function ThemePreview({ theme, logo, footerLogo }: { theme: BrandTheme; logo: string; footerLogo: string }) {
  const fallback = `${import.meta.env.BASE_URL}logo.jpeg`;
  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm" style={{ background: theme.background, color: theme.text }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: theme.navbar, borderBottom: `1px solid ${theme.textMuted}22` }}>
        <img src={logo || fallback} alt="" className="h-8 w-auto object-contain" />
        <span className="text-[11px] uppercase tracking-widest" style={{ color: theme.textMuted }}>Shop · New · Sale</span>
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: theme.accent }}>New collection</p>
        <p className="mt-1 text-2xl leading-tight" style={{ fontFamily: `"${theme.headingFont}", serif` }}>Timeless elegance</p>
        <p className="mt-1 text-xs" style={{ color: theme.textMuted, fontFamily: `"${theme.bodyFont}", sans-serif` }}>Handcrafted jewellery for every moment.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="overflow-hidden bg-white shadow-sm" style={{ borderRadius: theme.radius }}>
              <div className="aspect-square" style={{ background: `${theme.accent}22` }} />
              <div className="p-2 text-xs">
                <p style={{ fontFamily: `"${theme.bodyFont}", sans-serif` }}>Kundan necklace</p>
                <p className="font-semibold" style={{ color: theme.primary }}>₹2,499</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full px-4 py-2 text-xs text-white" style={{ background: theme.button }}>Add to bag</span>
          <span className="rounded-full border px-4 py-2 text-xs" style={{ borderColor: theme.primary, color: theme.primary }}>Wishlist</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: theme.footer }}>
        <img src={footerLogo || logo || fallback} alt="" className="h-7 w-auto object-contain" />
        <span className="text-[10px] text-white/60">© Your brand</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Backup & reset

function BackupTab() {
  const importBrand = useImportBrand();
  const reset = useResetBrand();
  const [exporting, setExporting] = useState(false);
  const [pending, setPending] = useState<BrandExport | null>(null);
  const [confirmLogos, setConfirmLogos] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setExporting(true);
    try {
      const res = await brandApi.exportFile();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `brand-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== "abj-brand-settings") throw new Error("This isn't a brand settings export file");
      setPending(parsed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read the file");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Export" description="Download every brand setting as a JSON file — logos (as their Cloudinary links), company details, social links and theme." />
        <CardBody>
          <Button onClick={doExport} isLoading={exporting}><Download size={14} /> Export brand settings</Button>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Import" description="Apply a previously exported file — e.g. to copy branding from staging to production." />
        <CardBody>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import from file</Button>
        </CardBody>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader title="Reset" description="Return to the built-in defaults. Logo history is kept, so anything reset can be restored from a logo's history." />
        <CardBody className="flex flex-wrap gap-2">
          <Button variant="outline" className="text-danger" onClick={() => setConfirmLogos(true)}><RotateCcw size={14} /> Reset all logos</Button>
          <Button variant="outline" className="text-danger" onClick={() => reset.mutate(["theme"])} isLoading={reset.isPending && reset.variables?.length === 1 && reset.variables[0] === "theme"}>
            <RotateCcw size={14} /> Reset theme
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && importBrand.mutate(pending, { onSuccess: () => setPending(null) })}
        title="Import these brand settings?"
        description={`Exported ${pending?.exportedAt ? formatDateTime(String(pending.exportedAt)) : ""}. Company details, social links, theme and logos in the file replace the current ones.`}
        confirmLabel="Import"
        isLoading={importBrand.isPending}
      />
      <ConfirmDialog
        open={confirmLogos}
        onClose={() => setConfirmLogos(false)}
        onConfirm={() => reset.mutate(["logos"], { onSuccess: () => setConfirmLogos(false) })}
        title="Reset every logo to the built-in default?"
        description="The website, app, emails and invoices go back to the bundled logo. Each logo's history is kept for restoring."
        confirmLabel="Reset logos"
        danger
        isLoading={reset.isPending}
      />
    </div>
  );
}
