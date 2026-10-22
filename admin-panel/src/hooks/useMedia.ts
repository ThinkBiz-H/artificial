import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/api/media";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useMediaFolders() {
  return useQuery({ queryKey: ["media-folders"], queryFn: () => mediaApi.listFolders(), select: (r) => r.data.folders });
}

export function useMediaList(params: { folderId?: string; type?: string; keyword?: string; page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ["media", params], queryFn: () => mediaApi.list(params), select: (r) => r.data, placeholderData: (p) => p });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parent }: { name: string; parent?: string }) => mediaApi.createFolder(name, parent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-folders"] });
      toast.success("Folder created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.deleteFolder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media-folders"] });
      toast.success("Folder deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, folderId }: { files: File[]; folderId?: string }) => mediaApi.upload(files, folderId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success(`${res.data.count} file(s) uploaded`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("File deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
