import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { AddressForm } from "@/components/account/AddressForm";
import type { Address } from "@/types";

export function AddressesPage() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [modal, setModal] = useState<{ open: boolean; editing?: Address }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold text-fg">Saved Addresses</h2>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus size={14} /> Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-7 w-7" strokeWidth={1.25} />}
          title="No saved addresses"
          description="Save an address for a faster checkout next time."
          action={<Button onClick={() => setModal({ open: true })}>Add address</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => {
            const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
            return (
              <div key={addr._id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-2 text-label font-semibold uppercase tracking-label text-fg">
                    {addr.type}
                    {addr.isDefault && <span className="rounded-2xl bg-surface-muted px-1.5 py-0.5 text-2xs text-accent">Default</span>}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ open: true, editing: addr })}
                      aria-label="Edit address"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-muted hover:text-fg"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(addr)}
                      aria-label="Delete address"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {name && <p className="mt-3 font-medium text-fg">{name}</p>}
                <p className="mt-1 leading-relaxed text-fg-soft">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  <br />
                  {addr.city}, {addr.state} {addr.pincode}
                  <br />
                  {addr.country}
                </p>
                {addr.phone && <p className="mt-1 text-fg-muted">{addr.phone}</p>}
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => updateAddress.mutate({ addressId: addr._id, payload: { isDefault: true } })}
                    className="mt-4 self-start text-xs font-semibold uppercase tracking-label text-accent hover:text-fg"
                  >
                    Set as default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.editing ? "Edit address" : "Add a new address"}>
        <AddressForm
          key={modal.editing?._id ?? "new"}
          initial={modal.editing}
          isLoading={addAddress.isPending || updateAddress.isPending}
          onSubmit={(payload) =>
            modal.editing
              ? updateAddress.mutate({ addressId: modal.editing._id, payload }, { onSuccess: () => setModal({ open: false }) })
              : addAddress.mutate(payload, { onSuccess: () => setModal({ open: false }) })
          }
        />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete address?">
        <p className="text-sm text-fg-muted">This address will be removed from your account.</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
            Keep
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={deleteAddress.isPending}
            onClick={() => confirmDelete && deleteAddress.mutate(confirmDelete._id, { onSuccess: () => setConfirmDelete(null) })}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
