import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { useCustomerList, useUpdateCustomerStatus, useDeleteCustomer } from "@/hooks/useCustomers";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";

/** Business account segments. */
const TABS = [
  { id: "all", label: "All buyers", filter: {} },
  { id: "retailer", label: "Retailers", filter: { customerType: "retailer" } },
  { id: "wholesale", label: "Wholesale", filter: { customerType: "wholesale" } },
  { id: "dealer", label: "Dealers", filter: { customerType: "dealer" } },
  { id: "distributor", label: "Distributors", filter: { customerType: "distributor" } },
  { id: "pending", label: "Pending verification", filter: { verification: "pending" } },
] as const;

export function CustomersListPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const tabFilter = TABS.find((t) => t.id === tab)!.filter;

  const { data, isLoading } = useCustomerList({ page, limit: 15, keyword: keyword || undefined, sort: "-createdAt", ...tabFilter });
  const updateStatus = useUpdateCustomerStatus();
  const deleteCustomer = useDeleteCustomer();

  return (
    <div>
      <PageHeader title="Customers" description={data ? `${data.pagination.total} customers` : undefined} />

      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={`flex-none border-b-2 px-3 pb-2.5 text-sm font-medium ${tab === t.id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="border-b border-border p-4">
          <SearchInput value={keyword} onChange={(v) => { setKeyword(v); setPage(1); }} placeholder="Search by name or email…" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !data || data.users.length === 0 ? (
          <EmptyState icon={<Users size={18} />} title="No customers found" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Mobile</Th>
                  <Th>Account</Th>
                  <Th>Joined</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.users.map((u) => (
                  <Tr key={u._id}>
                    <Td>
                      <Link to="/customers/$customerId" params={{ customerId: u._id }} className="hover:underline">
                        <p className="text-sm font-medium text-ink">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </Link>
                    </Td>
                    <Td className="text-sm text-muted">{u.mobile || "—"}</Td>
                    <Td>
                      <Badge tone={u.customerType === "dealer" || u.customerType === "distributor" ? "info" : u.customerType === "retailer" || u.customerType === "retail" ? "neutral" : "success"}>{u.customerType ?? "wholesale"}</Badge>
                      {u.businessProfile?.name && <p className="mt-1 max-w-[180px] truncate text-xs text-muted">{u.businessProfile.name}</p>}
                      {u.businessVerification?.status === "verified" && <p className="text-[11px] font-medium text-success">✓ Verified business</p>}
                    </Td>
                    <Td className="text-sm text-muted">{formatDate(u.createdAt)}</Td>
                    <Td><Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Blocked"}</Badge></Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => updateStatus.mutate({ id: u._id, isActive: !u.isActive })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                          aria-label={u.isActive ? "Block customer" : "Unblock customer"}
                        >
                          {u.isActive ? <ShieldBan size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button onClick={() => setDeleteId(u._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete customer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCustomer.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete customer"
        description="This will permanently delete the customer account."
        confirmLabel="Delete"
        danger
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
