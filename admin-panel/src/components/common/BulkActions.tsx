import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getErrorMessage } from "@/lib/utils";

/** Row selection for a list page (ids of the current page). */
export function useSelection(ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const visible = ids.filter((id) => selected.has(id));
  const allSelected = ids.length > 0 && visible.length === ids.length;
  return {
    selected: visible,
    isSelected: (id: string) => selected.has(id),
    toggle: (id: string) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    allSelected,
    toggleAll: () => setSelected(allSelected ? new Set() : new Set(ids)),
    clear: () => setSelected(new Set()),
  };
}

export interface BulkAction {
  label: string;
  /** Runs once per selected id; failures are counted and reported. */
  run: (id: string) => Promise<unknown>;
  variant?: "primary" | "outline" | "danger";
  /** Asks for confirmation first (deletes). */
  confirm?: string;
}

/** Bar shown above a table while rows are selected. */
export function BulkActionBar({
  selection,
  actions,
  onDone,
  extra,
}: {
  selection: ReturnType<typeof useSelection>;
  actions: BulkAction[];
  onDone: () => void;
  extra?: React.ReactNode;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<BulkAction | null>(null);
  const count = selection.selected.length;
  if (count === 0) return null;

  const execute = async (action: BulkAction) => {
    setBusy(action.label);
    const results = await Promise.allSettled(selection.selected.map((id) => action.run(id)));
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    setBusy(null);
    setPending(null);
    selection.clear();
    onDone();
    if (failed.length === 0) toast.success(`${action.label}: ${count} item${count === 1 ? "" : "s"} done`);
    else toast.error(`${action.label}: ${failed.length} of ${count} failed — ${getErrorMessage(failed[0].reason)}`);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface/60 px-4 py-2.5 text-sm">
        <span className="font-medium">{count} selected</span>
        {actions.map((a) => (
          <Button
            key={a.label}
            size="sm"
            variant={a.variant ?? "outline"}
            isLoading={busy === a.label}
            disabled={!!busy}
            onClick={() => (a.confirm ? setPending(a) : execute(a))}
          >
            {a.label}
          </Button>
        ))}
        {extra}
        <Button size="sm" variant="ghost" onClick={selection.clear}>Clear</Button>
      </div>
      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending?.confirm ?? ""}
        description={`This applies to ${count} selected item${count === 1 ? "" : "s"}.`}
        confirmLabel={pending?.label}
        isLoading={!!busy}
        onConfirm={() => pending && execute(pending)}
      />
    </>
  );
}

/** Downloads rows as a CSV file (client-side export of the current list). */
export function exportCsv(filename: string, rows: Record<string, string | number | boolean | null | undefined>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
