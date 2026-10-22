import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Eye, Code2 } from "lucide-react";
import { useBlogPost, useCreateBlog, useUpdateBlog, useBlogCategories } from "@/hooks/useBlog";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { sanitizeBlogHtml } from "@/lib/blogHtml";
import { cn, slugify } from "@/lib/utils";

const ROBOTS = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"];

interface FormShape {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robots: string;
}

/** Blog post editor — plain HTML content with a live preview. */
export function BlogFormPage() {
  const params = useParams({ strict: false }) as { blogId?: string };
  const isEdit = !!params.blogId;
  const navigate = useNavigate();

  const { data: blog, isLoading } = useBlogPost(params.blogId);
  const { data: categories } = useBlogCategories();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog(params.blogId || "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, dirtyFields },
  } = useForm<FormShape>({ defaultValues: { status: "draft", content: "", robots: "index, follow" } });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const content = useWatch({ control, name: "content" });
  const title = useWatch({ control, name: "title" });

  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        slug: blog.slug || "",
        category: typeof blog.category === "object" ? blog.category?._id || "" : blog.category || "",
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        status: blog.status,
        publishedAt: blog.publishedAt ? blog.publishedAt.slice(0, 16) : "",
        metaTitle: blog.seo?.metaTitle || "",
        metaDescription: blog.seo?.metaDescription || "",
        metaKeywords: blog.seo?.metaKeywords || "",
        canonicalUrl: blog.seo?.canonicalUrl || "",
        ogTitle: blog.seo?.ogTitle || "",
        ogDescription: blog.seo?.ogDescription || "",
        ogImage: blog.seo?.ogImage || "",
        robots: blog.seo?.robots || "index, follow",
      });
    }
  }, [blog, reset]);

  // New posts: suggest a slug from the title until the slug is edited by hand.
  useEffect(() => {
    if (!isEdit && !dirtyFields.slug) setValue("slug", slugify(title || ""));
  }, [title, isEdit, dirtyFields.slug, setValue]);

  const onSubmit = (values: FormShape) => {
    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim() || undefined,
      content: sanitizeBlogHtml(values.content),
      excerpt: values.excerpt.trim(),
      category: values.category || undefined,
      status: values.status,
      publishedAt: values.publishedAt || undefined,
      seo: {
        metaTitle: values.metaTitle.trim(),
        metaDescription: values.metaDescription.trim(),
        metaKeywords: values.metaKeywords.trim(),
        canonicalUrl: values.canonicalUrl.trim(),
        ogTitle: values.ogTitle.trim(),
        ogDescription: values.ogDescription.trim(),
        ogImage: values.ogImage.trim(),
        robots: values.robots,
      },
      featuredImage: featuredImage || undefined,
    };
    if (isEdit) {
      updateBlog.mutate(payload, { onSuccess: () => navigate({ to: "/blogs" }) });
    } else {
      createBlog.mutate(payload, { onSuccess: () => navigate({ to: "/blogs" }) });
    }
  };

  if (isEdit && isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit post" : "New post"}
        action={<Button variant="outline" size="sm" onClick={() => navigate({ to: "/blogs" })}><ArrowLeft size={14} /> Back</Button>}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Content" />
            <CardBody className="space-y-4">
              <Input label="Title" required error={errors.title ? "Title is required" : undefined} {...register("title", { required: true })} />
              <Input label="Slug" placeholder="my-post-url" {...register("slug", { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ })} error={errors.slug ? "Use lowercase letters, numbers and hyphens" : undefined} />
              <Textarea label="Short description" rows={2} {...register("excerpt")} />
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">HTML content</p>
                  <div className="flex rounded-lg border border-border p-0.5 text-xs">
                    <button type="button" onClick={() => setPreview(false)} className={cn("flex items-center gap-1 rounded-md px-2 py-1", !preview && "bg-surface font-medium")}>
                      <Code2 size={12} /> HTML
                    </button>
                    <button type="button" onClick={() => setPreview(true)} className={cn("flex items-center gap-1 rounded-md px-2 py-1", preview && "bg-surface font-medium")}>
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                </div>
                {preview ? (
                  <div className="blog-editor">
                  <div
                    className="blog-editor-content min-h-110 rounded-lg border border-border bg-white p-4"
                    // Same sanitizer the save path uses, so the preview matches what is published.
                    dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(content || "") || "<p class='text-muted'>Nothing to preview yet.</p>" }}
                  />
                  </div>
                ) : (
                  <textarea
                    rows={20}
                    spellCheck={false}
                    placeholder="<h2>Heading</h2>\n<p>Write your post in HTML…</p>"
                    className={cn(
                      "w-full rounded-lg border bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-ink",
                      errors.content ? "border-danger" : "border-border",
                    )}
                    {...register("content", { validate: (html) => (!!html && html.trim() !== "") || "Content is required" })}
                  />
                )}
                {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="SEO" description="Leave blank to fall back to the title, short description and featured image." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Meta title" {...register("metaTitle")} />
              <Input label="Meta keywords" placeholder="earrings, bridal, styling" {...register("metaKeywords")} />
              <div className="sm:col-span-2">
                <Textarea label="Meta description" rows={2} {...register("metaDescription")} />
              </div>
              <Input label="Canonical URL" placeholder="https://…" {...register("canonicalUrl")} />
              <Select label="Robots" {...register("robots")}>
                {ROBOTS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              <Input label="OG title" {...register("ogTitle")} />
              <Input label="OG image URL" placeholder="https://…" {...register("ogImage")} />
              <div className="sm:col-span-2">
                <Textarea label="OG description" rows={2} {...register("ogDescription")} />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Publish" />
            <CardBody className="space-y-4">
              <Select label="Status" {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </Select>
              <Input label="Publish date" type="datetime-local" {...register("publishedAt")} />
              <Select label="Category" {...register("category")}>
                <option value="">No category</option>
                {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Featured image" />
            <CardBody>
              <ImageUpload value={featuredImage} onChange={(v) => setFeaturedImage(v as File | null)} existingUrl={blog?.featuredImage?.url} />
            </CardBody>
          </Card>

          <Button type="submit" size="lg" className="w-full" isLoading={createBlog.isPending || updateBlog.isPending}>
            {isEdit ? "Save changes" : "Create post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
