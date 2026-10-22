import { useMutation, useQueryClient } from "@tanstack/react-query";
import { heroSlidesApi, type HeroSlideFormValues } from "@/api/heroSlides";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useAddSlide(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: HeroSlideFormValues) => heroSlidesApi.create(sectionId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Slide added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateSlide(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slideId, values }: { slideId: string; values: Partial<HeroSlideFormValues> }) =>
      heroSlidesApi.update(sectionId, slideId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Slide updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteSlide(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slideId: string) => heroSlidesApi.remove(sectionId, slideId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
      toast.success("Slide deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReorderSlides(sectionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) => heroSlidesApi.reorder(sectionId, order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-home-sections"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
