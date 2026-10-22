import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { useCustomer, useUpdateCustomerStatus, usePermissionCatalog, useDeleteCustomer } from "@/hooks/useCustomers";
import { useCustomerOverview, useCustomerSessions, useRevokeCustomerSession, useSetCustomerVerified } from "@/hooks/useAdminOps";
import { StatCard } from "@/components/common/StatCard";
import { DevicesCard } from "@/components/common/DevicesCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { customersApi } from "@/api/customers";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function CustomerDetailPage() {
  const { customerId } = useParams({ strict: false }) as { customerId: string };
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: permissionCatalog } = usePermissionCatalog();
  const updateStatus = useUpdateCustomerStatus();
  const { data: overview, isLoading: loadingOverview } = useCustomerOverview(customerId);
  const { data: sessions } = useCustomerSessions(customerId);
  const revokeSession = useRevokeCustomerSession();
  const setVerified = useSetCustomerVerified();
  const deleteCustomer = useDeleteCustomer();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const qc = useQueryClient();

  const [permissions, setPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
// oxlint-disable-next-line react/set-state-in-effect -- syncing fetched entity into local editable state
    if (customer) setPermissions(customer.permissions || []);
  }, [customer]);

  const togglePermission = (perm: string) => {
    setPermissions((p) => (p.includes(perm) ? p.filter((x) => x !== perm) : [...p, perm]));
  };

  const savePermissions = async () => {
    setSavingPermissions(true);
    try {
      await customersApi.updatePermissions(customerId, permissions);
      qc.invalidateQueries({ queryKey: ["admin-customer", customerId] });
      toast.success("Permissions updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPermissions(false);
    }
  };

  if (isLoading || !customer) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.email}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/customers" })}>
            <ArrowLeft size={14} /> Back to customers
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total spent" value={formatCurrency(overview?.stats.totalSpent)} isLoading={loadingOverview} />
        <StatCard label="Orders" value={formatNumber(overview?.stats.orderCount)} isLoading={loadingOverview} />
        <StatCard label="Last login" value={<span className="text-base">{overview?.lastLogin ? formatDateTime(overview.lastLogin.at) : "—"}</span>} isLoading={loadingOverview} />
        <StatCard label="Active devices" value={formatNumber(overview?.activeSessions)} isLoading={loadingOverview} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Details" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Mobile</span><span>{customer.mobile || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted">Role</span><Badge>{customer.role}</Badge></div>
            <div className="flex justify-between"><span className="text-muted">Status</span><Badge tone={customer.isActive ? "success" : "danger"}>{customer.isActive ? "Active" : "Blocked"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted">Verified</span><span>{customer.isVerified ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted">Joined</span><span>{formatDate(customer.createdAt)}</span></div>
            <Button
              variant={customer.isActive ? "danger" : "primary"}
              size="sm"
              className="w-full"
              isLoading={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ id: customer._id, isActive: !customer.isActive })}
            >
              {customer.isActive ? <><ShieldBan size={14} /> Block customer</> : <><ShieldCheck size={14} /> Unblock customer</>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              isLoading={setVerified.isPending}
              onClick={() => setVerified.mutate({ id: customer._id, isVerified: !customer.isVerified })}
            >
              <BadgeCheck size={14} /> {customer.isVerified ? "Remove verification" : "Mark as verified"}
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete account
            </Button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Addresses" />
          <CardBody>
            {!customer.address || customer.address.length === 0 ? (
              <p className="text-sm text-muted">No saved addresses.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customer.address.map((addr) => (
                  <div key={addr._id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-ink">{addr.type}{addr.isDefault && " · Default"}</p>
                    <p className="mt-1 text-muted">
                      {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                      {addr.city}, {addr.state} {addr.pincode}<br />
                      {addr.country}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Order history" description={overview?.stats.lastOrderAt ? `Last order ${formatDate(overview.stats.lastOrderAt)}` : undefined} />
          <CardBody className="p-0">
            {!overview ? (
              <div className="p-5"><Skeleton className="h-32 w-full" /></div>
            ) : overview.recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-muted">No orders yet.</p>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th className="text-right">Total</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {overview.recentOrders.map((o) => (
                    <Tr key={o._id}>
                      <Td>
                        <Link to="/orders/$orderId" params={{ orderId: o._id }} className="font-mono text-xs hover:underline">{o.orderNumber}</Link>
                      </Td>
                      <Td className="text-xs text-muted">{formatDate(o.createdAt)}</Td>
                      <Td><Badge>{o.orderStatus}</Badge></Td>
                      <Td className="text-xs">{o.paymentMethod === "cod" ? "COD" : "Online"} · <Badge>{o.paymentStatus}</Badge></Td>
                      <Td className="text-right font-mono text-xs">{formatCurrency(o.grandTotal)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        <DevicesCard
          sessions={sessions}
          busy={revokeSession.isPending}
          onLogout={(sessionId) => revokeSession.mutate({ id: customer._id, sessionId })}
          onLogoutAll={() => revokeSession.mutate({ id: customer._id })}
        />

        {customer.role === "admin" && permissionCatalog && (
          <Card className="lg:col-span-3">
            <CardHeader title="Admin permissions" description="Leave all unchecked to grant unrestricted access." action={
              <Button size="sm" onClick={savePermissions} isLoading={savingPermissions}>Save permissions</Button>
            } />
            <CardBody>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {permissionCatalog.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} />
                    {perm}
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this account?"
        description="The customer and their saved data are removed permanently. Orders stay on record."
        confirmLabel="Delete account"
        isLoading={deleteCustomer.isPending}
        onConfirm={() =>
          deleteCustomer.mutate(customer._id, {
            onSuccess: () => navigate({ to: "/customers" }),
          })
        }
      />
    </div>
  );
}
