import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CloudUpload, HardDrive } from "lucide-react";
import { apiClient } from "@/api/client";
import type { ApiEnvelope } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getErrorMessage } from "@/lib/utils";

type Stats = { documents: number; references: number; files: number; missing: number };

/**
 * Cloudinary status + one-click move of locally stored media. Uploads fall
 * back to the server's uploads/ folder while Cloudinary isn't configured.
 */
export function MediaStorageCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["media-storage"],
    queryFn: () => apiClient.get<ApiEnvelope<{ cloudinaryConfigured: boolean; local: Stats }>>("/admin/settings/media-storage").then((r) => r.data),
    select: (r) => r.data,
  });
  const migrate = useMutation({
    mutationFn: () => apiClient.post<ApiEnvelope<{ stats: Stats }>>("/admin/settings/media-storage/migrate", { deleteLocal: false }).then((r) => r.data),
    onSuccess: (r) => {
      toast.success(`Moved ${r.data.stats.files} file(s) to Cloudinary${r.data.stats.missing ? ` · ${r.data.stats.missing} missing` : ""}`);
      qc.invalidateQueries({ queryKey: ["media-storage"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Card>
      <CardHeader
        title="Cloudinary & media storage"
        description="Product, category and banner images are stored on Cloudinary. Without Cloudinary credentials, uploads are kept on this server and can be moved later."
        action={data && <Badge tone={data.cloudinaryConfigured ? "success" : "warning"}>{data.cloudinaryConfigured ? "Cloudinary connected" : "Using local storage"}</Badge>}
      />
      <CardBody className="space-y-4">
        {isLoading || !data ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
                <HardDrive size={20} className="text-brand" />
                <div>
                  <p className="text-xl font-semibold text-ink">{data.local.references}</p>
                  <p className="text-xs text-muted">media references stored locally ({data.local.documents} records)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
                <CloudUpload size={20} className="text-brand" />
                <div>
                  <p className="text-sm font-medium text-ink">{data.cloudinaryConfigured ? "Ready to migrate" : "Add credentials to migrate"}</p>
                  <p className="text-xs text-muted">CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend .env</p>
                </div>
              </div>
            </div>
            <Button onClick={() => migrate.mutate()} disabled={!data.cloudinaryConfigured || data.local.references === 0} isLoading={migrate.isPending}>
              <CloudUpload size={15} /> Move local media to Cloudinary
            </Button>
            <p className="text-xs text-muted">
              Safe to run more than once — each file is uploaded once and every product, category, banner and blog reference is updated. Command-line equivalent: <code className="font-mono">npm run media:migrate -- --apply</code>
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
