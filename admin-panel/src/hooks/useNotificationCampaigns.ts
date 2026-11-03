import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsAdminApi, type CampaignAudience, type CampaignInput } from "@/api/notifications";
import { getErrorMessage } from "@/lib/utils";

const LIST_KEY = ["admin-campaigns"];
const SUMMARY_KEY = ["admin-campaign-summary"];

function useInvalidateCampaigns() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: LIST_KEY });
    qc.invalidateQueries({ queryKey: SUMMARY_KEY });
  };
}

export function useCampaigns(params: { status?: string; category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...LIST_KEY, params],
    queryFn: () => notificationsAdminApi.campaigns(params),
    select: (r) => r.data,
    placeholderData: keepPreviousData,
    // While a campaign is sending, poll until it finishes (realtime events
    // also refresh this; polling covers a dropped socket).
    refetchInterval: (query) =>
      query.state.data?.data.campaigns.some((c) => c.status === "sending") ? 2000 : false,
  });
}

export function useCampaignSummary(days = 30) {
  return useQuery({ queryKey: [...SUMMARY_KEY, days], queryFn: () => notificationsAdminApi.campaignSummary(days), select: (r) => r.data });
}

export function useAudienceEstimate(audience: CampaignAudience, enabled = true) {
  return useQuery({
    queryKey: ["admin-campaign-estimate", audience],
    queryFn: () => notificationsAdminApi.estimate(audience),
    select: (r) => r.data,
    enabled: enabled && audience.type !== "topic" && (audience.type !== "users" || (audience.userIds?.length ?? 0) > 0),
    staleTime: 30_000,
  });
}

export function useCreateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: (values: CampaignInput & { sendNow?: boolean }) => notificationsAdminApi.createCampaign(values),
    onSuccess: (r) => {
      invalidate();
      toast.success(r.message || "Saved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateCampaign() {
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<CampaignInput> }) => notificationsAdminApi.updateCampaign(id, values),
    onSuccess: () => {
      invalidate();
      toast.success("Notification updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/** send | retry | cancel | duplicate | delete on one campaign. */
export function useCampaignAction() {
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "send" | "retry" | "cancel" | "duplicate" | "delete" }) => {
      switch (action) {
        case "send":
          return notificationsAdminApi.sendCampaign(id);
        case "retry":
          return notificationsAdminApi.retryCampaign(id);
        case "cancel":
          return notificationsAdminApi.cancelCampaign(id);
        case "duplicate":
          return notificationsAdminApi.duplicateCampaign(id);
        default:
          return notificationsAdminApi.deleteCampaign(id);
      }
    },
    onSuccess: (r) => {
      invalidate();
      toast.success(r.message || "Done");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useSendTestPush() {
  return useMutation({
    mutationFn: (values: { title: string; body: string; imageUrl?: string; link?: string }) => notificationsAdminApi.sendTest(values),
    onSuccess: (r) => toast.success(r.message || "Test sent"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/** Re-queue failed automatic deliveries (order/payment pushes, emails, SMS). */
export function useRetryFailedDeliveries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsAdminApi.retryFailedDeliveries(7),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["admin-notification-stats"] });
      toast.success(r.message);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
