import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLog";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatDateTime } from "@/lib/utils";

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page, limit: 20 });

  return (
    <div>
      <PageHeader title="Audit log" description="System-recorded admin actions" />
      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !data || data.logs.length === 0 ? (
          <EmptyState icon={<ScrollText size={18} />} title="No audit log entries yet" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>User</Th>
                  <Th>Method</Th>
                  <Th>Route</Th>
                  <Th>Status</Th>
                  <Th>IP</Th>
                  <Th className="text-right">Time</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.logs.map((log) => (
                  <Tr key={log._id}>
                    <Td className="text-sm">{typeof log.user === "object" ? log.user?.name : "—"}</Td>
                    <Td className="font-mono text-xs">{log.method}</Td>
                    <Td className="font-mono text-xs text-muted">{log.route}</Td>
                    <Td className="text-sm">{log.statusCode}</Td>
                    <Td className="text-xs text-muted">{log.ip}</Td>
                    <Td className="text-right text-xs text-muted">{formatDateTime(log.createdAt)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
