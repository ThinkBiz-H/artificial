import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  pagesApi,
  faqsApi,
  homeSectionsApi,
  announcementsApi,
  type PageFormValues,
  type HomeSectionFormValues,
  type AnnouncementFormValues,
} from "@/api/cms";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

// Pages
export function usePages(params: { status?: string; keyword?: string } = {}) {
  return useQuery({ queryKey: ["admin-pages", params], queryFn: () => pagesApi.list(params), select: (r) => r.data.pages });
}
export function usePage(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-page", id],
    queryFn: () => pagesApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.page,
  });
}
export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: PageFormValues) => pagesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useUpdatePage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<PageFormValues>) => pagesApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      qc.invalidateQueries({ queryKey: ["admin-page", id] });
      toast.success("Page updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useSetPageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => pagesApi.setStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Page deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// FAQs
export function useFaqs() {
  return useQuery({ queryKey: ["admin-faqs"], queryFn: () => faqsApi.list(), select: (r) => r.data.faqs });
}
export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: { question: string; answer: string; category?: string; sortOrder?: number; isActive?: boolean }) =>
      faqsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<{ question: string; answer: string; category?: string; sortOrder?: number; isActive?: boolean }> }) =>
      faqsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Home sections
export function useHomeSections() {
  return useQuery({ queryKey: ["admin-home-sections"], queryFn: () => homeSectionsApi.list(), select: (r) => r.data.sections });
}
export function useCreateHomeSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: HomeSectionFormValues) => homeSectionsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Section created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useUpdateHomeSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<HomeSectionFormValues> }) => homeSectionsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Section updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useDeleteHomeSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => homeSectionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Section deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Announcements (marquee)
export function useAnnouncements() {
  return useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => announcementsApi.list(),
    select: (r) => r.data.announcements,
  });
}
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: AnnouncementFormValues) => announcementsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<AnnouncementFormValues> }) =>
      announcementsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useReorderAnnouncements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => announcementsApi.reorder(order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
