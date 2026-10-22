import { useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck, Lock } from "lucide-react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/useRoles";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import type { PermissionEntry, Role } from "@/types";

const emptyForm = { name: "", description: "", permissions: [] as PermissionEntry[] };

/** Checkbox grid: 16 resources × 6 actions. Same shape the backend validates. */
function PermissionMatrix({
  value,
  onChange,
  disabled,
}: {
  value: PermissionEntry[];
  onChange: (next: PermissionEntry[]) => void;
  disabled?: boolean;
}) {
  const has = (resource: string, action: string) =>
    !!value.find((e) => e.resource === resource)?.actions.includes(action as never);

  const toggle = (resource: string, action: string) => {
    const next = value.map((e) => ({ ...e, actions: [...e.actions] }));
    let entry = next.find((e) => e.resource === resource);
    if (!entry) {
      entry = { resource: resource as PermissionEntry["resource"], actions: [] };
      next.push(entry);
    }
    const idx = entry.actions.indexOf(action as never);
    if (idx >= 0) entry.actions.splice(idx, 1);
    else entry.actions.push(action as never);
    onChange(next.filter((e) => e.actions.length > 0));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface/60">
          <tr>
            <th className="px-3 py-2 font-medium text-muted">Resource</th>
            {ACTIONS.map((a) => (
              <th key={a} className="px-3 py-2 text-center font-medium text-muted">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {RESOURCES.map((resource) => (
            <tr key={resource}>
              <td className="px-3 py-2 font-medium text-ink">{resource}</td>
              {ACTIONS.map((action) => (
                <td key={action} className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={has(resource, action)}
                    onChange={() => toggle(resource, action)}
                    className="accent-ink"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RolesPage() {
  const { data, isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const roles = data?.roles;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: Role) => {
    setEditing(r);
    setForm({ name: r.name, description: r.description || "", permissions: r.permissions });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateRole.mutate(
        { id: editing._id, values: form },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createRole.mutate(form, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        description={roles ? `${roles.length} roles` : undefined}
        action={
          <Button onClick={openAdd}>
            <Plus size={15} /> Add role
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Role</Th>
                <Th>Description</Th>
                <Th>Staff assigned</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {roles?.map((r) => (
                <Tr key={r._id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {r.isSuperAdmin ? (
                        <ShieldCheck size={14} className="text-brass" />
                      ) : r.isSystem ? (
                        <Lock size={13} className="text-muted-light" />
                      ) : null}
                      <span className="font-medium text-ink">{r.name}</span>
                      {r.isSystem && (
                        <Badge className="!px-1.5 !py-0.5 text-[10px]">system</Badge>
                      )}
                    </div>
                  </Td>
                  <Td className="text-muted">{r.description || "—"}</Td>
                  <Td>{r.userCount ?? 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {!r.isSystem && (
                        <button
                          onClick={() => setDeleteId(r._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit role — ${editing.name}` : "Add role"}
        className="max-w-3xl"
      >
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Name"
            required
            disabled={!!editing?.isSystem}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          {editing?.isSuperAdmin ? (
            <p className="rounded-lg bg-surface p-3 text-xs text-muted">
              Super Admin always has full, unrestricted access — its permissions cannot be edited.
            </p>
          ) : (
            <PermissionMatrix
              value={form.permissions}
              onChange={(permissions) => setForm((f) => ({ ...f, permissions }))}
            />
          )}
          <Button
            type="submit"
            className="w-full"
            isLoading={createRole.isPending || updateRole.isPending}
          >
            Save role
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteRole.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete role"
        confirmLabel="Delete"
        danger
        isLoading={deleteRole.isPending}
      />
    </div>
  );
}
