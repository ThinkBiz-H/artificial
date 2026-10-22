import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminOpsApi, type ReturnUpdate, type TicketPriority, type TicketStatus } from "@/api/adminOps";
import { getErrorMessage } from "@/lib/utils";

/* ---------------------------------------------------------------- Customers */

export function useCustomerOverview(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-overview", id],
    queryFn: () => adminOpsApi.customerOverview(id as string),
    enabled: !!id,
    select: (r) => r.data,
  });
}

export function useSetCustomerVerified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => adminOpsApi.setVerified(id, isVerified),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["admin-customer", v.id] });
      qc.invalidateQueries({ queryKey: ["admin-customer-overview", v.id] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success(v.isVerified ? "Customer verified" : "Verification removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCustomerSessions(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-customer-sessions", id],
    queryFn: () => adminOpsApi.sessions(id as string),
    enabled: !!id,
    select: (r) => r.data.sessions,
  });
}

export function useRevokeCustomerSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sessionId }: { id: string; sessionId?: string }) =>
      sessionId ? adminOpsApi.revokeSession(id, sessionId) : adminOpsApi.revokeAllSessions(id),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["admin-customer-sessions", v.id] });
      qc.invalidateQueries({ queryKey: ["admin-customer-overview", v.id] });
      toast.success(v.sessionId ? "Device logged out" : "Logged out of all devices");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useMySessions() {
  return useQuery({ queryKey: ["my-sessions"], queryFn: () => adminOpsApi.mySessions(), select: (r) => r.data.sessions });
}

export function useRevokeMySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId?: string) => (sessionId ? adminOpsApi.revokeMySession(sessionId) : adminOpsApi.logoutOtherDevices()),
    onSuccess: (_, sessionId) => {
      qc.invalidateQueries({ queryKey: ["my-sessions"] });
      toast.success(sessionId ? "Device logged out" : "Logged out of all other devices");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/* ---------------------------------------------------------------- Transactions & returns */

export function useTransactions(params: Parameters<typeof adminOpsApi.transactions>[0]) {
  return useQuery({
    queryKey: ["admin-transactions", params],
    queryFn: () => adminOpsApi.transactions(params),
    select: (r) => r.data,
    placeholderData: (p) => p,
  });
}

export function useReturns(params: Parameters<typeof adminOpsApi.returns>[0]) {
  return useQuery({
    queryKey: ["admin-returns", params],
    queryFn: () => adminOpsApi.returns(params),
    select: (r) => r.data,
    placeholderData: (p) => p,
  });
}

export function useUpdateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: ReturnUpdate }) => adminOpsApi.updateReturn(orderId, body),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["admin-returns"] });
      qc.invalidateQueries({ queryKey: ["admin-order", v.orderId] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Return updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/* ---------------------------------------------------------------- Support */

export function useTickets(params: Parameters<typeof adminOpsApi.tickets>[0]) {
  return useQuery({
    queryKey: ["admin-tickets", params],
    queryFn: () => adminOpsApi.tickets(params),
    select: (r) => r.data,
    placeholderData: (p) => p,
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null } }) =>
      adminOpsApi.updateTicket(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => adminOpsApi.replyTicket(id, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Reply sent to the customer");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/* ---------------------------------------------------------------- Notifications & search */

export function useNotificationStats(days = 30) {
  return useQuery({ queryKey: ["admin-notification-stats", days], queryFn: () => adminOpsApi.notificationStats(days), select: (r) => r.data });
}

export function useGlobalSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ["admin-global-search", term],
    queryFn: () => adminOpsApi.search(term),
    enabled: term.length >= 2,
    select: (r) => r.data.results,
    placeholderData: (p) => p,
    staleTime: 30_000,
  });
}
