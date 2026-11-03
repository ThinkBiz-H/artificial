import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ImagePlus, Save, Search, Send, Smartphone, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { CampaignAudience, CampaignCategory, CampaignInput, NotificationCampaign } from "@/api/notifications";
import { customersApi } from "@/api/customers";
import { mediaApi } from "@/api/media";
import { useTemplates } from "@/hooks/useNotificationsAdmin";
import { useAudienceEstimate, useCampaignAction, useCreateCampaign, useSendTestPush, useUpdateCampaign } from "@/hooks/useNotificationCampaigns";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn, formatNumber, getErrorMessage } from "@/lib/utils";
import { PushPreview } from "./PushPreview";
import { CATEGORY_LABELS, LINK_PRESETS, buildLink, parseLink } from "./campaignMeta";

type Delivery = "now" | "schedule" | "draft";
interface PickedUser {
  _id: string;
  name: string;
  email?: string;
}

const AUDIENCES: { value: CampaignAudience["type"]; label: string; hint: string }[] = [
  { value: "all", label: "All customers", hint: "Every active customer account" },
  { value: "users", label: "Selected customers", hint: "Pick specific customers" },
  { value: "topic", label: "Topic", hint: "Every device subscribed to a topic — including signed-out app users" },
  { value: "admins", label: "Admins", hint: "Your team's admin accounts" },
];

/** datetime-local value for "now + minutes" in local time. */
const localInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Composer start state — empty, or the draft/scheduled notification being edited. */
function initialValues(editing?: NotificationCampaign | null) {
  const { preset, param } = parseLink(editing?.link || "");
  const scheduled = editing?.status === "scheduled" && editing.scheduledAt;
  return {
    title: editing?.title ?? "",
    body: editing?.body ?? "",
    imageUrl: editing?.imageUrl ?? "",
    category: (editing?.category ?? "promotional") as CampaignCategory,
    linkPreset: preset,
    linkParam: param,
    audienceType: (editing?.audience.type ?? "all") as CampaignAudience["type"],
    users: (editing?.audience.userIds ?? []).map((u): PickedUser => (typeof u === "string" ? { _id: u, name: u } : { _id: u._id, name: u.name, email: u.email })),
    topic: editing?.audience.topic || "promotions",
    saveInApp: editing?.saveInApp ?? true,
    delivery: (editing ? (scheduled ? "schedule" : "draft") : "now") as Delivery,
    scheduledAt: localInputValue(scheduled ? new Date(editing!.scheduledAt as string) : new Date(Date.now() + 60 * 60 * 1000)),
  };
}

