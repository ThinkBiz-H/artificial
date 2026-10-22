import { useState } from "react";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { useStaffList, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { useRoles } from "@/hooks/useRoles";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { useAuthStore } from "@/stores/auth.store";
import type { StaffAccount } from "@/types";

const emptyForm = { name: "", email: "", password: "", mobile: "", roleRef: "" };

export function StaffPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: staff, isLoading } = useStaffList();
  const { data: roleData } = useRoles();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const roles = roleData?.roles;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (s: StaffAccount) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email || "", password: "", mobile: s.mobile || "", roleRef: s.roleRef?._id || "" });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateStaff.mutate(
        { id: editing._id, values: { name: form.name, mobile: form.mobile, roleRef: form.roleRef || null } },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createStaff.mutate(
        { ...form, roleRef: form.roleRef || null },
        { onSuccess: () => setModalOpen(false) },
      );
    }
  };

  const toggleActive = (s: StaffAccount) =>
    updateStaff.mutate({ id: s._id, values: { isActive: !s.isActive } });

  return (
    <div>
      <PageHeader
        title="Staff"
        description={staff ? `${staff.length} staff accounts` : undefined}
        action={
          <Button onClick={openAdd}>
            <Plus size={15} /> Add staff
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
        ) : !staff || staff.length === 0 ? (
          <EmptyState icon={<UserCog size={18} />} title="No staff accounts yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {staff.map((s) => (
                <Tr key={s._id}>
                  <Td className="font-medium text-ink">{s.name}</Td>
                  <Td className="text-muted">{s.email}</Td>
                  <Td>
                    {s.roleRef ? (
                      <Badge className="!px-1.5 !py-0.5">{s.roleRef.name}</Badge>
                    ) : (
                      <span className="text-xs text-muted-light">Unrestricted (no role)</span>
                    )}
                  </Td>
                  <Td>
                    <button
                      onClick={() => toggleActive(s)}
                      disabled={s._id === currentUser?._id}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Badge tone={s.isActive ? "success" : "danger"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {s._id !== currentUser?._id && (
                        <button
                          onClick={() => setDeleteId(s._id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit staff account" : "Add staff account"}>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            disabled={!!editing}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {!editing && (
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          )}
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.roleRef}
            onChange={(e) => setForm((f) => ({ ...f, roleRef: e.target.value }))}
          >
            <option value="">Unrestricted (no role — full access)</option>
            {roles?.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Button type="submit" className="w-full" isLoading={createStaff.isPending || updateStaff.isPending}>
            Save staff account
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteStaff.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete staff account"
        confirmLabel="Delete"
        danger
        isLoading={deleteStaff.isPending}
      />
    </div>
  );
}
