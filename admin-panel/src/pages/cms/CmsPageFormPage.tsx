import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { usePage, useCreatePage, useUpdatePage } from "@/hooks/useCms";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Skeleton } from "@/components/ui/Skeleton";

interface FormShape {
  title: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "unpublished";
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}

export function CmsPageFormPage() {
  const params = useParams({ strict: false }) as { pageId?: string };
  const isEdit = !!params.pageId;
  const navigate = useNavigate();

  const { data: page, isLoading } = usePage(params.pageId);
  const createPage = useCreatePage();
  const updatePage = useUpdatePage(params.pageId || "");
  const { register, handleSubmit, reset } = useForm<FormShape>({ defaultValues: { status: "draft", sortOrder: 0 } });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

  useEffect(() => {
    if (page) {
      reset({
        title: page.title,
        content: page.content || "",
        excerpt: page.excerpt || "",
        status: page.status,
        sortOrder: page.sortOrder || 0,
        seoTitle: page.seo?.title || "",
        seoDescription: page.seo?.description || "",
      });
    }
  }, [page, reset]);

  const onSubmit = (values: FormShape) => {
    const payload = {
      title: values.title,
      content: values.content,
      excerpt: values.excerpt || undefined,
      status: values.status,
      sortOrder: values.sortOrder,
      seo: { title: values.seoTitle || undefined, description: values.seoDescription || undefined },
      featuredImage: featuredImage || undefined,
    };
    if (isEdit) updatePage.mutate(payload, { onSuccess: () => navigate({ to: "/cms/pages" }) });
    else createPage.mutate(payload, { onSuccess: () => navigate({ to: "/cms/pages" }) });
  };

  if (isEdit && isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit page" : "New page"}
        action={<Button variant="outline" size="sm" onClick={() => navigate({ to: "/cms/pages" })}><ArrowLeft size={14} /> Back</Button>}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Content" />
            <CardBody className="space-y-4">
              <Input label="Title" required {...register("title", { required: true })} />
              <Textarea label="Excerpt" rows={2} {...register("excerpt")} />
              <Textarea label="Content (HTML supported)" rows={16} {...register("content", { required: true })} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="SEO" />
            <CardBody className="space-y-4">
              <Input label="SEO title" {...register("seoTitle")} />
              <Textarea label="SEO description" rows={2} {...register("seoDescription")} />
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
                <option value="unpublished">Unpublished</option>
              </Select>
              <Input label="Sort order" type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Featured image" />
            <CardBody>
              <ImageUpload value={featuredImage} onChange={(v) => setFeaturedImage(v as File | null)} existingUrl={page?.featuredImage?.url} />
            </CardBody>
          </Card>
          <Button type="submit" size="lg" className="w-full" isLoading={createPage.isPending || updatePage.isPending}>
            {isEdit ? "Save changes" : "Create page"}
          </Button>
        </div>
      </form>
    </div>
  );
}
