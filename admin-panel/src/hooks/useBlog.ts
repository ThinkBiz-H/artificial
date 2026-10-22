import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogApi, type BlogFormValues } from "@/api/blog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useBlogList(params: { keyword?: string; status?: string; category?: string } = {}) {
  return useQuery({ queryKey: ["admin-blogs", params], queryFn: () => blogApi.list(params), select: (r) => r.data.blogs });
}

export function useBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-blog", id],
    queryFn: () => blogApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.blog,
  });
}

export function useBlogCategories() {
  return useQuery({ queryKey: ["admin-blog-categories"], queryFn: () => blogApi.categories(), select: (r) => r.data.categories });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: BlogFormValues) => blogApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("Blog post created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBlog(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<BlogFormValues>) => blogApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      qc.invalidateQueries({ queryKey: ["admin-blog", id] });
      toast.success("Blog post updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useSetBlogStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, publishedAt }: { id: string; status: string; publishedAt?: string }) =>
      blogApi.setStatus(id, status, publishedAt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("Blog post deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCreateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Parameters<typeof blogApi.createCategory>[0]) => blogApi.createCategory(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-categories"] });
      toast.success("Category created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof blogApi.updateCategory>[1] }) =>
      blogApi.updateCategory(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-categories"] });
      toast.success("Category updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.removeCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-categories"] });
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
