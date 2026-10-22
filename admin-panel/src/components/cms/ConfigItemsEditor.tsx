import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

export interface ConfigItem {
  icon?: string;
  title?: string;
  description?: string;
  value?: number;
  suffix?: string;
  label?: string;
}

export const ICON_OPTIONS = [
  "Hand",
  "Droplet",
  "ShieldCheck",
  "Gem",
  "Package",
  "Heart",
  "Sparkles",
  "PenTool",
  "Palette",
  "Layers",
  "PackageCheck",
  "Clock",
  "Flame",
  "Wand2",
  "Truck",
  "SprayCan",
  "Settings2",
  "BadgeCheck",
] as const;

export function ConfigItemsEditor({
  label,
  items,
  onChange,
  numeric = false,
}: {
  label: string;
  items: ConfigItem[];
  onChange: (items: ConfigItem[]) => void;
  /** When true, rows collect {icon, value, suffix, label} for stat counters instead of {icon, title, description}. */
  numeric?: boolean;
}) {
  const update = (index: number, patch: Partial<ConfigItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([
      ...items,
      numeric
        ? { icon: ICON_OPTIONS[0], value: 0, suffix: "", label: "" }
        : { icon: ICON_OPTIONS[0], title: "", description: "" },
    ]);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="flex items-start gap-2">
              <Select
                value={item.icon || ICON_OPTIONS[0]}
                onChange={(e) => update(i, { icon: e.target.value })}
                className="w-28 shrink-0"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
              {numeric ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Value"
                      value={item.value ?? 0}
                      onChange={(e) => update(i, { value: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Suffix (e.g. +, %)"
                      value={item.suffix || ""}
                      onChange={(e) => update(i, { suffix: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Label"
                    value={item.label || ""}
                    onChange={(e) => update(i, { label: e.target.value })}
                  />
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Title"
                    value={item.title || ""}
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description"
                    value={item.description || ""}
                    onChange={(e) => update(i, { description: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                aria-label="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={add}>
        <Plus size={14} /> Add item
      </Button>
    </div>
  );
}