export function CampaignComposer({ editing, topics, onDone }: { editing?: NotificationCampaign | null; topics: string[]; onDone?: () => void }) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const sendTest = useSendTestPush();
  const campaignAction = useCampaignAction();
  const { data: pushTemplates } = useTemplates({ channel: "push" });

  // Remounted per campaign (key) — state starts from the campaign being edited.
  const [initial] = useState(() => initialValues(editing));
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [category, setCategory] = useState<CampaignCategory>(initial.category);
  const [linkPreset, setLinkPreset] = useState(initial.linkPreset);
  const [linkParam, setLinkParam] = useState(initial.linkParam);
  const [audienceType, setAudienceType] = useState<CampaignAudience["type"]>(initial.audienceType);
  const [users, setUsers] = useState<PickedUser[]>(initial.users);
  const [topic, setTopic] = useState(initial.topic);
  const [saveInApp, setSaveInApp] = useState(initial.saveInApp);
  const [delivery, setDelivery] = useState<Delivery>(initial.delivery);
  const [scheduledAt, setScheduledAt] = useState(initial.scheduledAt);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const link = buildLink(linkPreset, linkParam);
  const audience: CampaignAudience = useMemo(
    () => ({
      type: audienceType,
      userIds: audienceType === "users" ? users.map((u) => u._id) : [],
      topic: audienceType === "topic" ? topic.trim() : "",
    }),
    [audienceType, users, topic],
  );
  const { data: estimate, isFetching: estimating } = useAudienceEstimate(audience);

  const applyTemplate = (id: string) => {
    const t = pushTemplates?.find((x) => x._id === id);
    if (!t) return;
    setTitle(t.subject || t.name || title);
    setBody(t.body);
    if (t.imageUrl) setImageUrl(t.imageUrl);
    if (t.link) {
      const { preset, param } = parseLink(t.link);
      setLinkPreset(preset);
      setLinkParam(param);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await mediaApi.upload([file]);
      const url = res.data.media[0]?.url;
      if (url) setImageUrl(url);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const payload = (): CampaignInput => ({
    title: title.trim(),
    body: body.trim(),
    imageUrl: imageUrl.trim(),
    link,
    category,
    audience,
    saveInApp: audienceType === "topic" ? false : saveInApp,
    scheduledAt: delivery === "schedule" ? new Date(scheduledAt).toISOString() : null,
  });

  const reset = () => {
    setTitle("");
    setBody("");
    setImageUrl("");
    setLinkPreset("");
    setLinkParam("");
    setUsers([]);
    setDelivery("now");
  };

  const submit = () => {
    const values = payload();
    const done = () => {
      reset();
      onDone?.();
    };
    if (editing) {
      updateCampaign.mutate(
        { id: editing._id, values },
        {
          onSuccess: () => {
            // Saved — now send it.
            if (delivery === "now") campaignAction.mutate({ id: editing._id, action: "send" });
            done();
          },
        },
      );
    } else {
      createCampaign.mutate({ ...values, sendNow: delivery === "now" }, { onSuccess: done });
    }
  };

  const onPrimary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return toast.error("Add a title and a message");
    if (audienceType === "users" && users.length === 0) return toast.error("Select at least one customer");
    if (delivery === "schedule" && new Date(scheduledAt).getTime() < Date.now()) return toast.error("Pick a time in the future");
    // Sending to everyone right now deserves a second look.
    if (delivery === "now" && (audienceType === "all" || audienceType === "topic")) return setConfirmOpen(true);
    submit();
  };

  const busy = createCampaign.isPending || updateCampaign.isPending || campaignAction.isPending;
  const primaryLabel = delivery === "now" ? "Send now" : delivery === "schedule" ? "Schedule" : "Save draft";
  const linkMeta = LINK_PRESETS.find((p) => p.value === linkPreset);

  return (
    <form onSubmit={onPrimary} className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title={editing ? "Edit notification" : "Compose"} description="Push to phones, plus a copy in each customer's in-app inbox." />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Start from a template" value="" onChange={(e) => applyTemplate(e.target.value)} disabled={!pushTemplates?.length}>
                <option value="">{pushTemplates?.length ? "Choose a push template…" : "No push templates yet"}</option>
                {pushTemplates?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name || t.type}
                  </option>
                ))}
              </Select>
              <Select label="Type" value={category} onChange={(e) => setCategory(e.target.value as CampaignCategory)}>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <Input label="Title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} hint={`${title.length}/120 · keep it under ~45 characters so it isn't cut off`} placeholder="Flash sale: 40% off bridal sets" />
            <Textarea label="Message" rows={3} value={body} maxLength={500} onChange={(e) => setBody(e.target.value)} hint={`${body.length}/500`} placeholder="Today only — shop the collection before it's gone." />

            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Image (optional)</p>
              <div className="flex gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://… (2:1 works best, e.g. 1024×512)" className="flex-1" />
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} isLoading={uploading}>
                  <ImagePlus size={14} /> Upload
                </Button>
                {imageUrl && (
                  <Button type="button" variant="ghost" onClick={() => setImageUrl("")} aria-label="Remove image">
                    <X size={14} />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Opens" value={linkPreset} onChange={(e) => { setLinkPreset(e.target.value); setLinkParam(""); }}>
                {LINK_PRESETS.map((p) => (
                  <option key={p.value || "none"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
              {linkMeta?.needs && (
                <Input label={linkMeta.needs === "query" ? "Search for" : linkPreset === "custom" ? "Path or URL" : "Slug"} value={linkParam} onChange={(e) => setLinkParam(e.target.value)} placeholder={linkMeta.placeholder} hint={link ? `Deep link: ${link}` : undefined} />
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Audience" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudienceType(a.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    audienceType === a.value ? "border-ink bg-surface" : "border-border hover:border-ink/40",
                  )}
                >
                  <p className="text-sm font-medium text-ink">{a.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{a.hint}</p>
                </button>
              ))}
            </div>

            {audienceType === "users" && <UserPicker value={users} onChange={setUsers} />}
            {audienceType === "topic" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Topic" value={topics.includes(topic) ? topic : "__custom"} onChange={(e) => setTopic(e.target.value === "__custom" ? "" : e.target.value)}>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t === "all" ? "all — every app install" : t === "promotions" ? "promotions — marketing opt-in" : t}
                    </option>
                  ))}
                  <option value="__custom">Custom topic…</option>
                </Select>
                {!topics.includes(topic) && <Input label="Custom topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="diwali-2026" />}
              </div>
            )}

            <p className="flex items-center gap-2 text-sm text-muted">
              <Users size={14} />
              {audienceType === "topic"
                ? "Delivered by Firebase to every device subscribed to this topic."
                : estimating
                  ? "Counting…"
                  : estimate
                    ? `${formatNumber(estimate.users)} customer(s) · ${formatNumber(estimate.devices)} device(s) with the app`
                    : "—"}
            </p>

            {audienceType !== "topic" && (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={saveInApp} onChange={(e) => setSaveInApp(e.target.checked)} />
                Also add to each customer's in-app notifications
              </label>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Delivery" />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["now", "Send now", Send],
                  ["schedule", "Schedule", CalendarClock],
                  ["draft", "Save as draft", Save],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDelivery(value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    delivery === value ? "border-ink bg-surface font-medium" : "border-border text-muted hover:text-ink",
                  )}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            {delivery === "schedule" && (
              <Input type="datetime-local" label="Send at" value={scheduledAt} min={localInputValue(new Date())} onChange={(e) => setScheduledAt(e.target.value)} hint="Your local time" className="max-w-xs" />
            )}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button type="submit" isLoading={busy}>
                {delivery === "now" ? <Send size={14} /> : delivery === "schedule" ? <CalendarClock size={14} /> : <Save size={14} />} {primaryLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                isLoading={sendTest.isPending}
                disabled={!title.trim() || !body.trim()}
                onClick={() => sendTest.mutate({ title: title.trim(), body: body.trim(), imageUrl: imageUrl.trim(), link })}
              >
                <Smartphone size={14} /> Send test to my phone
              </Button>
              {editing && (
                <Button type="button" variant="ghost" onClick={() => { reset(); onDone?.(); }}>
                  Cancel editing
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted">Preview</p>
        <PushPreview title={title} body={body} imageUrl={imageUrl} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          submit();
        }}
        title={audienceType === "topic" ? `Send to topic "${topic}" now?` : "Send to all customers now?"}
        description={
          audienceType === "topic"
            ? "Every device subscribed to this topic receives it immediately."
            : `${formatNumber(estimate?.users ?? 0)} customer(s) receive this immediately. This can't be undone.`
        }
        confirmLabel="Send now"
        isLoading={busy}
      />
    </form>
  );
}

/** Search-and-pick customers for a targeted notification. */
function UserPicker({ value, onChange }: { value: PickedUser[]; onChange: (users: PickedUser[]) => void }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);
  const { data, isFetching } = useQuery({
    queryKey: ["admin-customers-picker", debounced],
    queryFn: () => customersApi.list({ keyword: debounced, limit: 8 }),
    enabled: debounced.length >= 2,
    select: (r) => r.data.users,
  });
  const picked = new Set(value.map((u) => u._id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search customers by name or email…" className="pl-9" />
        {debounced.length >= 2 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            {isFetching && !data ? (
              <p className="px-3 py-2 text-sm text-muted">Searching…</p>
            ) : !data?.length ? (
              <p className="px-3 py-2 text-sm text-muted">No customers found</p>
            ) : (
              data.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  disabled={picked.has(u._id)}
                  onClick={() => {
                    onChange([...value, { _id: u._id, name: u.name, email: u.email }]);
                    setTerm("");
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface disabled:opacity-40"
                >
                  <span className="font-medium text-ink">{u.name}</span>
                  <span className="text-xs text-muted">{u.email || u.mobile}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((u) => (
            <span key={u._id} className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs text-ink">
              {u.name}
              <button type="button" onClick={() => onChange(value.filter((x) => x._id !== u._id))} aria-label={`Remove ${u.name}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
